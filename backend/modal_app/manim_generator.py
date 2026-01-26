"""Modal serverless function for generating Manim videos"""

import os
import uuid
import subprocess
import re
import shutil
import json
from pathlib import Path
from typing import Dict, Any, Tuple
import modal

# Create Modal app
app = modal.App("manim-video-generator")

# Define container image with all system dependencies for Manim
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install([
        "libcairo2-dev",
        "libpango1.0-dev", 
        "ffmpeg",
        "sox",  # Audio processing for voiceover
        "texlive",
        "texlive-latex-extra",
        "texlive-fonts-extra",
        "texlive-latex-recommended",
        "texlive-science",
        "tipa",
        "libpangocairo-1.0-0",
    ])
    .pip_install([
        "manim==0.18.0",
        "openai==1.66.1",
        "supabase==2.9.0",
        "manim-voiceover",
    ])
)

# Create network file system for temporary video storage
volume = modal.Volume.from_name("manim-output", create_if_missing=True)


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    slug = text.lower().strip()
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'[^a-z0-9\-]', '', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug


def generate_short_id() -> str:
    """Generate a short ID (first 8 characters of UUID)"""
    return str(uuid.uuid4())[:8]


async def classify_question(question: str, openai_api_key: str) -> Tuple[str, str]:
    """Classify question into category and topic using OpenAI"""
    from openai import OpenAI
    
    client = OpenAI(api_key=openai_api_key)
    
    categories_and_topics = """
Math Categories and Topics:
- Algebra: Linear equations in one variable, Linear functions, Linear equations in two variables, Systems of two linear equations in two variables, Linear inequalities in one or two variables
- Advanced Math: Equivalent expressions, Nonlinear equations in one variable and systems of equations in two variables, Nonlinear functions
- Problem-Solving and Data Analysis: Percentages, Ratios rates proportional relationships and units, One-variable data Distributions and measures of center and spread, Two-variable data Models and scatterplots, Probability and conditional probability, Inference from sample statistics and margin of error, Evaluating statistical claims Observational studies and experiments
- Geometry and Trigonometry: Area and volume, Lines angles and triangles, Circles, Right triangles and trigonometry
"""

    prompt = f"""Classify the following SAT math question into the most appropriate category and topic.

{categories_and_topics}

Question: {question}

Respond with ONLY a JSON object in this exact format:
{{
  "category": "Category Name",
  "topic": "Topic Name"
}}

Use the exact category and topic names from the list above. If the question doesn't clearly fit, choose the closest match."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a SAT math question classifier. Return only valid JSON, no explanations.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_completion_tokens=100,
        )

        result = json.loads(response.choices[0].message.content.strip())
        category_slug = slugify(result.get("category", "general"))
        topic_slug = slugify(result.get("topic", "general"))
        
        return category_slug, topic_slug

    except Exception as e:
        print(f"Error classifying question: {str(e)}")
        return "general", "general"


async def generate_manim_code(question: str, openai_api_key: str, previous_error: str = None) -> str:
    """Use OpenAI to convert natural language question to Manim code"""
    from openai import OpenAI
    
    client = OpenAI(api_key=openai_api_key)
    
    error_context = ""
    if previous_error:
        error_context = f"""

IMPORTANT - Previous attempt failed with this error:
{previous_error}

Please fix the error in your code generation. Common issues:
- Do NOT use font_size parameter in Tex() or MathTex() - use .scale() method instead
- Use MathTex() for mathematical formulas, not Tex()
- Ensure all LaTeX syntax is correct
- Example: formula = MathTex(r"\\frac{{a}}{{b}}").scale(0.8)
"""

    prompt = f"""You are an expert SAT Math tutor creating engaging educational videos using Manim.

Convert the following math question into a complete Manim scene that explains the concept clearly.

Question: {question}
{error_context}
Requirements:
1. Create a class that inherits from VoiceoverScene
2. Import ONLY these: from manim import *, from manim_voiceover import VoiceoverScene
3. DO NOT import VoiceoverService - it is already defined at the top of the file and ready to use
4. In construct(), call: self.set_speech_service(VoiceoverService())
5. Wrap animations in: with self.voiceover(text="...") as tracker:
6. Use Text() for text, MathTex() for formulas
7. Use .scale() method, NOT font_size parameter
8. Use appropriate colors and visual elements
9. Make it educational and easy to understand
10. Keep animations concise (20-40 seconds)
11. IMPORTANT - Spatial positioning: Use .next_to(obj, direction, buff=0.5) for relative positioning, .to_edge(direction) for screen edges, .to_corner(UL/UR/DL/DR) for corners. Always use buff parameter to control spacing and avoid crowding.
12. CRITICAL - Frame boundaries: ALL elements must stay within the visible frame. Scale down text/objects if needed to fit. Standard text sizes: title=1.5, subtitle=1.0, body=0.8. Use .scale() to ensure nothing is cut off.
13. CRITICAL - Text management: Never overlap text. Use self.play(FadeOut(old_text)) to remove previous text before adding new text. Use VGroup() to group related elements for easier positioning and removal. Keep the scene clean.

