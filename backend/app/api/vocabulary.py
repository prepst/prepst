from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from uuid import UUID
from app.core.auth import get_current_user, get_authenticated_client
from app.services.vocabulary_service import vocabulary_service

router = APIRouter(prefix="/vocabulary", tags=["vocabulary"])


# Request/Response Models
class VocabularyWord(BaseModel):
    id: UUID
    user_id: UUID
    word: str
    definition: str
    example_usage: Optional[str] = None
    context_sentence: Optional[str] = None
    session_question_id: Optional[UUID] = None
    source: Literal["practice_session", "manual", "suggested"]
    is_mastered: bool
    created_at: str
    updated_at: str


class PopularVocabWord(BaseModel):
    id: UUID
    word: str
    definition: str
    example_usage: Optional[str] = None
    frequency_rank: int
    difficulty_level: Literal["E", "M", "H"]


class AddVocabManualRequest(BaseModel):
    word: str = Field(..., min_length=1, max_length=100)
    definition: str = Field(..., min_length=1)
    example_usage: Optional[str] = None


class AddVocabFromSelectionRequest(BaseModel):
    word: str = Field(..., min_length=1, max_length=100)
    context_sentence: Optional[str] = None
    session_question_id: Optional[UUID] = None


class AddVocabFromPopularRequest(BaseModel):
    word: str = Field(..., min_length=1, max_length=100)
    definition: str = Field(..., min_length=1)
    example_usage: Optional[str] = None


class UpdateVocabRequest(BaseModel):
    is_mastered: Optional[bool] = None
    definition: Optional[str] = None
    example_usage: Optional[str] = None


class VocabularyListResponse(BaseModel):
    words: List[VocabularyWord]
    total: int


class PopularVocabListResponse(BaseModel):
    words: List[PopularVocabWord]
    total: int


@router.get("/", response_model=VocabularyListResponse)
async def get_user_vocabulary(
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_authenticated_client),
    mastered: Optional[bool] = Query(None, description="Filter by mastered status"),
    source: Optional[Literal["practice_session", "manual", "suggested"]] = Query(None, description="Filter by source"),
    search: Optional[str] = Query(None, description="Search by word"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Get the user's vocabulary words with optional filters.
    """
    try:
        query = db.table("vocabulary_words").select("*", count="exact").eq("user_id", user_id)
        
        if mastered is not None:
            query = query.eq("is_mastered", mastered)
        
        if source is not None:
            query = query.eq("source", source)
        
        if search:
            query = query.ilike("word", f"%{search}%")
        
        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        return VocabularyListResponse(
            words=result.data or [],
            total=result.count or 0
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch vocabulary: {str(e)}"
        )


@router.post("/", response_model=VocabularyWord)
async def add_vocab_manually(
    request: AddVocabManualRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_authenticated_client)
):
    """
    Add a new vocabulary word manually with user-provided definition.
    """
    try:
        # Check if word already exists for this user (case-insensitive)
        existing = db.table("vocabulary_words").select("id").eq("user_id", user_id).ilike("word", request.word).execute()
        
        if existing.data and len(existing.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Word '{request.word}' already exists in your vocabulary"
            )
        
        # Insert new vocabulary word
        result = db.table("vocabulary_words").insert({
            "user_id": user_id,
            "word": request.word.strip().lower(),
            "definition": request.definition,
            "example_usage": request.example_usage,
            "source": "manual",
            "is_mastered": False
        }).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create vocabulary word"
            )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add vocabulary word: {str(e)}"
        )


@router.post("/from-selection", response_model=VocabularyWord)
async def add_vocab_from_selection(
    request: AddVocabFromSelectionRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_authenticated_client)
):
    """
    Add a vocabulary word from text selection with AI-generated definition.
    """
    try:
        # Check if word already exists for this user
        existing = db.table("vocabulary_words").select("id").eq("user_id", user_id).ilike("word", request.word).execute()
        
        if existing.data and len(existing.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Word '{request.word}' already exists in your vocabulary"
            )
        
        # Generate definition using AI
        ai_result = await vocabulary_service.generate_word_definition(
            word=request.word,
            context_sentence=request.context_sentence
        )
        
        # Insert new vocabulary word
        result = db.table("vocabulary_words").insert({
            "user_id": user_id,
            "word": request.word.strip().lower(),
            "definition": ai_result.get("definition", "Definition not available"),
            "example_usage": ai_result.get("example_usage"),
            "context_sentence": request.context_sentence,
            "session_question_id": str(request.session_question_id) if request.session_question_id else None,
            "source": "practice_session",
            "is_mastered": False
        }).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create vocabulary word"
            )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add vocabulary word: {str(e)}"
        )


@router.post("/from-popular", response_model=VocabularyWord)
async def add_vocab_from_popular(
    request: AddVocabFromPopularRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_authenticated_client)
):
    """
    Add a vocabulary word from the popular SAT vocab list.
    """
    try:
        # Check if word already exists for this user
        existing = db.table("vocabulary_words").select("id").eq("user_id", user_id).ilike("word", request.word).execute()
        
        if existing.data and len(existing.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Word '{request.word}' already exists in your vocabulary"
            )
        
        # Insert new vocabulary word
        result = db.table("vocabulary_words").insert({
            "user_id": user_id,
            "word": request.word.strip().lower(),
            "definition": request.definition,
            "example_usage": request.example_usage,
            "source": "suggested",
            "is_mastered": False
        }).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create vocabulary word"
            )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add vocabulary word: {str(e)}"
        )


@router.patch("/{word_id}", response_model=VocabularyWord)
async def update_vocab_word(
    word_id: UUID,
    request: UpdateVocabRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_authenticated_client)
):
    """
    Update a vocabulary word (toggle mastered, edit definition, etc.).
    """
    try:
        # Build update data
        update_data = {}
        if request.is_mastered is not None:
            update_data["is_mastered"] = request.is_mastered
        if request.definition is not None:
            update_data["definition"] = request.definition
        if request.example_usage is not None:
            update_data["example_usage"] = request.example_usage
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        result = db.table("vocabulary_words").update(update_data).eq("id", str(word_id)).eq("user_id", user_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vocabulary word not found"
            )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update vocabulary word: {str(e)}"
        )


@router.delete("/{word_id}")
async def delete_vocab_word(
    word_id: UUID,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_authenticated_client)
):
    """
    Delete a vocabulary word.
    """
    try:
        result = db.table("vocabulary_words").delete().eq("id", str(word_id)).eq("user_id", user_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vocabulary word not found"
            )
        
        return {"success": True, "deleted_id": str(word_id)}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete vocabulary word: {str(e)}"
        )


@router.get("/popular", response_model=PopularVocabListResponse)
async def get_popular_vocabulary(
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_authenticated_client),
    difficulty: Optional[Literal["E", "M", "H"]] = Query(None, description="Filter by difficulty"),
    search: Optional[str] = Query(None, description="Search by word"),
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Get popular SAT vocabulary words.
    """
    try:
        query = db.table("popular_sat_vocab").select("*", count="exact")
        
        if difficulty is not None:
            query = query.eq("difficulty_level", difficulty)
        
        if search:
            query = query.ilike("word", f"%{search}%")
        
        result = query.order("frequency_rank").range(offset, offset + limit - 1).execute()
        
        return PopularVocabListResponse(
            words=result.data or [],
            total=result.count or 0
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch popular vocabulary: {str(e)}"
        )
