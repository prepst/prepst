from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.openai_service import openai_service
from typing import List, Dict, Any, Optional
import json
import asyncio

router = APIRouter(prefix="/ai-feedback", tags=["ai-feedback"])

class AIFeedbackRequest(BaseModel):
    question_stem: str
    question_type: str
    correct_answer: List[str]
    user_answer: List[str]
    is_correct: bool
    topic_name: str
    user_performance_context: Dict[str, int]

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = None

@router.post("/", response_model=Dict[str, Any])
async def get_ai_feedback(request: AIFeedbackRequest):
    """
    Get AI-generated feedback for a practice question.

    Args:
        request: Feedback request with question details and user performance

    Returns:
        AI-generated feedback including explanation, hints, and learning points
    """
    try:
        # Generate feedback using OpenAI service
        feedback_dict = await openai_service.generate_answer_feedback(
            question_stem=request.question_stem,
            question_type=request.question_type,
            correct_answer=request.correct_answer,
            user_answer=request.user_answer,
            is_correct=request.is_correct,
            topic_name=request.topic_name,
            user_performance_context=request.user_performance_context
        )

        return {
            "success": True,
            "feedback": feedback_dict
        }

    except Exception as e:
        print(f"Error generating AI feedback: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI feedback: {str(e)}"
        )

@router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """
    Chat with AI assistant for study help and guidance.
    Returns a streaming response for real-time chat.

    Args:
        request: Chat request with message and optional conversation history

    Returns:
        Streaming response with AI-generated chat tokens
    """
    async def generate_stream():
        try:
            # Convert conversation history to the format expected by OpenAI
            conversation_history = []
            if request.conversation_history:
                for msg in request.conversation_history:
                    conversation_history.append({
                        "role": msg.role,
                        "content": msg.content
                    })

            # Prepare messages for OpenAI
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
                "content": request.message
            })

            # Stream response from OpenAI
            from app.config import get_settings
            settings = get_settings()
            from openai import OpenAI
            client = OpenAI(api_key=settings.openai_api_key)

            stream = client.chat.completions.create(
                model=settings.openai_model,
                messages=messages,
                temperature=0.7,
                max_tokens=settings.openai_max_tokens,
                stream=True  # Enable streaming
            )

            # Yield chunks as they arrive
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    # Send as Server-Sent Events format
                    yield f"data: {json.dumps({'content': content, 'done': False})}\n\n"
                    await asyncio.sleep(0)  # Yield control to event loop

            # Send completion signal
            yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"

        except Exception as e:
            print(f"Error in streaming chat: {str(e)}")
            error_data = json.dumps({
                "error": f"Failed to generate chat response: {str(e)}",
                "done": True
            })
            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable buffering in nginx
        }
    )