TTS Pronunciation Guidelines (IMPORTANT - for voiceover text):
- Write "S.A.T." (with periods) instead of "SAT" so it's spelled out
- For coordinates like (1, 1), say "the point one one" not "one comma one"
- For fractions like 1/2, say "one half" not "one slash two"
- Spell out acronyms with periods: "G.P.A.", "A.P."
- Write algebraic expressions phonetically: "2x + 3" as "two x plus three"
- Avoid reading punctuation literally in spoken text

SAT-Specific Guidelines:
- Mention this is a common question on the S.A.T. when introducing the concept
- End with: "Want to master more S.A.T. math? Check out our practice questions."
- Keep the tone encouraging and student-friendly

Return ONLY the Python code, starting with "from manim import *" and ending with the class definition.
Do not include any explanations or markdown formatting, just the code."""

    try:
        response = client.chat.completions.create(
            model="gpt-5.2",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert Manim code generator. Return only valid Python code, no explanations.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_completion_tokens=2000,
        )

        code = response.choices[0].message.content.strip()

        # Clean up code (remove markdown code blocks if present)
        if code.startswith("```python"):
            code = code[9:]
        elif code.startswith("```"):
            code = code[3:]
        if code.endswith("```"):
            code = code[:-3]
        code = code.strip()

        return code

    except Exception as e:
        print(f"Error generating Manim code: {str(e)}")
        raise Exception(f"Failed to generate Manim code: {str(e)}")


def execute_manim(scene_file: Path, scene_id: str, output_dir: Path, openai_api_key: str) -> Path:
    """Execute Manim to generate video from scene file"""
    
    # Extract class name from file
    code = scene_file.read_text()
    class_name = None
    for line in code.split("\n"):
        if "class " in line and ("(VoiceoverScene)" in line or "(Scene)" in line):
            class_name = line.split("class ")[1].split("(")[0].strip()
            break

    if not class_name:
        raise Exception("Could not find Scene or VoiceoverScene class in generated code")

    # Run manim command
    cmd = [
        "manim",
        "render",
        "-ql",  # low quality for faster generation
        str(scene_file),
        class_name,
    ]

    # Set up environment with OPENAI_API_KEY
    env = os.environ.copy()
    env['OPENAI_API_KEY'] = openai_api_key
    env['PYTHONPATH'] = str(output_dir)

    result = subprocess.run(
        cmd,
        cwd=str(output_dir),
        env=env,
        capture_output=True,
        text=True,
        timeout=120,
    )

    if result.returncode != 0:
        print(f"Manim error output: {result.stderr}")
        raise Exception(f"Manim execution failed: {result.stderr}")

    # Find the generated video file
    scene_video_dir = output_dir / "media" / "videos" / f"scene_{scene_id}" / "480p15"

    video_path = None
    if scene_video_dir.exists():
        mp4_files = list(scene_video_dir.glob("*.mp4"))
        if mp4_files:
            video_path = mp4_files[0]

    if not video_path or not video_path.exists():
        raise Exception(f"Video file not found after generation. Checked: {scene_video_dir}")

    return video_path


async def upload_to_supabase(
    video_path: Path,
    scene_id: str,
    category_slug: str,
    topic_slug: str,
    short_id: str,
    supabase_url: str,
    supabase_service_key: str,
) -> str:
    """Upload video to Supabase Storage"""
    from supabase import create_client
    
    try:
        # Create service role client
        client = create_client(supabase_url, supabase_service_key)

        # Read video file
        with open(video_path, "rb") as f:
            video_content = f.read()

        # Upload to Supabase Storage
        storage_path = f"{category_slug}/{topic_slug}/{short_id}.mp4"
        bucket = client.storage.from_("manim-videos")

        bucket.upload(
            storage_path,
            video_content,
            {
                "content-type": "video/mp4",
                "cache-control": "public, max-age=31536000",
            },
        )

        # Get public URL
        video_url = bucket.get_public_url(storage_path)

        return video_url

    except Exception as e:
        print(f"Error uploading to storage: {str(e)}")
        raise Exception(f"Failed to upload video to Supabase Storage: {str(e)}")


@app.function(
    image=image,
    secrets=[modal.Secret.from_name("manim-secrets")],
    timeout=180,  # 3 minutes timeout
    volumes={"/tmp/manim_output": volume},
)
async def generate_video(question: str, max_retries: int = 3) -> Dict[str, Any]:
    """
    Generate a Manim video from a natural language math question.
    
    Args:
        question: Natural language question
        max_retries: Maximum number of retry attempts
        
    Returns:
        Dictionary with video URL and metadata
    """
    # Get secrets from Modal environment
    openai_api_key = os.environ["OPENAI_API_KEY"]
    supabase_url = os.environ["SUPABASE_URL"]
    supabase_service_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    
    try:
        # Classify question
        category_slug, topic_slug = await classify_question(question, openai_api_key)
        print(f"Classified question: category={category_slug}, topic={topic_slug}")
        
        # Set up output directory
        output_dir = Path("/tmp/manim_output")
        output_dir.mkdir(exist_ok=True, parents=True)
        
        # Generate and execute with retry logic
        last_error = None
        video_path = None
        scene_id = None
        short_id = None
        
        for attempt in range(max_retries):
            try:
                print(f"Attempt {attempt + 1}/{max_retries} to generate video for: {question}")
                
                # Generate Manim code
                manim_code = await generate_manim_code(question, openai_api_key, previous_error=last_error)
                
                # Generate IDs
                short_id = generate_short_id()
                scene_id = str(uuid.uuid4())
                
                # Create VoiceoverService inline in the code
                voiceover_service_code = """
