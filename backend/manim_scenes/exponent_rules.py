"""
Exponent Rules - SAT Math Concept
Duration: ~30 seconds with voiceover

Run with: manim -pql exponent_rules.py ExponentRules
Or high quality: manim -pqh exponent_rules.py ExponentRules
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


class ExponentRules(VoiceoverScene):
    def construct(self):
        self.set_speech_service(VoiceoverService())
        
        # Title
        title = Text("Exponent Rules", font_size=44, color=BLUE)
        title.to_edge(UP, buff=0.4)
        
        with self.voiceover(text="Let's master the essential exponent rules for the S.A.T."):
            self.play(Write(title), run_time=1.2)
        
        # Rule 1: Product Rule
        rule1_name = Text("Product Rule:", font_size=28, color=YELLOW)
        rule1 = MathTex(r"x^a \cdot x^b = x^{a+b}", font_size=40)
        rule1_group = VGroup(rule1_name, rule1).arrange(RIGHT, buff=0.4)
        rule1_group.next_to(title, DOWN, buff=0.6)
        
        with self.voiceover(text="Product Rule: When multiplying same bases, add the exponents. X to the a, times x to the b, equals x to the a plus b."):
            self.play(Write(rule1_name), run_time=0.5)
            self.play(Write(rule1), run_time=1.0)
            self.wait(0.5)
        
        # Rule 2: Quotient Rule
        rule2_name = Text("Quotient Rule:", font_size=28, color=GREEN)
        rule2 = MathTex(r"\frac{x^a}{x^b} = x^{a-b}", font_size=40)
        rule2_group = VGroup(rule2_name, rule2).arrange(RIGHT, buff=0.4)
        rule2_group.next_to(rule1_group, DOWN, buff=0.5)
        
        with self.voiceover(text="Quotient Rule: When dividing same bases, subtract the exponents. X to the a, over x to the b, equals x to the a minus b."):
            self.play(Write(rule2_name), run_time=0.5)
            self.play(Write(rule2), run_time=1.0)
            self.wait(0.5)
        
        # Rule 3: Power Rule
        rule3_name = Text("Power Rule:", font_size=28, color=ORANGE)
        rule3 = MathTex(r"(x^a)^b = x^{a \cdot b}", font_size=40)
        rule3_group = VGroup(rule3_name, rule3).arrange(RIGHT, buff=0.4)
        rule3_group.next_to(rule2_group, DOWN, buff=0.5)
        
        with self.voiceover(text="Power Rule: When raising a power to a power, multiply the exponents. X to the a, all to the b, equals x to the a times b."):
            self.play(Write(rule3_name), run_time=0.5)
            self.play(Write(rule3), run_time=1.0)
            self.wait(0.5)
        
        # Clear for special cases
        self.play(
            FadeOut(rule1_group),
            FadeOut(rule2_group),
            FadeOut(rule3_group),
            run_time=0.6
        )
        
        # Special cases
        special_title = Text("Special Cases:", font_size=32, color=WHITE)
        special_title.next_to(title, DOWN, buff=0.5)
        
        zero_rule = MathTex(r"x^0 = 1", font_size=42, color=TEAL)
        neg_rule = MathTex(r"x^{-n} = \frac{1}{x^n}", font_size=42, color=PURPLE)
        
        special_rules = VGroup(zero_rule, neg_rule).arrange(DOWN, buff=0.5)
        special_rules.next_to(special_title, DOWN, buff=0.5)
        
        with self.voiceover(text="Two special cases to remember: Any number to the zero power equals one."):
            self.play(Write(special_title), run_time=0.5)
            self.play(Write(zero_rule), run_time=0.8)
            self.wait(0.3)
        
        with self.voiceover(text="And a negative exponent means one over that power. X to the negative n equals one over x to the n."):
            self.play(Write(neg_rule), run_time=1.0)
            self.wait(0.8)
        
        # Closing - fade out content
        self.play(
            FadeOut(title),
            FadeOut(special_title),
            FadeOut(special_rules),
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
