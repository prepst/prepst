"""
Circle Equations - Finding Center and Radius - SAT Math Concept
Duration: ~30 seconds with voiceover

Run with: manim -pql circle_equations.py CircleEquations
Or high quality: manim -pqh circle_equations.py CircleEquations
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


class CircleEquations(VoiceoverScene):
    def construct(self):
        self.set_speech_service(VoiceoverService())
        
        # Title
        title = Text("Circle Equations", font_size=44, color=BLUE)
        title.to_edge(UP, buff=0.4)
        
        with self.voiceover(text="Let's learn how to find the center and radius of a circle from its equation."):
            self.play(Write(title), run_time=1.2)
        
        # Standard form
        standard_form = MathTex(r"(x - h)^2 + (y - k)^2 = r^2", font_size=42)
        standard_form.next_to(title, DOWN, buff=0.5)
        
        with self.voiceover(text="The standard form of a circle is: x minus h squared, plus y minus k squared, equals r squared."):
            self.play(Write(standard_form), run_time=1.2)
            self.wait(0.3)
        
        # Key info
        center_text = MathTex(r"\text{Center} = (h, k)", font_size=36, color=YELLOW)
        radius_text = MathTex(r"\text{Radius} = r", font_size=36, color=GREEN)
        
        info = VGroup(center_text, radius_text).arrange(RIGHT, buff=1.0)
        info.next_to(standard_form, DOWN, buff=0.5)
        
        with self.voiceover(text="The center is at the point h k, and the radius is r."):
            self.play(Write(center_text), Write(radius_text), run_time=1.0)
            self.wait(0.3)
        
        # Clear for example
        self.play(
            FadeOut(standard_form),
            FadeOut(info),
            run_time=0.5
        )
        
        # Example problem
        example = MathTex(r"(x - 3)^2 + (y + 2)^2 = 25", font_size=40)
        example.next_to(title, DOWN, buff=0.6)
        
        with self.voiceover(text="Example: Find the center and radius of x minus three squared, plus y plus two squared, equals twenty-five."):
            self.play(Write(example), run_time=1.2)
            self.wait(0.3)
        
        # Find center
        center_calc = MathTex(r"h = 3, \quad k = -2", font_size=36)
        center_calc.next_to(example, DOWN, buff=0.5)
        
        with self.voiceover(text="From the equation, h equals three. And since it's y plus two, k equals negative two."):
            self.play(Write(center_calc), run_time=1.0)
            self.wait(0.3)
        
        # Find radius
        radius_calc = MathTex(r"r^2 = 25 \quad \Rightarrow \quad r = 5", font_size=36)
        radius_calc.next_to(center_calc, DOWN, buff=0.4)
        
        with self.voiceover(text="R squared is twenty-five, so the radius is five."):
            self.play(Write(radius_calc), run_time=0.8)
            self.wait(0.3)
        
        # Final answers
        center_answer = MathTex(r"\text{Center} = (3, -2)", font_size=38, color=YELLOW)
        radius_answer = MathTex(r"\text{Radius} = 5", font_size=38, color=GREEN)
        
        answers = VGroup(center_answer, radius_answer).arrange(DOWN, buff=0.3)
        answers.next_to(radius_calc, DOWN, buff=0.5)
        
        answer_box = SurroundingRectangle(answers, color=WHITE, buff=0.2)
        
        with self.voiceover(text="So the center is at three, negative two, and the radius is five."):
            self.play(Write(center_answer), Write(radius_answer), run_time=0.8)
            self.play(Create(answer_box), run_time=0.5)
            self.wait(0.5)
        
        # Closing - fade out content
        self.play(
            FadeOut(title),
            FadeOut(example),
            FadeOut(center_calc),
            FadeOut(radius_calc),
            FadeOut(answers),
            FadeOut(answer_box),
            run_time=0.7
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
