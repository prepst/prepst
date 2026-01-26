"""
Percent Increase/Decrease - The Multiplier Trick - SAT Math Concept
Duration: ~30 seconds with voiceover

Run with: manim -pql percent_change.py PercentChange
Or high quality: manim -pqh percent_change.py PercentChange
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


class PercentChange(VoiceoverScene):
    def construct(self):
        self.set_speech_service(VoiceoverService())
        
        # Title
        title = Text("Percent Change: The Multiplier Trick", font_size=36, color=BLUE)
        title.to_edge(UP, buff=0.4)
        
        with self.voiceover(text="Here's a fast trick for percent increase and decrease on the S.A.T."):
            self.play(Write(title), run_time=1.2)
        
        # The rules
        increase_rule = MathTex(r"\text{Increase by } 25\% \rightarrow \times 1.25", font_size=38)
        increase_rule[0][0:11].set_color(GREEN)
        
        decrease_rule = MathTex(r"\text{Decrease by } 25\% \rightarrow \times 0.75", font_size=38)
        decrease_rule[0][0:11].set_color(RED)
        
        rules = VGroup(increase_rule, decrease_rule).arrange(DOWN, buff=0.5)
        rules.next_to(title, DOWN, buff=0.6)
        
        with self.voiceover(text="To increase by twenty-five percent, multiply by one point two five. To decrease by twenty-five percent, multiply by zero point seven five."):
            self.play(Write(increase_rule), run_time=1.2)
            self.play(Write(decrease_rule), run_time=1.2)
            self.wait(0.3)
        
        # Clear for example
        self.play(FadeOut(rules), run_time=0.5)
        
        # Example
        example = Text("A $80 item is 30% off. What's the price?", font_size=32)
        example.next_to(title, DOWN, buff=0.6)
        
        with self.voiceover(text="Example: An eighty dollar item is thirty percent off. What's the sale price?"):
            self.play(Write(example), run_time=1.0)
            self.wait(0.3)
        
        # Solution
        step1 = MathTex(r"30\% \text{ off} \rightarrow \times 0.70", font_size=38)
        step1.next_to(example, DOWN, buff=0.5)
        
        with self.voiceover(text="Thirty percent off means multiply by zero point seven zero."):
            self.play(Write(step1), run_time=0.8)
            self.wait(0.3)
        
        # Calculate
        calc = MathTex(r"\$80 \times 0.70 = \$56", font_size=42, color=GREEN)
        calc.next_to(step1, DOWN, buff=0.4)
        
        answer_box = SurroundingRectangle(calc, color=GREEN, buff=0.15)
        
        with self.voiceover(text="Eighty times zero point seven zero equals fifty-six dollars. That's it!"):
            self.play(Write(calc), run_time=0.8)
            self.play(Create(answer_box), run_time=0.5)
            self.wait(0.5)
        
        # Closing
        self.play(
            FadeOut(title), FadeOut(example), FadeOut(step1),
            FadeOut(calc), FadeOut(answer_box),
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
