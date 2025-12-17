# Prep St

AI-powered SAT test preparation platform with adaptive learning analytics and personalized study plans.

## Features

### Study Planning
- Personalized study plan generation based on current/target scores
- Topic distribution by category weights (Math: Algebra 35%, Advanced Math 35%, Problem-Solving 15%, Geometry 15%)
- Daily practice sessions with specific topics and question counts
- Adaptive plan updates based on performance

### Practice Sessions
- Question-based practice with answer submission
- AI-powered feedback generation using OpenAI
- Confidence scoring and time tracking
- Session summaries and mastery improvements
- Drill sessions and revision sessions
- Save/bookmark questions for later review
- Quick practice mode

### Mock Exams
- Full-length SAT mock exams
- Module-based structure (Math, Reading/Writing)
- Break periods between modules
- Detailed results and performance analytics
- Historical exam tracking

### Diagnostic Tests
- Initial assessment to gauge skill levels
- Results-based study plan recommendations
- Performance tracking over time

### Learning Analytics
- Bayesian Knowledge Tracing (BKT) for skill mastery tracking
- Growth curves and skill heatmaps
- Performance snapshots and learning events
- Cognitive efficiency metrics
- Predictive score modeling
- Learning velocity tracking

### User Features
- User profiles with preferences
- Achievement system
- Study streak tracking with freeze/unfreeze
- Progress dashboard with recommendations
- Analytics dashboard
- Admin panel for question management

### Additional Tools
- AI chat assistant
- Manim video generation for explanations
- Notebook for notes
- Mind map visualization
- Admin analytics dashboard

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- React Query (TanStack Query)
- Supabase client
- OpenAI SDK

### Backend
- FastAPI
- Supabase PostgreSQL
- Python 3.10+
- OpenAI API integration
- Pydantic for data validation

## Project Structure

```
.
├── frontend/          # Next.js application
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/       # API route handlers
│   │   ├── models/    # Pydantic models
│   │   ├── services/  # Business logic services
│   │   └── core/      # Core utilities (auth, etc.)
│   └── supabase/
│       └── migrations/ # Database migrations
├── docs/              # Documentation
├── package.json       # Root package.json for monorepo
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- Python 3.10+
- Supabase account
- OpenAI API key (for AI feedback)

### Installation

1. Install root dependencies:
   ```bash
   pnpm install
   ```

2. Set up Frontend:
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. Set up Backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your Supabase and OpenAI credentials
   ```

4. Run database migrations:
   - Execute SQL files in `backend/supabase/migrations/` in order via Supabase SQL Editor

### Running Development Servers

From root directory:
```bash
pnpm dev
```

Or run individually:
```bash
pnpm dev:frontend  # Frontend only
pnpm dev:backend   # Backend only
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Available Scripts

- `pnpm dev` - Run both frontend and backend in parallel
- `pnpm dev:frontend` - Run only frontend
- `pnpm dev:backend` - Run only backend
- `pnpm build` - Build both applications
- `pnpm lint` - Lint both applications

### Type Generation

Generate TypeScript types from backend OpenAPI specification:

```bash
cd frontend
pnpm generate:api-types
```

Regenerate types after:
- Changing Pydantic models in `backend/app/models/`
- Adding/modifying API endpoints
- Updating response structures

Requires backend running on `http://localhost:8000`. Generated types are saved to `frontend/lib/types/api.generated.ts`.

## Environment Variables

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

### Backend (.env)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key
- `OPENAI_API_KEY` - OpenAI API key for AI feedback
- `OPENAI_MODEL` - OpenAI model (default: gpt-4o-mini)
- `API_HOST` - API host (default: 0.0.0.0)
- `API_PORT` - API port (default: 8000)
- `CORS_ORIGINS` - Allowed CORS origins (comma-separated)

## Database Schema

Key tables:
- `categories` - SAT categories with weights
- `topics` - Granular topics within categories
- `study_plans` - User study plans
- `practice_sessions` - Scheduled practice sessions
- `session_questions` - Questions in practice sessions
- `mock_exams` - Mock exam instances
- `diagnostic_tests` - Diagnostic test instances
- `user_skill_mastery` - BKT mastery tracking
- `user_performance_snapshots` - Historical performance
- `learning_events` - Granular event log
- `ai_feedback` - Cached AI feedback
- `user_profiles` - User profile data
- `user_achievements` - Achievement tracking
- `user_streaks` - Streak tracking

See `backend/supabase/migrations/` for complete schema.

## Study Plan Algorithm

1. Calculate practice volume based on score gaps and days available (15-40 questions/day)
2. Distribute questions by category weights
3. Group related topics into sessions (20-40 questions per session)
4. Schedule sessions evenly from start date to test date
5. Interleave Math and Reading/Writing for variety

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Current user

### Study Plans
- `POST /api/study-plans/generate` - Generate study plan
- `GET /api/study-plans/me` - Get user's study plan
- `DELETE /api/study-plans/me` - Delete study plan

### Practice Sessions
- `GET /api/practice-sessions/{session_id}/questions` - Get session questions
- `PATCH /api/practice-sessions/{session_id}/questions/{question_id}` - Submit answer
- `POST /api/practice-sessions/{session_id}/complete` - Complete session
- `POST /api/practice-sessions/create-drill` - Create drill session
- `GET /api/practice-sessions/wrong-answers` - Get wrong answers
- `GET /api/practice-sessions/saved-questions` - Get saved questions

### Mock Exams
- `POST /api/mock-exams/create` - Create mock exam
- `GET /api/mock-exams/` - List mock exams
- `GET /api/mock-exams/{exam_id}` - Get exam details
- `POST /api/mock-exams/{exam_id}/modules/{module_id}/start` - Start module
- `POST /api/mock-exams/{exam_id}/modules/{module_id}/complete` - Complete module
- `GET /api/mock-exams/{exam_id}/results` - Get exam results

### Analytics
- `GET /api/analytics/users/me/growth-curve` - Growth curve data
- `GET /api/analytics/users/me/skill-heatmap` - Skill heatmap
- `GET /api/analytics/users/me/mastery` - Mastery levels
- `GET /api/analytics/admin/mastery-tracking` - Admin mastery tracking
- `GET /api/analytics/learning-velocity` - Learning velocity

### AI Feedback
- `POST /api/ai-feedback/` - Generate feedback
- `POST /api/ai-feedback/chat` - Chat with AI

### Profile
- `GET /api/profile/profile` - Get user profile
- `PATCH /api/profile/profile` - Update profile
- `GET /api/profile/achievements` - Get achievements
- `GET /api/profile/streak` - Get streak data

See `http://localhost:8000/docs` for complete API documentation.

## License

MIT
