# Documentabot

An enterprise documentation assistant that lets teams upload PDF documents and ask questions about them via a conversational chat interface. Answers are grounded exclusively in the uploaded content, with citations back to the source file and page number.

---

## How it works

1. Upload PDFs to the knowledge base — they are chunked and embedded into a vector store (ChromaDB) using OpenAI embeddings.
2. Ask a question in the chatbot — relevant chunks are retrieved and passed to GPT-4o-mini, which answers using only that context.
3. Each answer includes source citations (file name + page number) so you can verify the response.
4. Chats are persisted per user and can be resumed at any time.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript, Vite, React Router |
| Backend | FastAPI (Python) |
| Database | SQLite (users, chats, documents) |
| Vector store | ChromaDB |
| Embeddings | OpenAI `text-embedding-3-small` |
| LLM | OpenAI `gpt-4o-mini` |
| Auth | JWT via HTTP-only cookies |

---

## Project structure

```
Documentabot/
├── backend/
│   ├── main.py          # FastAPI app — auth, document, and chat endpoints
│   ├── rag.py           # PDF ingestion, vector retrieval, LLM answering
│   ├── auth.py          # JWT creation, hashing, cookie helpers
│   ├── database.py      # SQLite connection factory
│   ├── migrate.py       # Schema migrations
│   ├── uploads/         # Stored PDF files
│   └── chroma_db/       # Persisted ChromaDB vector store
└── frontend/
    └── src/
        ├── App.tsx              # Routing and nav shell
        ├── components/
        │   ├── Chatbot.tsx      # Chat UI
        │   ├── KnowledgeBase.tsx # Document management
        │   ├── CitationPanel.tsx # Source citation sidebar
        │   ├── UploadModal.tsx  # PDF upload dialog
        │   ├── Login.tsx / Signup.tsx
        │   └── Landing.tsx
        ├── api.ts               # Typed API client
        ├── context/AuthContext.tsx
        └── types.ts
```

---

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 20+
- An OpenAI API key

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

pip install fastapi uvicorn python-dotenv langchain langchain-community \
            langchain-openai langchain-chroma chromadb pypdf pyjwt bcrypt
```

Create a `.env` file in `backend/`:

```env
OPENAI_API_KEY=sk-...
SECRET_KEY=your-jwt-secret
```

Run migrations then start the server:

```bash
python migrate.py
uvicorn main:app --reload
```

The API is available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app is available at `http://localhost:5173`.

---

## API overview

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Create an account |
| `POST` | `/auth/login` | Log in |
| `POST` | `/auth/logout` | Log out |
| `GET` | `/auth/me` | Current user |
| `POST` | `/upload` | Upload and index a PDF |
| `GET` | `/documents` | List all documents |
| `DELETE` | `/documents/{id}` | Delete a document and its embeddings |
| `GET` | `/documents/{id}/view` | View PDF inline |
| `GET` | `/documents/{id}/download` | Download PDF |
| `POST` | `/chats` | Start a new chat |
| `GET` | `/chats` | List user's chats |
| `GET` | `/chats/{id}/messages` | Fetch messages for a chat |
| `POST` | `/chats/{id}/messages` | Send a follow-up message |
