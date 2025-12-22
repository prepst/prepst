import os
import uuid
import subprocess
import re
import shutil
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
from openai import OpenAI
from supabase import Client, create_client
from app.config import get_settings
from datetime import datetime

settings = get_settings()


class ManimService:
    """Service for generating Manim videos from natural language questions"""

    def __init__(self, db: Optional[Client] = None):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = "gpt-5.2"  # Use GPT-5.2 (thinking mode) for better spatial reasoning
        self.output_dir = Path(__file__).parent.parent.parent / "manim_output"
        self.output_dir.mkdir(exist_ok=True)
        self.db = db

    def _slugify(self, text: str) -> str:
        """Convert text to URL-friendly slug
        
        Example: "Linear functions" -> "linear-functions"
        """
        # Convert to lowercase
        slug = text.lower().strip()
        # Replace spaces and underscores with hyphens
        slug = re.sub(r'[\s_]+', '-', slug)
        # Remove all non-alphanumeric characters except hyphens
        slug = re.sub(r'[^a-z0-9\-]', '', slug)
        # Replace multiple hyphens with single hyphen
        slug = re.sub(r'-+', '-', slug)
        # Remove leading/trailing hyphens
        slug = slug.strip('-')
        return slug

    def _generate_short_id(self) -> str:
        """Generate a short ID (first 8 characters of UUID)"""
        return str(uuid.uuid4())[:8]

    async def _classify_question(self, question: str) -> Tuple[str, str]:
        """Classify question into category and topic using OpenAI
        
        Returns:
            Tuple of (category_slug, topic_slug)
            Example: ("algebra", "linear-functions")
        """
        # List of SAT Math categories and topics
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
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Use cheaper model for classification
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

            import json
            result = json.loads(response.choices[0].message.content.strip())
            
            category_slug = self._slugify(result.get("category", "general"))
            topic_slug = self._slugify(result.get("topic", "general"))
            
            return category_slug, topic_slug

        except Exception as e:
            print(f"Error classifying question: {str(e)}")
            # Fallback to general category/topic
            return "general", "general"

    async def generate_video_from_question(
        self, question: str, user_id: Optional[str] = None, max_retries: int = 3
    ) -> Dict[str, Any]:
        """
        Generate a Manim video from a natural language math question.
        Retries with error feedback if generation fails.

        Args:
            question: Natural language question (e.g., "How to find slope?")
            user_id: Optional user ID (not used, kept for API compatibility)
            max_retries: Maximum number of retry attempts (default: 3)

        Returns:
            Dictionary with video URL and metadata
        """
        try:
            # Classify question into category and topic
            category_slug, topic_slug = await self._classify_question(question)
            print(f"Classified question: category={category_slug}, topic={topic_slug}")

            # Generate and execute with retry logic (only for generation errors)
            last_error = None
            video_path = None
            scene_id = None
            short_id = None

            for attempt in range(max_retries):
                try:
                    print(f"Attempt {attempt + 1}/{max_retries} to generate video for: {question}")

                    # Generate Manim code (with error feedback if retrying)
                    manim_code = await self._generate_manim_code(question, previous_error=last_error)

                    # Generate short ID for filename
                    short_id = self._generate_short_id()
                    # Keep full UUID for scene_id (used internally)
                    scene_id = str(uuid.uuid4())

                    # Write code to file
                    scene_file = self.output_dir / f"scene_{scene_id}.py"
                    scene_file.write_text(manim_code)

                    # Execute Manim to generate video
                    video_path = await self._execute_manim(scene_file, scene_id)

                    if not video_path or not video_path.exists():
                        raise Exception("Video file not found after generation")

                    # Successfully generated video - break out of retry loop
                    print(f"Video generated successfully on attempt {attempt + 1}")
                    break

                except Exception as e:
                    last_error = str(e)
                    print(f"Generation attempt {attempt + 1} failed: {last_error}")

                    if attempt < max_retries - 1:
                        # We have more attempts, continue to retry
                        continue
                    else:
                        # Last attempt failed, raise the error
                        raise Exception(f"Failed to generate video after {max_retries} attempts. Last error: {last_error}")

            # Video generated successfully - now upload (no retry for upload errors)
            video_url = await self._upload_to_storage(
                video_path, 
                scene_id, 
                user_id,
                category_slug=category_slug,
                topic_slug=topic_slug,
                short_id=short_id
            )

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

    async def _upload_to_storage(
        self, 
        video_path: Path, 
        scene_id: str, 
        user_id: Optional[str] = None,
        category_slug: str = "general",
        topic_slug: str = "general",
        short_id: str = None
    ) -> str:
        """
        Upload video to Supabase Storage and clean up local files.
        Uses service role key to bypass RLS policies.
        
        Storage path structure: {category_slug}/{topic_slug}/{short_id}.mp4
        Example: algebra/linear-functions/a3f9b2c1.mp4

        Args:
            video_path: Path to the video file
            scene_id: Unique scene identifier (full UUID, used internally)
            user_id: Optional user ID
            category_slug: Category slug (e.g., "algebra")
            topic_slug: Topic slug (e.g., "linear-functions")
            short_id: Short ID for filename (e.g., "a3f9b2c1")

        Returns:
            Public URL of the uploaded video

        Raises:
            Exception: If Supabase Storage upload fails
        """
        try:
            # Generate short ID if not provided
            if not short_id:
                short_id = self._generate_short_id()

            # Create service role client to bypass RLS (admin-only feature)
            service_client = create_client(
                settings.supabase_url,
                settings.supabase_service_role_key
            )

            # Read video file
            with open(video_path, "rb") as f:
                video_content = f.read()

            # Upload to Supabase Storage with organized path structure
            # Format: {category_slug}/{topic_slug}/{short_id}.mp4
            storage_path = f"{category_slug}/{topic_slug}/{short_id}.mp4"
            bucket = service_client.storage.from_("manim-videos")

            # Upload file (bucket should already exist from migration)
            result = bucket.upload(
                storage_path,
                video_content,
                {
                    "content-type": "video/mp4",
                    "cache-control": "public, max-age=31536000",  # 1 year cache
                },
            )

            # Get public URL
            video_url = bucket.get_public_url(storage_path)

            # Clean up local files after successful upload
            try:
                # Delete the video file
                if video_path.exists():
                    video_path.unlink()

                # Delete the entire scene directory to clean up all artifacts
                scene_dir = video_path.parent.parent.parent  # Go up to scene_xxx directory
                if scene_dir.exists() and scene_dir.name.startswith("scene_"):
                    shutil.rmtree(scene_dir)
                    print(f"Cleaned up local files for scene {scene_id}")
            except Exception as cleanup_error:
                # Don't fail if cleanup fails - video is already uploaded
                print(f"Warning: Could not clean up local files: {cleanup_error}")

            return video_url

        except Exception as e:
            print(f"Error uploading to storage: {str(e)}")
            raise Exception(f"Failed to upload video to Supabase Storage: {str(e)}")

    async def _generate_manim_code(self, question: str, previous_error: Optional[str] = None) -> str:
        """Use OpenAI to convert natural language question to Manim code

        Args:
            question: Natural language math question
            previous_error: Error from previous attempt, if retrying

        Returns:
            Generated Manim Python code
        """

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
2. Import: from manim import *, from manim_voiceover import VoiceoverScene, from app.services.openai_voiceover import VoiceoverService
3. In construct(), call: self.set_speech_service(VoiceoverService())
4. Wrap animations in: with self.voiceover(text="...") as tracker:
5. Use Text() for text, MathTex() for formulas
6. Use .scale() method, NOT font_size parameter
7. Use appropriate colors and visual elements
8. Make it educational and easy to understand
9. Keep animations concise (20-40 seconds)
10. IMPORTANT - Spatial positioning: Carefully position elements to avoid overlap. Use positioning methods like .next_to(), .to_edge(), .shift(), and .move_to() to create clean, well-organized layouts. Plan the vertical and horizontal spacing between elements before placing them.

