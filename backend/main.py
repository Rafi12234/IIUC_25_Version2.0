from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
from dotenv import load_dotenv
import os
from google import genai
from io import BytesIO
from PyPDF2 import PdfReader

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS middleware FIRST (before routes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize Gemini client
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

# Model configuration
MODEL_NAME = "gemini-2.0-flash"

# Pydantic models
class Message(BaseModel):
    role: Literal["user", "model"]
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []

class ChatResponse(BaseModel):
    reply: str

@app.get("/")
async def root():
    return {"message": "Gemini Chatbot API is running"}

@app.options("/chat")
async def options_chat():
    return {"message": "OK"}

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        # Build contents list for Gemini API
        contents = []
        
        # Add conversation history
        for item in req.history:
            contents.append({
                "role": item.role,
                "parts": [{"text": item.content}]
            })
        
        # Add current user message
        contents.append({
            "role": "user",
            "parts": [{"text": req.message}]
        })
        
        # Call Gemini API
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
        )
        
        # Extract reply text from response
        reply_text = ""
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts:
                # Concatenate all text parts
                reply_text = "".join(part.text for part in candidate.content.parts if hasattr(part, 'text'))
        
        if not reply_text:
            reply_text = "I'm sorry, I couldn't generate a response. Please try again."
        
        return ChatResponse(reply=reply_text)
    
    except Exception as e:
        error_message = f"Error talking to Gemini: {str(e)}"
        raise HTTPException(status_code=500, detail=error_message)

@app.options("/summarize-cv")
async def options_summarize_cv():
    return {"message": "OK"}

@app.post("/summarize-cv")
async def summarize_cv(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("application/pdf"):
            raise HTTPException(status_code=400, detail="Please upload a PDF file.")
        
        # Read file content
        content = await file.read()
        
        # Extract text from PDF
        pdf_file = BytesIO(content)
        reader = PdfReader(pdf_file)
        full_text = ""
        
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                full_text += page_text + "\n"
        
        # Check if text was extracted
        if not full_text.strip():
            raise HTTPException(status_code=400, detail="No text found in PDF.")
        
        # Call Gemini to analyze the CV
        prompt = (
            "You are an expert CV analyzer. "
            "Summarize the key skills, experience, and strengths from this CV. "
            "Provide a comprehensive analysis including:\n"
            "1. Professional Summary\n"
            "2. Key Skills\n"
            "3. Work Experience Highlights\n"
            "4. Education\n"
            "5. Notable Achievements\n\n"
            "CV Content:\n\n" + full_text
        )
        
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )
        
        # Extract summary text from response
        summary = ""
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts:
                summary = "".join(part.text for part in candidate.content.parts if hasattr(part, 'text'))
        
        if not summary:
            summary = "Unable to generate summary. Please try again."
        
        return {
            "summary": summary,
            "raw_text": full_text
        }
    
    except HTTPException:
        raise
    except Exception as e:
        error_message = f"Error processing CV: {str(e)}"
        raise HTTPException(status_code=500, detail=error_message)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
