import os
import shutil
from fastapi import FastAPI, UploadFile, File
from rag import ingest_pdf, ask_question
from pydantic import BaseModel

class ChatRequest(BaseModel):
    question: str

UPLOAD_DIR = "uploads"
app = FastAPI(title="Enterprise Documentation Assistant")

@app.get("/")
def root():
    return {"message": "Enterprise Documentation Assistant API is running"}


@app.post("/upload")
def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files are supported for now."}

    file_path = os.path.join(UPLOAD_DIR, file.filename)


    # automatically cleaning the repository immediately. 
    # buffer is just a file
    # wb is a binary
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = ingest_pdf(file_path)

    return {
        "message": "File uploaded and indexed successfully",
        "data": result
    }


@app.post("/chat")
def chat(request: ChatRequest):
    result = ask_question(request.question)
    return result

@app.get("/documents")
def get_documents():
    documents = []

    for filename in os.listdir(UPLOAD_DIR):
        file_path = os.path.join(UPLOAD_DIR, filename)

        if os.path.isfile(file_path):
            size_kb = round(os.path.getsize(file_path) / 1024, 2)

            documents.append({
                "filename": filename,
                "size_kb": size_kb
            })

    return documents