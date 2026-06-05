import os
import shutil
from fastapi import FastAPI, UploadFile, File
from rag import ingest_pdf

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