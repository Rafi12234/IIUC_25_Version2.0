from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
from dotenv import load_dotenv
import os
from google import genai

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
