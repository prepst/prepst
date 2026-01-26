"""
Interpreting Slope and Y-Intercept in Word Problems - SAT Math Concept
Duration: ~30 seconds with voiceover

Run with: manim -pql slope_intercept_word_problems.py SlopeInterceptWordProblems
Or high quality: manim -pqh slope_intercept_word_problems.py SlopeInterceptWordProblems
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


class SlopeInterceptWordProblems(VoiceoverScene):
    def construct(self):
        self.set_speech_service(VoiceoverService())
        
        # Title
        title = Text("Slope & Y-Intercept in Word Problems", font_size=36, color=BLUE)
        title.to_edge(UP, buff=0.4)
        
        with self.voiceover(text="Let's learn how to interpret slope and y-intercept in real-world problems."):
            self.play(Write(title), run_time=1.5)
        
        # The formula
        formula = MathTex(r"y = mx + b", font_size=48)
        formula.next_to(title, DOWN, buff=0.5)
        
        with self.voiceover(text="Remember the slope-intercept form: y equals m x plus b."):
            self.play(Write(formula), run_time=1.0)
            self.wait(0.5)
        
        # Labels for m and b
        m_label = Text("m = slope = rate of change", font_size=24, color=YELLOW)
        b_label = Text("b = y-intercept = starting value", font_size=24, color=GREEN)
        
        labels = VGroup(m_label, b_label).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        labels.next_to(formula, DOWN, buff=0.5)
        
        with self.voiceover(text="M is the slope, which represents the rate of change. B is the y-intercept, which represents the starting value."):
            self.play(FadeIn(m_label), run_time=0.8)
            self.play(FadeIn(b_label), run_time=0.8)
            self.wait(0.5)
        
        # Clear for example
        self.play(
            FadeOut(formula),
            FadeOut(labels),
            run_time=0.6
        )
        
        # Word problem example
        problem_text = Text(
            "A phone plan costs $20 per month\nplus $0.10 per text message.",
            font_size=28,
            line_spacing=1.3
        )
        problem_text.next_to(title, DOWN, buff=0.5)
        
        with self.voiceover(text="Here's an example: A phone plan costs twenty dollars per month, plus ten cents per text message."):
            self.play(Write(problem_text), run_time=1.5)
            self.wait(0.5)
        
        # The equation
        equation = MathTex(r"C = 0.10t + 20", font_size=42)
        equation.next_to(problem_text, DOWN, buff=0.5)
        
        with self.voiceover(text="We can write this as: C equals zero point one zero t, plus twenty."):
            self.play(Write(equation), run_time=1.0)
            self.wait(0.5)
        
        # Highlight slope
        slope_box = SurroundingRectangle(equation[0][2:6], color=YELLOW, buff=0.1)
        slope_meaning = Text("Slope = $0.10 per text", font_size=24, color=YELLOW)
        slope_meaning.next_to(equation, DOWN, buff=0.4)
        
        with self.voiceover(text="The slope, zero point one zero, means each text message costs ten cents."):
            self.play(Create(slope_box), run_time=0.5)
            self.play(Write(slope_meaning), run_time=0.8)
            self.wait(0.5)
        
        # Highlight y-intercept
        intercept_box = SurroundingRectangle(equation[0][7:9], color=GREEN, buff=0.1)
        intercept_meaning = Text("Y-intercept = $20 base cost", font_size=24, color=GREEN)
        intercept_meaning.next_to(slope_meaning, DOWN, buff=0.3)
        
        with self.voiceover(text="The y-intercept, twenty, is the base monthly cost before any texts."):
            self.play(Create(intercept_box), run_time=0.5)
            self.play(Write(intercept_meaning), run_time=0.8)
            self.wait(1.0)
        
        # Closing - fade out content
        self.play(
            FadeOut(title),
            FadeOut(problem_text),
            FadeOut(equation),
            FadeOut(slope_box),
            FadeOut(intercept_box),
            FadeOut(slope_meaning),
            FadeOut(intercept_meaning),
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
