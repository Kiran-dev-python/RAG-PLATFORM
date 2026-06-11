# RAG Platform

A **multi-tenant RAG (Retrieval-Augmented Generation)** document chat platform. Upload documents, create isolated workspaces, and chat with your knowledge base using AI.

---

## Features

- 🔐 **JWT Authentication** — secure multi-tenant user isolation
- 📁 **Workspace Management** — separate knowledge bases per project
- 📄 **Document Upload** — PDF, TXT, MD, DOCX support (up to 20 MB)
- 🧠 **RAG Pipeline** — Sentence Transformers embeddings + ChromaDB vector search
- ⚡ **Fast LLM** — Groq API (LLaMA 3.3 70B) for answer generation
- 🛡️ **Rate Limiting** — 20 requests/min per user
- 📊 **Usage Analytics** — query history, response times, document stats
- 🗄️ **PostgreSQL** — production-grade relational database with Alembic migrations
- 🐳 **Docker** ready

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI 0.115, SQLAlchemy 2.0, asyncpg |
| Database | PostgreSQL + Alembic migrations |
| Auth | JWT (python-jose, passlib/bcrypt) |
| Embeddings | Sentence Transformers `all-MiniLM-L6-v2` |
| Vector DB | ChromaDB 0.5 (persistent, local) |
| LLM | Groq API (`llama-3.3-70b-versatile`) |
| Frontend | React 18, Vite 6, Zustand, React Router |
| Document parsing | pypdf, python-docx |

---

## Project Structure

```
RAG-PLATFORM/
├── backend/
│   ├── alembic/               # DB migration scripts
│   │   ├── versions/          # Migration files
│   │   └── env.py             # Alembic environment configuration
│   ├── app/
│   │   ├── api/               # FastAPI routers/endpoints
│   │   ├── core/              # Config, database, security, auth utilities
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Business logic, RAG pipeline, embeddings, vector store
│   │   ├── utils/             # Common helper functions and utilities
│   │   ├── __init__.py
│   │   └── main.py            # FastAPI application entry point
│   ├── tests/                 # Unit and integration tests
│   ├── .env                   # Environment variables
│   ├── .gitignore
│   ├── alembic.ini            # Alembic configuration
│   └── __init__.py
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── store/
│   ├── .env
│   ├── vite.config.js
│   └── Dockerfile
└── README.md
```

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (running locally)
- Groq API key → [console.groq.com](https://console.groq.com) (free)

---

### 1. Database — Create PostgreSQL DB

```sql
CREATE DATABASE "RAG";
```

---

### 2. Backend

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit backend/.env (see Environment Variables section below)

# Start the server (migrations run automatically on startup)
uvicorn app.main:app --reload
# API →  http://localhost:8000
# Docs → http://localhost:8000/docs


### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# App → http://localhost:5173
```

> **Both servers must run at the same time** — open two terminals.

---

## Environment Variables

### Backend — `backend/.env`

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@localhost:5432/RAG

# JWT
SECRET_KEY=change-me-to-a-long-random-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# ChromaDB (vector store — folder created automatically on first upload)
CHROMA_PERSIST_DIR=./chroma_db

# Embeddings
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Rate Limiting
RATE_LIMIT_REQUESTS=20
RATE_LIMIT_WINDOW=60

# File Upload
MAX_FILE_SIZE_MB=20

# Groq LLM
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Environment
APP_ENV=development
```

### Frontend — `frontend/.env`

```env
# Leave empty for local dev — Vite proxy forwards /api → localhost:8000
# Set to your deployed backend URL for production
VITE_API_URL=
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, receive JWT |
| GET | `/api/auth/me` | Current user info |
| GET | `/api/workspaces/` | List all workspaces |
| POST | `/api/workspaces/` | Create workspace |
| DELETE | `/api/workspaces/{id}` | Delete workspace |
| POST | `/api/documents/{ws_id}/upload` | Upload document (PDF/TXT/MD/DOCX) |
| GET | `/api/documents/{ws_id}` | List documents in workspace |
| DELETE | `/api/documents/{ws_id}/{doc_id}` | Delete document |
| POST | `/api/chat/{ws_id}` | RAG query — chat with documents |
| GET | `/api/chat/{ws_id}/history` | Query history |
| GET | `/api/stats/` | Usage statistics |
| GET | `/api/health` | Health check |

Interactive API docs available at `http://localhost:8000/docs`

---

## How the RAG Pipeline Works

```
User uploads PDF/DOCX/TXT
        ↓
Document text extracted (pypdf / python-docx)
        ↓
Text split into chunks
        ↓
Chunks embedded → all-MiniLM-L6-v2 (384-dim vectors)
        ↓
Vectors stored in ChromaDB (per-workspace collection)
        ↓
User asks a question
        ↓
Question embedded → similarity search in ChromaDB
        ↓
Top-k relevant chunks retrieved
        ↓
Chunks + question sent to Groq (LLaMA 3.3 70B)
        ↓
Answer returned to user ✅
```

---

## Multi-Tenancy & Security

Each user's data is fully isolated:
- Database rows filtered by `user_id` on every query
- ChromaDB uses **separate collections per workspace**
- JWT tokens tied to `user_id` — no cross-user data access possible
- Rate limiting per authenticated user (20 req/min)

---

## Docker

```bash
# Build and run both services
docker-compose up --build

# Set GROQ_API_KEY and DATABASE_URL in your environment or a root .env file
```

---

## Get a Groq API Key (Free)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free tier available)
3. Navigate to **API Keys** → **Create new key**
4. Copy the key and paste it into `backend/.env` as `GROQ_API_KEY`
