"""
Similar Triangles and Proportional Sides - SAT Math Concept
Duration: ~30 seconds with voiceover

Run with: manim -pql similar_triangles.py SimilarTriangles
Or high quality: manim -pqh similar_triangles.py SimilarTriangles
"""

from manim import *
from manim_voiceover import VoiceoverScene
from manim_voiceover.services.base import SpeechService
from openai import OpenAI
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend directory
load_dotenv(Path(__file__).parent.parent / ".env")


class VoiceoverService(SpeechService):
    """OpenAI TTS service for generating voiceovers"""

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

        response = self.client.audio.speech.create(
            model=self.model,
            voice=self.voice,
            input=text,
        )
        response.stream_to_file(str(output_path))

        return {
            "input_text": text,
            "input_data": input_data,
            "original_audio": audio_path,
            "word_boundaries": None,
        }


class SimilarTriangles(VoiceoverScene):
    def construct(self):
        self.set_speech_service(VoiceoverService())
        
        # Title
        title = Text("Similar Triangles", font_size=44, color=BLUE)
        title.to_edge(UP, buff=0.4)
        
        with self.voiceover(text="Similar triangles have proportional sides. Here's how to use them on the S.A.T."):
            self.play(Write(title), run_time=1.2)
        
        # Draw two similar triangles
        small_tri = Polygon(
            [-2.5, -0.5, 0], [-1.5, 1, 0], [-0.5, -0.5, 0],
            color=YELLOW, fill_opacity=0.3
        )
        big_tri = Polygon(
            [0.5, -1, 0], [2, 2, 0], [3.5, -1, 0],
            color=GREEN, fill_opacity=0.3
        )
        
        # Labels for small triangle
        small_a = MathTex("3", font_size=28).next_to(small_tri, LEFT, buff=0.1)
        small_b = MathTex("4", font_size=28).next_to(small_tri, DOWN, buff=0.1)
        small_c = MathTex("5", font_size=28).next_to(small_tri, UP, buff=0.1).shift(RIGHT * 0.3)
        
        # Labels for big triangle
        big_a = MathTex("6", font_size=28).next_to(big_tri, LEFT, buff=0.1)
        big_b = MathTex("8", font_size=28).next_to(big_tri, DOWN, buff=0.1)
        big_x = MathTex("x", font_size=28, color=RED).next_to(big_tri, UP, buff=0.1).shift(RIGHT * 0.3)
        
        triangles = VGroup(small_tri, big_tri, small_a, small_b, small_c, big_a, big_b, big_x)
        triangles.next_to(title, DOWN, buff=0.5)
        
        with self.voiceover(text="Here are two similar triangles. The small one has sides three, four, and five. The big one has sides six, eight, and x."):
            self.play(Create(small_tri), Create(big_tri), run_time=1.0)
            self.play(
                Write(small_a), Write(small_b), Write(small_c),
                Write(big_a), Write(big_b), Write(big_x),
                run_time=1.0
            )
            self.wait(0.3)
        
        # Set up proportion
        proportion = MathTex(r"\frac{3}{6} = \frac{5}{x}", font_size=42)
        proportion.next_to(triangles, DOWN, buff=0.5)
        
        with self.voiceover(text="Set up a proportion: three over six equals five over x."):
            self.play(Write(proportion), run_time=1.0)
            self.wait(0.3)
        
        # Cross multiply and solve
        solve = MathTex(r"3x = 30 \quad \Rightarrow \quad x = 10", font_size=40)
        solve.next_to(proportion, DOWN, buff=0.4)
        
        answer_box = SurroundingRectangle(solve, color=GREEN, buff=0.15)
        
        with self.voiceover(text="Cross multiply: three x equals thirty. So x equals ten."):
            self.play(Write(solve), run_time=1.0)
            self.play(Create(answer_box), run_time=0.5)
            self.wait(0.5)
        
        # Closing
        self.play(
            FadeOut(title), FadeOut(triangles), FadeOut(proportion),
            FadeOut(solve), FadeOut(answer_box),
            run_time=0.7
        )
        
        follow_text = Text("Follow for more SAT tips!", font_size=38, color=WHITE)
        follow_text.move_to(ORIGIN)
        url_text = Text("sat.prepst.com", font_size=32, color=BLUE)
        url_text.next_to(follow_text, DOWN, buff=0.5)
        
        with self.voiceover(text="Follow for more S.A.T. tips! Visit S.A.T. dot Prep Street dot com."):
            self.play(Write(follow_text), run_time=1.0)
            self.play(FadeIn(url_text, shift=UP * 0.3), run_time=0.8)
            self.wait(1.5)
