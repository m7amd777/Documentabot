import os
import shutil
import sqlite3
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, HTTPException, Response, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from auth import (
    CurrentUser,
    clear_auth_cookie,
    create_token,
    hash_password,
    set_auth_cookie,
    verify_password,
)
from database import get_connection, get_db
from rag import ask_question, delete_document_chunks, generate_chat_name, ingest_pdf

load_dotenv()

UPLOAD_DIR = "uploads"
app = FastAPI(title="Enterprise Documentation Assistant")

DB = Annotated[sqlite3.Connection, Depends(get_db)]


@app.on_event("startup")
def on_startup():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    name: str
    password: str


class LoginRequest(BaseModel):
    name: str
    password: str


@app.post("/auth/register", status_code=201)
def register(body: RegisterRequest, db: DB, response: Response):
    existing = db.execute("SELECT id FROM users WHERE name = ?", (body.name,)).fetchone()
    if existing:
        raise HTTPException(status_code=409, detail="Username already taken.")

    hashed = hash_password(body.password)
    cursor = db.execute(
        "INSERT INTO users (name, password) VALUES (?, ?)",
        (body.name, hashed),
    )
    db.commit()

    token = create_token(cursor.lastrowid)
    set_auth_cookie(response, token)
    return {"id": cursor.lastrowid, "name": body.name}


@app.post("/auth/login")
def login(body: LoginRequest, db: DB, response: Response):
    row = db.execute("SELECT id, name, password FROM users WHERE name = ?", (body.name,)).fetchone()
    if row is None or not verify_password(body.password, row["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    token = create_token(row["id"])
    set_auth_cookie(response, token)
    return {"id": row["id"], "name": row["name"]}


@app.post("/auth/logout")
def logout(response: Response):
    clear_auth_cookie(response)
    return {"message": "Logged out."}


@app.get("/auth/me")
def me(current_user: CurrentUser):
    return current_user


# ---------------------------------------------------------------------------
# Documents
# ---------------------------------------------------------------------------

@app.post("/upload")
def upload_pdf(
    current_user: CurrentUser,
    db: DB,
    file: UploadFile = File(...),
    category: str = Form(None),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)
    file_type = os.path.splitext(file.filename)[1].lstrip(".")

    result = ingest_pdf(file_path)

    try:
        cursor = db.execute(
            """
            INSERT INTO documents (name, file_size, pages, chunks, file_type, category, owner_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
            """,
            (
                file.filename,
                file_size,
                result["pages"],
                result["chunks"],
                file_type,
                category,
                current_user["id"],
            ),
        )
        db.commit()
    except sqlite3.IntegrityError:
        os.remove(file_path)
        raise HTTPException(status_code=409, detail=f"A document named '{file.filename}' already exists.")

    return {
        "message": "File uploaded and indexed successfully",
        "data": {
            "id": cursor.lastrowid,
            "name": file.filename,
            "file_size": file_size,
            "pages": result["pages"],
            "chunks": result["chunks"],
            "file_type": file_type,
            "category": category,
            "owner_id": current_user["id"],
            "status": "active",
        },
    }


@app.delete("/documents/{document_id}")
def delete_document(document_id: int, current_user: CurrentUser, db: DB):
    row = db.execute(
        "SELECT name, owner_id FROM documents WHERE id = ?", (document_id,)
    ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Document not found.")

    if row["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You do not own this document.")

    doc_name = row["name"]
    file_path = os.path.join(UPLOAD_DIR, doc_name)

    db.execute("DELETE FROM documents WHERE id = ?", (document_id,))
    db.commit()

    if os.path.exists(file_path):
        os.remove(file_path)

    delete_document_chunks(file_path)

    return {"message": f"Document '{doc_name}' deleted successfully."}


@app.get("/documents/{document_id}/download")
def download_document(document_id: int, current_user: CurrentUser, db: DB):
    row = db.execute("SELECT name FROM documents WHERE id = ?", (document_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    file_path = os.path.join(UPLOAD_DIR, row["name"])
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk.")
    return FileResponse(
        file_path,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{row["name"]}"'},
    )


@app.get("/documents/{document_id}/view")
def view_document(document_id: int, current_user: CurrentUser, db: DB):
    row = db.execute("SELECT name FROM documents WHERE id = ?", (document_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    file_path = os.path.join(UPLOAD_DIR, row["name"])
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk.")
    return FileResponse(
        file_path,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{row["name"]}"'},
    )


@app.get("/documents")
def get_documents(current_user: CurrentUser, db: DB):
    rows = db.execute("""
        SELECT
            d.id,
            d.name,
            d.file_size,
            d.pages,
            d.chunks,
            d.file_type,
            d.category,
            d.owner_id,
            d.status,
            u.name AS owner_name
        FROM documents d
        JOIN users u ON u.id = d.owner_id
        ORDER BY d.id DESC
    """).fetchall()

    return [dict(row) for row in rows]


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------

class ChatMessageRequest(BaseModel):
    question: str


@app.get("/chats")
def get_chats(current_user: CurrentUser, db: DB):
    rows = db.execute(
        "SELECT id, name, created_at FROM chats WHERE user_id = ? ORDER BY id DESC",
        (current_user["id"],),
    ).fetchall()
    return [dict(row) for row in rows]


@app.get("/chats/{chat_id}/messages")
def get_chat_messages(chat_id: int, current_user: CurrentUser, db: DB):
    chat = db.execute(
        "SELECT id FROM chats WHERE id = ? AND user_id = ?",
        (chat_id, current_user["id"]),
    ).fetchone()
    if chat is None:
        raise HTTPException(status_code=404, detail="Chat not found.")
    rows = db.execute(
        "SELECT id, chat_id, is_response, content, created_at FROM chat_messages WHERE chat_id = ? ORDER BY id ASC",
        (chat_id,),
    ).fetchall()
    return [dict(row) for row in rows]


@app.post("/chats", status_code=201)
def create_chat(body: ChatMessageRequest, current_user: CurrentUser, db: DB):
    name = generate_chat_name(body.question)

    chat_cursor = db.execute(
        "INSERT INTO chats (name, user_id, created_at) VALUES (?, ?, datetime('now'))",
        (name, current_user["id"]),
    )
    chat_id = chat_cursor.lastrowid

    db.execute(
        "INSERT INTO chat_messages (chat_id, is_response, content) VALUES (?, 0, ?)",
        (chat_id, body.question),
    )

    result = ask_question(body.question)

    db.execute(
        "INSERT INTO chat_messages (chat_id, is_response, content) VALUES (?, 1, ?)",
        (chat_id, result["answer"]),
    )
    db.commit()

    return {
        "chat": {"id": chat_id, "name": name},
        "answer": result["answer"],
        "sources": result["sources"],
    }


@app.post("/chats/{chat_id}/messages")
def send_message(chat_id: int, body: ChatMessageRequest, current_user: CurrentUser, db: DB):
    chat = db.execute(
        "SELECT id FROM chats WHERE id = ? AND user_id = ?",
        (chat_id, current_user["id"]),
    ).fetchone()
    if chat is None:
        raise HTTPException(status_code=404, detail="Chat not found.")

    db.execute(
        "INSERT INTO chat_messages (chat_id, is_response, content) VALUES (?, 0, ?)",
        (chat_id, body.question),
    )

    result = ask_question(body.question)

    db.execute(
        "INSERT INTO chat_messages (chat_id, is_response, content) VALUES (?, 1, ?)",
        (chat_id, result["answer"]),
    )
    db.commit()

    return {
        "answer": result["answer"],
        "sources": result["sources"],
    }


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {"message": "Enterprise Documentation Assistant API is running"}
