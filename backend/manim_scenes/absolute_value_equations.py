"""
Absolute Value Equations - SAT Math Concept
Duration: ~30 seconds with voiceover

Run with: manim -pql absolute_value_equations.py AbsoluteValueEquations
Or high quality: manim -pqh absolute_value_equations.py AbsoluteValueEquations
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


class AbsoluteValueEquations(VoiceoverScene):
    def construct(self):
        self.set_speech_service(VoiceoverService())
        
        # Title
        title = Text("Absolute Value Equations", font_size=42, color=BLUE)
        title.to_edge(UP, buff=0.5)
        
        with self.voiceover(text="Let's learn about absolute value equations, a common topic on the S.A.T."):
            self.play(Write(title), run_time=1.5)
        
        # Definition
        definition = Text("| x | = distance from zero", font_size=32)
        definition.next_to(title, DOWN, buff=0.5)
        
        with self.voiceover(text="The absolute value of a number represents its distance from zero on the number line."):
            self.play(FadeIn(definition), run_time=1.0)
            self.wait(1.5)
        
        # Number line visualization
        number_line = NumberLine(
            x_range=[-5, 5, 1],
            length=8,
            include_numbers=True,
            font_size=24
        )
        number_line.next_to(definition, DOWN, buff=1.5)
        
        self.play(Create(number_line), run_time=1.0)
        
        # Show |3| = 3 (distance from 0 to 3)
        dot_3 = Dot(number_line.n2p(3), color=YELLOW)
        dot_0 = Dot(number_line.n2p(0), color=WHITE)
        
        brace_right = BraceBetweenPoints(
            number_line.n2p(0), 
            number_line.n2p(3),
            direction=UP,
            color=YELLOW
        )
        label_3 = MathTex(r"|3| = 3", color=YELLOW, font_size=28)
        label_3.next_to(brace_right, UP, buff=0.1)
        
        with self.voiceover(text="For example, the absolute value of three is three, because three is three units away from zero."):
            self.play(
                FadeIn(dot_0),
                FadeIn(dot_3),
                GrowFromCenter(brace_right),
                Write(label_3),
                run_time=1.2
            )
            self.wait(1.0)
        
        # Show |-3| = 3 (same distance!)
        dot_neg3 = Dot(number_line.n2p(-3), color=GREEN)
        brace_left = BraceBetweenPoints(
            number_line.n2p(-3),
            number_line.n2p(0),
            direction=UP,
            color=GREEN
        )
        label_neg3 = MathTex(r"|-3| = 3", color=GREEN, font_size=28)
        label_neg3.next_to(brace_left, UP, buff=0.1)
        
        with self.voiceover(text="Similarly, the absolute value of negative three is also three. Same distance, different direction."):
            self.play(
                FadeIn(dot_neg3),
                GrowFromCenter(brace_left),
                Write(label_neg3),
                run_time=1.2
            )
            self.wait(1.0)
        
        # Clear and show the key insight
        self.play(
            FadeOut(number_line),
            FadeOut(dot_0), FadeOut(dot_3), FadeOut(dot_neg3),
            FadeOut(brace_right), FadeOut(brace_left),
            FadeOut(label_3), FadeOut(label_neg3),
            FadeOut(definition),
            run_time=0.8
        )
        
        # Key Rule
        rule = MathTex(
            r"|x| = a", r"\quad\Rightarrow\quad", 
            r"x = a", r"\text{ or }", r"x = -a",
            font_size=40
        )
        rule[0].set_color(BLUE)
        rule[2].set_color(YELLOW)
        rule[4].set_color(GREEN)
        rule.next_to(title, DOWN, buff=0.6)
        
        with self.voiceover(text="This gives us the key rule: if the absolute value of x equals a, then x can be positive a, or negative a."):
            self.play(Write(rule), run_time=1.5)
            self.wait(1.0)
        
        # Example problem
        example_label = Text("Example:", font_size=28, color=WHITE)
        example_label.next_to(rule, DOWN, buff=0.6)
        example_label.align_to(rule, LEFT).shift(LEFT * 0.5)
        
        problem = MathTex(r"|x - 3| = 5", font_size=38, color=BLUE)
        problem.next_to(example_label, RIGHT, buff=0.3)
        
        with self.voiceover(text="Let's solve an example. If the absolute value of x minus three equals five."):
            self.play(Write(example_label), Write(problem), run_time=1.0)
            self.wait(0.5)
        
        # Solution steps
        step1 = MathTex(r"x - 3 = 5", r"\quad\text{or}\quad", r"x - 3 = -5", font_size=34)
        step1[0].set_color(YELLOW)
        step1[2].set_color(GREEN)
        step1.next_to(problem, DOWN, buff=0.5)
        step1.shift(RIGHT * 0.5)
        
        with self.voiceover(text="We split this into two equations: x minus three equals five, or x minus three equals negative five."):
            self.play(Write(step1), run_time=1.2)
            self.wait(0.5)
        
        # Final answers
        step2 = MathTex(r"x = 8", r"\quad\text{or}\quad", r"x = -2", font_size=34)
        step2[0].set_color(YELLOW)
        step2[2].set_color(GREEN)
        step2.next_to(step1, DOWN, buff=0.4)
        
        box1 = SurroundingRectangle(step2[0], color=YELLOW, buff=0.1)
        box2 = SurroundingRectangle(step2[2], color=GREEN, buff=0.1)
        
        with self.voiceover(text="Solving each equation, we get x equals eight, or x equals negative two. These are our two solutions!"):
            self.play(Write(step2), run_time=0.8)
            self.play(Create(box1), Create(box2), run_time=0.6)
            self.wait(1.0)
        
        # Closing - fade out content and show URL
        self.play(
            FadeOut(title),
            FadeOut(rule),
            FadeOut(example_label),
            FadeOut(problem),
            FadeOut(step1),
            FadeOut(step2),
            FadeOut(box1),
            FadeOut(box2),
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
