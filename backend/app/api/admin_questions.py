"""
Admin Question Management API
Endpoints for managing questions in the question bank
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from app.core.auth import get_current_user, get_authenticated_client, is_admin
from typing import List, Dict, Optional, Any
from pydantic import BaseModel


router = APIRouter(prefix="/admin/questions", tags=["admin-questions"])


class QuestionUpdate(BaseModel):
    """Model for updating question fields"""
    correct_answer: Optional[List[str]] = None
    acceptable_answers: Optional[List[str]] = None
    is_active: Optional[bool] = None
    difficulty: Optional[str] = None
    topic_id: Optional[str] = None
    rationale: Optional[str] = None


class BulkUpdate(BaseModel):
    """Model for bulk updating questions"""
    question_ids: List[str]
    updates: Dict[str, Any]


@router.get("/stats")
async def get_question_stats(
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_authenticated_client)
):
    """
    Get question bank statistics for admin dashboard.
    Admin only endpoint.
    """
    try:
        user_is_admin = await is_admin(user_id, db)

        if not user_is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Fetch all questions with pagination
        all_questions = []
        offset = 0
        page_size = 1000

        while True:
            result = db.table('questions').select('*').range(offset, offset + page_size - 1).execute()
            all_questions.extend(result.data)
            if len(result.data) < page_size:
                break
            offset += page_size

        # Calculate stats
        total = len(all_questions)
        active = sum(1 for q in all_questions if q.get('is_active'))
        inactive = total - active
        math_count = sum(1 for q in all_questions if q.get('module') == 'math')
        english_count = sum(1 for q in all_questions if q.get('module') == 'english')

        # Count by difficulty
        difficulty_counts = {'E': 0, 'M': 0, 'H': 0}
        for q in all_questions:
            diff = q.get('difficulty')
            if diff in difficulty_counts:
                difficulty_counts[diff] += 1

        # Quality checks
        empty_answers = sum(1 for q in all_questions if not q.get('correct_answer') or len(q.get('correct_answer', [])) == 0)
        missing_rationale = sum(1 for q in all_questions if not q.get('rationale'))

        return {
            'total_questions': total,
            'active_questions': active,
            'inactive_questions': inactive,
            'math_questions': math_count,
            'english_questions': english_count,
            'by_difficulty': difficulty_counts,
            'empty_answers': empty_answers,
            'missing_rationale': missing_rationale
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting question stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve question stats: {str(e)}"
        )


@router.get("")
async def list_questions(
    search: Optional[str] = Query(None, description="Search in question stem"),
    module: Optional[str] = Query(None, description="Filter by module (math/english)"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (E/M/H)"),
    question_type: Optional[str] = Query(None, description="Filter by type (mc/spr)"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    topic_id: Optional[str] = Query(None, description="Filter by topic ID"),
    has_empty_answers: Optional[bool] = Query(None, description="Filter questions with empty answers"),
    limit: int = Query(20, description="Number of results per page", ge=1, le=100),
    offset: int = Query(0, description="Offset for pagination", ge=0),
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_authenticated_client)
):
    """
    List questions with filters and pagination.
    Admin only endpoint.
    """
    try:
        user_is_admin = await is_admin(user_id, db)

        if not user_is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Build query - get questions with topic info
        query = db.table('questions').select(
            '*, topics(id, name, categories(id, name))'
        )

        # Apply filters
        if module:
            query = query.eq('module', module)

        if difficulty:
            query = query.eq('difficulty', difficulty)

        if question_type:
            query = query.eq('question_type', question_type)

        if is_active is not None:
            query = query.eq('is_active', is_active)

        if topic_id:
            query = query.eq('topic_id', topic_id)

        # Note: For search, we use Postgres text search operators for better performance
        # ilike is faster than fetching all rows and filtering in Python

        if search:
            # Use database-level text search with ilike (case-insensitive LIKE)
            # Search in stem OR external_id
            search_pattern = f"%{search}%"

            # Apply search at database level using OR condition
            query = query.or_(
                f"stem.ilike.{search_pattern},external_id.ilike.{search_pattern}"
            )

        # Apply empty answers filter at database level if needed
        if has_empty_answers is not None:
            # For empty answers, we still need Python filtering since it's JSONB array length check
            # But we can optimize by only fetching limited results first
            pass

        # Execute query with pagination
        result = query.order('created_at', desc=True).range(offset, offset + limit - 1).execute()
        questions = result.data

        # Post-process for has_empty_answers if needed (only on current page, not all questions)
        if has_empty_answers is not None:
            if has_empty_answers:
                questions = [q for q in questions if not q.get('correct_answer') or len(q.get('correct_answer', [])) == 0]
            else:
                questions = [q for q in questions if q.get('correct_answer') and len(q.get('correct_answer', [])) > 0]

        # Get total count (approximate - faster than exact count for large tables)
        # For search queries, we get approximate count by just using the filter count
        count_query = db.table('questions').select('id', count='exact')

        # Apply same filters to count query
        if module:
            count_query = count_query.eq('module', module)
        if difficulty:
            count_query = count_query.eq('difficulty', difficulty)
        if question_type:
            count_query = count_query.eq('question_type', question_type)
        if is_active is not None:
            count_query = count_query.eq('is_active', is_active)
        if topic_id:
            count_query = count_query.eq('topic_id', topic_id)
        if search:
            search_pattern = f"%{search}%"
            count_query = count_query.or_(
                f"stem.ilike.{search_pattern},external_id.ilike.{search_pattern}"
            )

        count_result = count_query.execute()
        total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)

        return {
            'questions': questions,
            'total': total_count,
            'limit': limit,
            'offset': offset,
            'has_more': offset + len(questions) < total_count
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error listing questions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list questions: {str(e)}"
        )


@router.get("/{question_id}")
async def get_question_detail(
    question_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_authenticated_client)
):
    """
    Get full question details including usage statistics.
    Admin only endpoint.
    """
    try:
        user_is_admin = await is_admin(user_id, db)

        if not user_is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Get question with topic/category info
        result = db.table('questions').select(
            '*, topics(id, name, categories(id, name, section))'
        ).eq('id', question_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found"
            )

        question = result.data[0]

        # Get usage stats from session_questions
        session_usage = db.table('session_questions').select(
            'status'
        ).eq('question_id', question_id).execute()

        # Get usage stats from mock_exam_questions
        mock_usage = db.table('mock_exam_questions').select(
            'is_correct'
        ).eq('question_id', question_id).execute()

        # Calculate usage stats
        total_session_uses = len(session_usage.data)
        session_correct = sum(1 for q in session_usage.data if q.get('status') == 'correct')

        total_mock_uses = len(mock_usage.data)
        mock_correct = sum(1 for q in mock_usage.data if q.get('is_correct') is True)

        total_uses = total_session_uses + total_mock_uses
        total_correct = session_correct + mock_correct
        accuracy = (total_correct / total_uses * 100) if total_uses > 0 else 0

        question['usage_stats'] = {
            'total_uses': total_uses,
            'session_uses': total_session_uses,
            'mock_uses': total_mock_uses,
            'accuracy': round(accuracy, 1)
        }

        return question

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting question detail: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get question detail: {str(e)}"
        )


@router.patch("/{question_id}")
async def update_question(
    question_id: str,
    updates: QuestionUpdate,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_authenticated_client)
):
    """
    Update question fields.
    Admin only endpoint.
    """
    try:
        user_is_admin = await is_admin(user_id, db)

        if not user_is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Build update dict (only include fields that were provided)
        update_data = {}
        if updates.correct_answer is not None:
            update_data['correct_answer'] = updates.correct_answer
        if updates.acceptable_answers is not None:
            update_data['acceptable_answers'] = updates.acceptable_answers
        if updates.is_active is not None:
            update_data['is_active'] = updates.is_active
        if updates.difficulty is not None:
            update_data['difficulty'] = updates.difficulty
        if updates.topic_id is not None:
            update_data['topic_id'] = updates.topic_id
        if updates.rationale is not None:
            update_data['rationale'] = updates.rationale

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        # Update question
        result = db.table('questions').update(update_data).eq('id', question_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found"
            )

        return {
            'message': 'Question updated successfully',
            'question': result.data[0]
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating question: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update question: {str(e)}"
        )


@router.post("/bulk-update")
async def bulk_update_questions(
    bulk_data: BulkUpdate,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_authenticated_client)
):
    """
    Bulk update multiple questions.
    Admin only endpoint.
    """
    try:
        user_is_admin = await is_admin(user_id, db)

        if not user_is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        if not bulk_data.question_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No question IDs provided"
            )

        if not bulk_data.updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No updates provided"
            )

        # Update all questions
        success_count = 0
        for question_id in bulk_data.question_ids:
            try:
                db.table('questions').update(bulk_data.updates).eq('id', question_id).execute()
                success_count += 1
            except Exception as e:
                print(f"Failed to update question {question_id}: {e}")
                continue

        return {
            'message': f'Successfully updated {success_count} of {len(bulk_data.question_ids)} questions',
            'success_count': success_count,
            'total_requested': len(bulk_data.question_ids)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in bulk update: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk update questions: {str(e)}"
        )
