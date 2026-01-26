"""
Finding the Vertex of a Parabola - SAT Math Concept
Duration: ~30 seconds with voiceover

Run with: manim -pql vertex_of_parabola.py VertexOfParabola
Or high quality: manim -pqh vertex_of_parabola.py VertexOfParabola
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


class VertexOfParabola(VoiceoverScene):
    def construct(self):
        self.set_speech_service(VoiceoverService())
        
        # Title
        title = Text("Finding the Vertex of a Parabola", font_size=36, color=BLUE)
        title.to_edge(UP, buff=0.4)
        
        with self.voiceover(text="Let's learn how to find the vertex of a parabola, a key S.A.T. skill."):
            self.play(Write(title), run_time=1.5)
        
        # Standard form
        standard_form = MathTex(r"y = ax^2 + bx + c", font_size=42)
        standard_form.next_to(title, DOWN, buff=0.5)
        
        with self.voiceover(text="When a quadratic is in standard form, y equals a x squared plus b x plus c."):
            self.play(Write(standard_form), run_time=1.2)
            self.wait(0.5)
        
        # Vertex formula
        vertex_formula = MathTex(r"x = -\frac{b}{2a}", font_size=44, color=YELLOW)
        vertex_formula.next_to(standard_form, DOWN, buff=0.6)
        
        with self.voiceover(text="The x-coordinate of the vertex is found using: x equals negative b over two a."):
            self.play(Write(vertex_formula), run_time=1.2)
            self.wait(0.5)
        
        # Box the formula
        formula_box = SurroundingRectangle(vertex_formula, color=YELLOW, buff=0.15)
        
        with self.voiceover(text="This formula gives you the axis of symmetry and the x value of the vertex."):
            self.play(Create(formula_box), run_time=0.6)
            self.wait(0.5)
        
        # Clear for example
        self.play(
            FadeOut(standard_form),
            FadeOut(vertex_formula),
            FadeOut(formula_box),
            run_time=0.6
        )
        
        # Example
        example = MathTex(r"y = 2x^2 - 8x + 6", font_size=40)
        example.next_to(title, DOWN, buff=0.5)
        
        with self.voiceover(text="Let's try an example: y equals two x squared minus eight x plus six."):
            self.play(Write(example), run_time=1.0)
            self.wait(0.3)
        
        # Identify a and b
        ab_text = MathTex(r"a = 2, \quad b = -8", font_size=36, color=GRAY_A)
        ab_text.next_to(example, DOWN, buff=0.4)
        
        with self.voiceover(text="Here, a equals two, and b equals negative eight."):
            self.play(Write(ab_text), run_time=0.8)
            self.wait(0.3)
        
        # Calculate x
        calc_x = MathTex(r"x = -\frac{-8}{2(2)} = \frac{8}{4} = 2", font_size=38)
        calc_x.next_to(ab_text, DOWN, buff=0.4)
        
        with self.voiceover(text="Plugging in: x equals negative negative eight, over two times two. That's eight over four, which equals two."):
            self.play(Write(calc_x), run_time=1.5)
            self.wait(0.3)
        
        # Find y
        calc_y = MathTex(r"y = 2(2)^2 - 8(2) + 6 = -2", font_size=36)
        calc_y.next_to(calc_x, DOWN, buff=0.4)
        
        with self.voiceover(text="Plug x equals two back in to find y: two times four, minus sixteen, plus six, equals negative two."):
            self.play(Write(calc_y), run_time=1.2)
            self.wait(0.3)
        
        # Final answer
        vertex_answer = MathTex(r"\text{Vertex} = (2, -2)", font_size=40, color=GREEN)
        vertex_answer.next_to(calc_y, DOWN, buff=0.5)
        answer_box = SurroundingRectangle(vertex_answer, color=GREEN, buff=0.15)
        
        with self.voiceover(text="So the vertex is at the point two, negative two."):
            self.play(Write(vertex_answer), run_time=0.8)
            self.play(Create(answer_box), run_time=0.5)
            self.wait(0.8)
        
        # Closing - fade out content
        self.play(
            FadeOut(title),
            FadeOut(example),
            FadeOut(ab_text),
            FadeOut(calc_x),
            FadeOut(calc_y),
            FadeOut(vertex_answer),
            FadeOut(answer_box),
            run_time=0.8
        )
        
        # Closing message
        follow_text = Text("Follow for more SAT tips!", font_size=38, color=WHITE)
        follow_text.move_to(ORIGIN)
        
        url_text = Text("sat.prepst.com", font_size=32, color=BLUE)
        url_text.next_to(follow_text, DOWN, buff=0.5)
        
        with self.voiceover(text="Follow for more S.A.T. tips! Visit S.A.T. dot Prep Street dot com."):
            self.play(Write(follow_text), run_time=1.0)
            self.play(FadeIn(url_text, shift=UP * 0.3), run_time=0.8)
            self.wait(1.5)
