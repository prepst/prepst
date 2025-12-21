"""OpenAI TTS service for Manim voiceover"""

import os
from pathlib import Path
from openai import OpenAI
from manim_voiceover.services.base import SpeechService


class VoiceoverService(SpeechService):
    """OpenAI TTS service for generating voiceovers in Manim videos"""

    def __init__(self, voice: str = "alloy", model: str = "tts-1", **kwargs):
        """
        Initialize OpenAI TTS service.

        Args:
            voice: OpenAI voice name (alloy, echo, fable, onyx, nova, shimmer)
            model: TTS model (tts-1 or tts-1-hd)
            **kwargs: Additional arguments passed to SpeechService
        """
        self.client = OpenAI()  # Uses OPENAI_API_KEY from environment
        self.voice = voice
        self.model = model

        # Initialize base service without transcription
        SpeechService.__init__(self, transcription_model=None, **kwargs)

    def generate_from_text(
        self, text: str, cache_dir: str = None, path: str = None, **kwargs
    ):
        """
        Generate speech audio from text using OpenAI TTS.

        Args:
            text: Text to convert to speech
            cache_dir: Directory to cache audio files
            path: Specific path for the output file
            **kwargs: Additional arguments

        Returns:
            dict: Contains audio file path and metadata
        """
        if cache_dir is None:
            cache_dir = self.cache_dir

        # Generate unique filename based on text hash
        input_data = {
            "input_text": text,
            "service": "openai_tts",
            "voice": self.voice,
            "model": self.model,
        }

        cached_result = self.get_cached_result(input_data, cache_dir)
        if cached_result is not None:
            return cached_result

        # Generate audio file path
        if path is None:
            audio_path = self.get_audio_basename(input_data) + ".mp3"
        else:
            audio_path = path

        output_path = Path(cache_dir) / audio_path

        # Call OpenAI TTS API
        try:
            response = self.client.audio.speech.create(
                model=self.model,
                voice=self.voice,
                input=text,
            )

            # Save audio to file
            response.stream_to_file(str(output_path))

        except Exception as e:
            raise Exception(f"OpenAI TTS generation failed: {str(e)}")

        # Return result dictionary
        json_dict = {
            "input_text": text,
            "input_data": input_data,
            "original_audio": audio_path,
            "word_boundaries": None,  # OpenAI TTS doesn't provide word boundaries
        }

        return json_dict
