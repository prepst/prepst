from openai import OpenAI
from app.config import get_settings
from typing import Dict, Any, Optional
import json

settings = get_settings()


class VocabularyService:
    """Service for generating AI-powered vocabulary definitions and examples"""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
    
    async def generate_word_definition(
        self,
        word: str,
        context_sentence: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a definition and example usage for a vocabulary word.
        
        Args:
            word: The vocabulary word to define
            context_sentence: Optional context sentence where the word was found
        
        Returns:
            Dict with definition and example_usage
        """
        
        context_info = ""
        if context_sentence:
            context_info = f"\n\nContext where the word was found:\n\"{context_sentence}\""
        
        prompt = f"""You are an expert SAT vocabulary tutor. Generate a clear, SAT-appropriate definition and example sentence for the following word.

Word: {word}{context_info}

Please respond with JSON in this format:
{{
    "definition": "A clear, concise definition appropriate for SAT vocabulary level. Focus on the most common meaning used in SAT contexts.",
    "example_usage": "A natural, SAT-style example sentence that demonstrates the word's meaning clearly."
}}

Guidelines:
1. Definition should be 1-2 sentences max, using accessible language
2. Example sentence should sound natural, not contrived
3. If context was provided, consider that meaning when defining
4. Focus on meanings most likely to appear on the SAT
5. Avoid overly technical or obscure definitions"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert SAT vocabulary tutor. Always respond with valid JSON containing 'definition' and 'example_usage' fields."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=300,
                response_format={"type": "json_object"}
            )
            
            result_text = response.choices[0].message.content
            result = json.loads(result_text)
            
            # Validate required fields
            if "definition" not in result:
                result["definition"] = f"A vocabulary word commonly tested on the SAT."
            if "example_usage" not in result:
                result["example_usage"] = f"The student studied the word '{word}' for the SAT."
            
            return result
            
        except Exception as e:
            print(f"OpenAI Vocabulary API Error: {str(e)}")
            return {
                "definition": f"Definition not available. Please try again later.",
                "example_usage": f"Example not available."
            }


# Global instance
vocabulary_service = VocabularyService()
