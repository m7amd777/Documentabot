import os
from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma

load_dotenv()

CHROMA_DIR = "chroma_db"


def ingest_pdf(file_path: str):
    loader = PyPDFLoader(file_path)
    documents = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = splitter.split_documents(documents)

    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    vectorstore = Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings
    )

    vectorstore.add_documents(chunks)

    return {
        "file": os.path.basename(file_path),
        "pages": len(documents),
        "chunks": len(chunks)
    }



def ask_question(question: str):
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    vectorstore = Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings
    )

    retriever = vectorstore.as_retriever(
        search_kwargs={"k": 4}
    )

    retrieved_docs = retriever.invoke(question)

    if not retrieved_docs:
        return {
            "answer": "I could not find any relevant information in the uploaded documents.",
            "sources": []
        }

    context = "\n\n".join(
        [
            f"Source: {doc.metadata.get('source', 'Unknown source')}, "
            f"Page: {doc.metadata.get('page', 0) + 1}\n"
            f"{doc.page_content}"
            for doc in retrieved_docs
        ]
    )

    prompt = f"""
        You are an enterprise documentation assistant.

        Answer the user's question using ONLY the context below.

        If the answer is not found in the context, say:
        "I could not find that information in the uploaded documents."

        Do not make up information.

        Context:
        {context}

        User question:
        {question}
        """

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0
    )

    response = llm.invoke(prompt)

    sources = []

    for doc in retrieved_docs:
        source = doc.metadata.get("source", "Unknown source")
        page = doc.metadata.get("page", 0) + 1

        source_item = {
            "file": os.path.basename(source),
            "page": page
        }

        if source_item not in sources:
            sources.append(source_item)

    return {
        "answer": response.content,
        "sources": sources
    }