from openai import OpenAI
from manim_voiceover.services.base import SpeechService
from pathlib import Path

class VoiceoverService(SpeechService):
    def __init__(self, voice: str = "alloy", model: str = "tts-1", **kwargs):
        self.client = OpenAI()
        self.voice = voice
        self.model = model
        SpeechService.__init__(self, transcription_model=None, **kwargs)
    
    def generate_from_text(self, text: str, cache_dir: str = None, path: str = None, **kwargs):
        if cache_dir is None:
            cache_dir = self.cache_dir
        
        input_data = {
            "input_text": text,
            "service": "openai_tts",
            "voice": self.voice,
            "model": self.model,
        }
        
        cached_result = self.get_cached_result(input_data, cache_dir)
        if cached_result is not None:
            return cached_result
        
        if path is None:
            audio_path = self.get_audio_basename(input_data) + ".mp3"
        else:
            audio_path = path
        
        output_path = Path(cache_dir) / audio_path
        
        try:
            response = self.client.audio.speech.create(
                model=self.model,
                voice=self.voice,
                input=text,
            )
            response.stream_to_file(str(output_path))
        except Exception as e:
            raise Exception(f"OpenAI TTS generation failed: {str(e)}")
        
        json_dict = {
            "input_text": text,
            "input_data": input_data,
            "original_audio": audio_path,
            "word_boundaries": None,
        }
        
        return json_dict
"""
                
                # Prepend VoiceoverService to the generated code
                full_code = voiceover_service_code + "\n\n" + manim_code
                
                # Write code to file
                scene_file = output_dir / f"scene_{scene_id}.py"
                scene_file.write_text(full_code)
                
                # Execute Manim
                video_path = execute_manim(scene_file, scene_id, output_dir, openai_api_key)
                
                if not video_path or not video_path.exists():
                    raise Exception("Video file not found after generation")
                
                print(f"Video generated successfully on attempt {attempt + 1}")
                break
                
            except Exception as e:
                last_error = str(e)
                print(f"Generation attempt {attempt + 1} failed: {last_error}")
                
                if attempt < max_retries - 1:
                    continue
                else:
                    raise Exception(f"Failed to generate video after {max_retries} attempts. Last error: {last_error}")
        
        # Upload to Supabase
        video_url = await upload_to_supabase(
            video_path,
            scene_id,
            category_slug,
            topic_slug,
            short_id,
            supabase_url,
            supabase_service_key,
        )
        
        # Clean up local files
        try:
            if video_path.exists():
                video_path.unlink()
            scene_dir = video_path.parent.parent.parent
            if scene_dir.exists() and scene_dir.name.startswith("scene_"):
                shutil.rmtree(scene_dir)
            print(f"Cleaned up local files for scene {scene_id}")
        except Exception as cleanup_error:
            print(f"Warning: Could not clean up local files: {cleanup_error}")
        
        return {
            "success": True,
            "videoUrl": video_url,
            "video_url": video_url,
            "sceneId": scene_id,
            "question": question,
            "isCached": False,
            "category": category_slug,
            "topic": topic_slug,
        }
        
    except Exception as e:
        print(f"Error generating Manim video: {str(e)}")
        raise Exception(f"Failed to generate video: {str(e)}")


# For local testing
@app.local_entrypoint()
def main(question: str = "How do you solve a system of linear equations?"):
    """Test the video generation locally"""
    result = generate_video.remote(question)
    print(f"Video generated: {result['videoUrl']}")

