from openai import OpenAI
from app.config import get_settings
from typing import Dict, List, Any, Optional
import json

settings = get_settings()


class OpenAIService:
    """Service for generating AI-powered feedback using OpenAI API"""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
        self.max_tokens = settings.openai_max_tokens
    
    def _build_feedback_prompt(
        self,
        question_stem: str,
        question_type: str,
        correct_answer: List[str],
        user_answer: List[str],
        is_correct: bool,
        rationale: Optional[str],
        topic_name: str,
        user_performance_context: Dict[str, Any]
    ) -> str:
        """Build a comprehensive prompt for feedback generation"""
        
        # Format answers for display
        correct_answer_str = ", ".join(str(a) for a in correct_answer)
        user_answer_str = ", ".join(str(a) for a in user_answer) if user_answer else "No answer provided"
        
        # Build performance context string
        perf_context = ""
        if user_performance_context:
            topic_correct = user_performance_context.get('topic_correct', 0)
            topic_total = user_performance_context.get('topic_total', 0)
            if topic_total > 0:
                perf_context = f"\n\nStudent's Performance Context:\n- This topic ({topic_name}): {topic_correct}/{topic_total} correct ({int(topic_correct/topic_total*100)}%)"
        
        prompt = f"""You are an expert SAT tutor providing personalized feedback to help students improve.

Question Topic: {topic_name}
Question Type: {"Multiple Choice" if question_type == "mc" else "Student Produced Response"}

Question:
{question_stem}

Correct Answer: {correct_answer_str}
Student's Answer: {user_answer_str}
Result: {"Correct ✓" if is_correct else "Incorrect ✗"}
{perf_context}

{"Official Rationale: " + rationale if rationale else ""}

Please provide feedback in the following JSON format:
{{
    "explanation": "A clear, concise explanation of why the answer is correct/incorrect. Focus on the reasoning and concepts.",
    "hints": ["Hint 1", "Hint 2", "Hint 3"],
    "learning_points": ["Key concept 1", "Key concept 2", "Key concept 3"],
    "key_concepts": ["Concept name 1", "Concept name 2"]
}}

Guidelines:
1. **Explanation**: {"Explain why the student's approach was correct and reinforce the concept." if is_correct else "Identify where the student went wrong without giving away the full solution. Be encouraging."}
2. **Hints**: {"Provide 2-3 additional insights or related concepts to strengthen understanding." if is_correct else "Provide 3-4 strategic hints to guide the student toward the correct approach."}
3. **Learning Points**: List 3-4 key takeaways the student should remember for similar questions.
4. **Key Concepts**: List 2-3 SAT concepts/topics covered in this question.

Be supportive, educational, and concise. Use language appropriate for high school students."""

        return prompt
    
    def _parse_feedback_response(self, response_text: str) -> Dict[str, Any]:
        """Parse the OpenAI response into structured feedback"""
        try:
            # Try to parse as JSON
            feedback = json.loads(response_text)
            
            # Validate required fields
            required_fields = ['explanation', 'hints', 'learning_points', 'key_concepts']
            for field in required_fields:
                if field not in feedback:
                    feedback[field] = [] if field != 'explanation' else "No explanation provided"
            
            # Ensure lists
            for field in ['hints', 'learning_points', 'key_concepts']:
                if not isinstance(feedback[field], list):
                    feedback[field] = [str(feedback[field])]
            
            return feedback
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "explanation": response_text[:300] + "..." if len(response_text) > 300 else response_text,
                "hints": [],
                "learning_points": [],
                "key_concepts": []
            }
    
    async def generate_answer_feedback(
        self,
        question_stem: str,
        question_type: str,
        correct_answer: List[str],
        user_answer: List[str],
        is_correct: bool,
        rationale: Optional[str],
        topic_name: str,
        user_performance_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate personalized feedback using OpenAI"""
        
        # Build the prompt
        prompt = self._build_feedback_prompt(
            question_stem, question_type, correct_answer,
            user_answer, is_correct, rationale, topic_name,
            user_performance_context
        )
        
        # Call OpenAI API
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert SAT tutor who provides clear, concise, and encouraging feedback. Always respond with valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=self.max_tokens,
                response_format={"type": "json_object"}
            )
            
            # Parse and return feedback
            feedback_text = response.choices[0].message.content
            feedback = self._parse_feedback_response(feedback_text)
            
            return feedback
            
        except Exception as e:
            # Return error feedback if API call fails
            print(f"OpenAI API Error: {str(e)}")
            return {
                "explanation": f"Unable to generate AI feedback at this time. {str(e)[:100]}",
                "hints": [],
                "learning_points": [],
                "key_concepts": []
            }

    async def generate_chat_response(
        self,
        message: str,
        conversation_history: List[Dict[str, str]] = None
    ) -> str:
        """Generate a chat response using OpenAI"""

        # Prepare messages
        messages = [
            {
                "role": "system",
                "content": """You are a helpful AI study assistant. You help students with homework, explain concepts, create study plans, and prepare for exams.

Guidelines:
- Be encouraging and supportive
- Explain concepts clearly and step by step
- Use examples when helpful
- Keep responses concise but comprehensive
- Focus on understanding rather than just answers
- Be conversational and friendly

If asked about inappropriate content, politely redirect to educational topics."""
            }
        ]

        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history[-10:])  # Keep last 10 messages for context

        # Add current user message
        messages.append({
            "role": "user",
            "content": message
        })

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=self.max_tokens,
                stream=False  # We'll implement streaming later if needed
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"OpenAI Chat API Error: {str(e)}")
            raise Exception(f"Failed to generate chat response: {str(e)}")

    async def generate_session_summary(
        self,
        session_stats: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a holistic session summary using OpenAI.
        
        Args:
            session_stats: Aggregated session data including:
                - total_questions, correct_count, incorrect_count, accuracy
                - topic_performance: list of {topic_name, correct, total, accuracy}
                - speed_stats: {avg_time_seconds, fast_count, slow_count, total_time}
                - historical_comparison: {topic_name: {current_accuracy, historical_accuracy}}
                - question_details: list of {topic_name, is_correct, time_spent, question_type}
        
        Returns:
            Dict with overall_assessment, strengths, weaknesses, speed_analysis,
            error_patterns, and improvement_tips
        """
        
        # Build summary context
        accuracy = session_stats.get("accuracy", 0)
        total = session_stats.get("total_questions", 0)
        correct = session_stats.get("correct_count", 0)
        incorrect = session_stats.get("incorrect_count", 0)
        
        topic_perf = session_stats.get("topic_performance", [])
        speed_stats = session_stats.get("speed_stats", {})
        historical = session_stats.get("historical_comparison", {})
        question_details = session_stats.get("question_details", [])
        
        # Format topic performance
        topic_summary = ""
        if topic_perf:
            topic_lines = []
            for tp in topic_perf:
                hist = historical.get(tp["topic_name"], {})
                hist_acc = hist.get("historical_accuracy")
                comparison = ""
                if hist_acc is not None:
                    diff = tp["accuracy"] - hist_acc
                    if diff > 5:
                        comparison = f" (↑ improved from {hist_acc:.0f}% historical)"
                    elif diff < -5:
                        comparison = f" (↓ declined from {hist_acc:.0f}% historical)"
                topic_lines.append(f"  - {tp['topic_name']}: {tp['correct']}/{tp['total']} ({tp['accuracy']:.0f}%){comparison}")
            topic_summary = "\n".join(topic_lines)
        
        # Format speed analysis context
        speed_context = ""
        if speed_stats:
            avg_time = speed_stats.get("avg_time_seconds", 0)
            fast = speed_stats.get("fast_count", 0)
            slow = speed_stats.get("slow_count", 0)
            speed_context = f"""
Speed Analysis:
- Average time per question: {avg_time:.1f} seconds
- Questions answered quickly (<30s): {fast}
- Questions taking longer (>90s): {slow}
- Total session time: {speed_stats.get('total_time_minutes', 0):.1f} minutes"""
        
        # Build question details for pattern detection
        incorrect_details = [q for q in question_details if not q.get("is_correct")]
        incorrect_topics = [q["topic_name"] for q in incorrect_details]
        
        prompt = f"""You are an expert SAT tutor analyzing a student's practice session performance.

SESSION OVERVIEW:
- Total Questions: {total}
- Correct: {correct} | Incorrect: {incorrect}
- Accuracy: {accuracy:.1f}%

PERFORMANCE BY TOPIC:
{topic_summary if topic_summary else "No topic data available"}
{speed_context}

INCORRECT ANSWERS BY TOPIC:
{', '.join(incorrect_topics) if incorrect_topics else 'None - perfect score!'}

Please analyze this session and provide feedback in the following JSON format:
{{
    "overall_assessment": "A 2-3 sentence summary of how the session went. Be encouraging but honest about areas needing work.",
    "strengths": ["Topic or skill where student performed well", "Another strength"],
    "weaknesses": ["Topic or skill needing improvement", "Another weakness"],
    "speed_analysis": "One sentence about their pacing - were they rushing, taking appropriate time, or spending too long on questions?",
    "error_patterns": ["Describe any patterns in their mistakes, e.g. 'Struggles with word problems involving rates'", "Another pattern if applicable"],
    "improvement_tips": ["Specific, actionable tip 1", "Specific, actionable tip 2", "Specific, actionable tip 3"]
}}

Guidelines:
1. Be encouraging and supportive, even when pointing out weaknesses
2. Make improvement tips specific and actionable (not generic like "practice more")
3. If accuracy is high (>80%), focus more on optimization and mastery
4. If accuracy is low (<50%), be extra encouraging and focus on foundational tips
5. Relate patterns to common SAT question types when possible
6. Keep each field concise - 1-2 sentences max for text fields, 2-4 items for lists"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert SAT tutor providing holistic session analysis. Always respond with valid JSON. Be encouraging and specific."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=self.max_tokens,
                response_format={"type": "json_object"}
            )
            
            feedback_text = response.choices[0].message.content
            feedback = json.loads(feedback_text)
            
            # Ensure all required fields exist
            required_fields = {
                "overall_assessment": "Session analysis not available.",
                "strengths": [],
                "weaknesses": [],
                "speed_analysis": "Speed data not available.",
                "error_patterns": [],
                "improvement_tips": []
            }
            
            for field, default in required_fields.items():
                if field not in feedback:
                    feedback[field] = default
            
            return feedback
            
        except Exception as e:
            print(f"OpenAI Session Summary API Error: {str(e)}")
            return {
                "overall_assessment": f"Unable to generate AI analysis at this time.",
                "strengths": [],
                "weaknesses": [],
                "speed_analysis": "Speed analysis not available.",
                "error_patterns": [],
                "improvement_tips": ["Review your incorrect answers to identify patterns.", "Focus on understanding the concepts behind each question."]
            }


# Global instance
openai_service = OpenAIService()

