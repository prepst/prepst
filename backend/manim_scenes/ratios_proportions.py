"""
Ratios and Proportions - SAT Math Concept
Duration: ~30 seconds with voiceover

Run with: manim -pql ratios_proportions.py RatiosProportions
Or high quality: manim -pqh ratios_proportions.py RatiosProportions
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


class RatiosProportions(VoiceoverScene):
    def construct(self):
        self.set_speech_service(VoiceoverService())
        
        # Title
        title = Text("Ratios and Proportions", font_size=42, color=BLUE)
        title.to_edge(UP, buff=0.4)
        
        with self.voiceover(text="Let's master ratios and proportions for the S.A.T."):
            self.play(Write(title), run_time=1.0)
        
        # The key concept
        concept = MathTex(r"\frac{a}{b} = \frac{c}{d} \quad \Rightarrow \quad ad = bc", font_size=42)
        concept.next_to(title, DOWN, buff=0.5)
        
        cross_label = Text("Cross Multiply", font_size=24, color=YELLOW)
        cross_label.next_to(concept, DOWN, buff=0.3)
        
        with self.voiceover(text="When two ratios are equal, cross multiply. A over b equals c over d means a times d equals b times c."):
            self.play(Write(concept), run_time=1.2)
            self.play(Write(cross_label), run_time=0.5)
            self.wait(0.3)
        
        # Clear for example
        self.play(FadeOut(concept), FadeOut(cross_label), run_time=0.5)
        
        # Word problem
        problem = Text("If 3 pencils cost $1.20,\nhow much do 7 pencils cost?", font_size=30, line_spacing=1.3)
        problem.next_to(title, DOWN, buff=0.5)
        
        with self.voiceover(text="Example: If three pencils cost one dollar twenty, how much do seven pencils cost?"):
            self.play(Write(problem), run_time=1.2)
            self.wait(0.3)
        
        # Set up proportion
        proportion = MathTex(r"\frac{3}{1.20} = \frac{7}{x}", font_size=42)
        proportion.next_to(problem, DOWN, buff=0.5)
        
        with self.voiceover(text="Set up the proportion: three over one twenty equals seven over x."):
            self.play(Write(proportion), run_time=1.0)
            self.wait(0.3)
        
        # Solve
        solve = MathTex(r"3x = 8.40 \quad \Rightarrow \quad x = \$2.80", font_size=38)
        solve.next_to(proportion, DOWN, buff=0.4)
        
        answer_box = SurroundingRectangle(solve, color=GREEN, buff=0.15)
        
        with self.voiceover(text="Cross multiply: three x equals eight forty. So x equals two dollars and eighty cents."):
            self.play(Write(solve), run_time=1.0)
            self.play(Create(answer_box), run_time=0.5)
            self.wait(0.5)
        
        # Closing
        self.play(
            FadeOut(title), FadeOut(problem), FadeOut(proportion),
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