SAT-Specific Guidelines:
- Mention this is a common question on the SAT when introducing the concept
- End with: "Want to master more SAT math? Check out our practice questions."
- Keep the tone encouraging and student-friendly

Return ONLY the Python code, starting with "from manim import *" and ending with the class definition.
Do not include any explanations or markdown formatting, just the code."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert Manim code generator. Return only valid Python code, no explanations.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_completion_tokens=2000,  # GPT-5 uses max_completion_tokens instead of max_tokens
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

    async def _execute_manim(
        self, scene_file: Path, scene_id: str
    ) -> Optional[Path]:
        """Execute Manim to generate video from scene file"""

        try:
            # Check if manim is available
            try:
                import manim
            except ImportError:
                raise Exception(
                    "Manim is not available in this environment. "
                    "Manim requires system dependencies (pangocairo, cairo, ffmpeg) "
                    "that are not available in serverless environments. "
                    "Please use a dedicated server or Docker container for video generation."
                )

            # Extract class name from file
            code = scene_file.read_text()
            class_name = None
            for line in code.split("\n"):
                # Look for VoiceoverScene or Scene
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

            # Set up environment to include backend directory in Python path
            env = os.environ.copy()
            backend_dir = str(Path(__file__).parent.parent.parent)
            env['PYTHONPATH'] = backend_dir + os.pathsep + env.get('PYTHONPATH', '')

            result = subprocess.run(
                cmd,
                cwd=str(self.output_dir),
                env=env,
                capture_output=True,
                text=True,
                timeout=120,  # 2 minute timeout
            )

            if result.returncode != 0:
                print(f"Manim error output: {result.stderr}")
                raise Exception(f"Manim execution failed: {result.stderr}")

            # Find the generated video file
            scene_video_dir = (
                self.output_dir / "media" / "videos" / f"scene_{scene_id}" / "480p15"
            )

            video_path = None
            if scene_video_dir.exists():
                mp4_files = list(scene_video_dir.glob("*.mp4"))
                if mp4_files:
                    video_path = mp4_files[0]

            if not video_path or not video_path.exists():
                raise Exception(
                    f"Video file not found after generation. Checked: {scene_video_dir}"
                )

            return video_path

        except subprocess.TimeoutExpired:
            raise Exception("Video generation timed out")
        except Exception as e:
            print(f"Error executing Manim: {str(e)}")
            raise Exception(f"Failed to execute Manim: {str(e)}")


# Note: This should be instantiated with a db client in the API endpoint
def create_manim_service(db: Client) -> ManimService:
    """Factory function to create ManimService with database client"""
    return ManimService(db=db)
