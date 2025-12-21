import os
import uuid
import subprocess
import re
from pathlib import Path
from typing import Dict, Any, Optional, List
from openai import OpenAI
from supabase import Client
from app.config import get_settings

settings = get_settings()


class ManimService:
    """Service for generating Manim videos from natural language questions"""

    def __init__(self, db: Optional[Client] = None):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = "gpt-5.2"  # Use GPT-5.2 (thinking mode) for better spatial reasoning
        self.output_dir = Path(__file__).parent.parent.parent / "manim_output"
        self.output_dir.mkdir(exist_ok=True)
        self.db = db

    def _normalize_question(self, question: str) -> str:
        """Normalize question text for similarity matching"""
        # Convert to lowercase, remove extra spaces, remove punctuation
        normalized = question.lower().strip()
        normalized = re.sub(r'[^\w\s]', '', normalized)
        normalized = re.sub(r'\s+', ' ', normalized)
        return normalized

    async def find_similar_videos(
        self, question: str, similarity_threshold: float = 0.7, max_results: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find similar videos based on question similarity.

        Args:
            question: Natural language question
            similarity_threshold: Minimum similarity score (0-1)
            max_results: Maximum number of results to return

        Returns:
            List of similar videos with similarity scores
        """
        if not self.db:
            return []

        try:
            normalized = self._normalize_question(question)

            # Use the database function to find similar videos
            result = self.db.rpc(
                "find_similar_manim_videos",
                {
                    "search_question": question,
                    "similarity_threshold": similarity_threshold,
                    "max_results": max_results,
                },
            ).execute()

            return result.data or []

        except Exception as e:
            print(f"Error finding similar videos: {str(e)}")
            return []

    async def generate_video_from_question(
        self, question: str, user_id: Optional[str] = None, max_retries: int = 3
    ) -> Dict[str, Any]:
        """
        Generate a Manim video from a natural language math question.
        First checks for similar existing videos to avoid regenerating.
        Retries with error feedback if generation fails.

        Args:
            question: Natural language question (e.g., "How to find slope?")
            user_id: Optional user ID for tracking
            max_retries: Maximum number of retry attempts (default: 3)

        Returns:
            Dictionary with video URL and metadata
        """
        try:
            # Step 1: Check for similar existing videos
            if self.db:
                similar_videos = await self.find_similar_videos(question, similarity_threshold=0.8)
                if similar_videos:
                    # Use the most similar video
                    best_match = similar_videos[0]
                    print(
                        f"Found similar video (similarity: {best_match.get('similarity_score', 0)}): {best_match.get('question')}"
                    )
                    return {
                        "success": True,
                        "videoUrl": best_match["video_url"],
                        "video_url": best_match["video_url"],
                        "sceneId": str(best_match["id"]),
                        "question": question,
                        "isCached": True,
                        "originalQuestion": best_match["question"],
                        "similarityScore": best_match.get("similarity_score", 1.0),
                    }

            # Step 2-5: Generate and execute with retry logic
            last_error = None
            for attempt in range(max_retries):
                try:
                    print(f"Attempt {attempt + 1}/{max_retries} to generate video for: {question}")

                    # Generate Manim code (with error feedback if retrying)
                    manim_code = await self._generate_manim_code(question, previous_error=last_error)

                    # Generate unique scene ID
                    scene_id = str(uuid.uuid4())

                    # Write code to file
                    scene_file = self.output_dir / f"scene_{scene_id}.py"
                    scene_file.write_text(manim_code)

                    # Execute Manim to generate video
                    video_path = await self._execute_manim(scene_file, scene_id)

                    if not video_path or not video_path.exists():
                        raise Exception("Video file not found after generation")

                    # Success! Upload and store
                    video_url = await self._upload_to_storage(video_path, scene_id, user_id)

                    if self.db and user_id:
                        await self._store_video_metadata(
                            question=question,
                            video_url=video_url,
                            storage_path=f"manim-videos/{scene_id}.mp4",
                            scene_id=scene_id,
                            user_id=user_id,
                            file_size=video_path.stat().st_size if video_path.exists() else None,
                        )

                    return {
                        "success": True,
                        "videoUrl": video_url,
                        "video_url": video_url,
                        "sceneId": scene_id,
                        "question": question,
                        "isCached": False,
                        "attempts": attempt + 1,
                    }

                except Exception as e:
                    last_error = str(e)
                    print(f"Attempt {attempt + 1} failed: {last_error}")

                    if attempt < max_retries - 1:
                        # We have more attempts, continue to retry
                        continue
                    else:
                        # Last attempt failed, raise the error
                        raise Exception(f"Failed to generate video after {max_retries} attempts. Last error: {last_error}")

        except Exception as e:
            print(f"Error generating Manim video: {str(e)}")
            raise Exception(f"Failed to generate video: {str(e)}")

    async def _upload_to_storage(
        self, video_path: Path, scene_id: str, user_id: Optional[str] = None
    ) -> str:
        """
        Upload video to Supabase Storage.

        Args:
            video_path: Path to the video file
            scene_id: Unique scene identifier
            user_id: Optional user ID

        Returns:
            Public URL of the uploaded video
        """
        if not self.db:
            # Fallback to local file serving
            return f"/api/manim/videos/{scene_id}.mp4"

        try:
            # Read video file
            with open(video_path, "rb") as f:
                video_content = f.read()

            # Upload to Supabase Storage
            storage_path = f"manim-videos/{scene_id}.mp4"
            bucket = self.db.storage.from_("manim-videos")

            # Create bucket if it doesn't exist (this might fail if bucket exists, that's ok)
            try:
                self.db.storage.create_bucket("manim-videos", {"public": True})
            except:
                pass  # Bucket might already exist

            # Upload file
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
            return video_url

        except Exception as e:
            print(f"Error uploading to storage: {str(e)}")
            # Fallback to local file serving
            return f"/api/manim/videos/{scene_id}.mp4"

    async def _store_video_metadata(
        self,
        question: str,
        video_url: str,
        storage_path: str,
        scene_id: str,
        user_id: str,
        file_size: Optional[int] = None,
    ) -> None:
        """
        Store video metadata in the database.

        Args:
            question: Original question
            video_url: Public URL of the video
            storage_path: Path in Supabase Storage
            scene_id: Unique scene identifier
            user_id: User ID who generated the video
            file_size: Size of the video file in bytes
        """
        if not self.db:
            return

        try:
            normalized_question = self._normalize_question(question)

            self.db.table("manim_videos").insert(
                {
                    "user_id": user_id,
                    "question": question,
                    "question_normalized": normalized_question,
                    "video_url": video_url,
                    "storage_path": storage_path,
                    "scene_id": scene_id,
                    "file_size": file_size,
                }
            ).execute()

        except Exception as e:
            print(f"Error storing video metadata: {str(e)}")
            # Don't fail the whole operation if metadata storage fails

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

        prompt = f"""You are an expert at creating educational math animations using Manim.

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
9. Keep animations concise (under 30 seconds)
10. IMPORTANT - Spatial positioning: Carefully position elements to avoid overlap. Use positioning methods like .next_to(), .to_edge(), .shift(), and .move_to() to create clean, well-organized layouts. Plan the vertical and horizontal spacing between elements before placing them.

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
