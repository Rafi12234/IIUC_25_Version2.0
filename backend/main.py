from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import TypedDict, List, Dict, Any
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
        "http://localhost:5176",
        "https://careerpath-weld.vercel.app",
        "https://careerpath-weld-git-main-tayebbbs-projects.vercel.app",
        "https://*.vercel.app",
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

# Simple type hints to avoid a runtime dependency on pydantic
class Message(TypedDict, total=False):
    role: Literal["user", "model"]
    content: str

# Endpoints will accept plain dicts (JSON) for requests and return plain dicts for responses.
# Expected shapes:
#   Chat request JSON: {"message": "<text>", "history": [{"role":"user","content":"..."}, ...]}
#   Chat response JSON: {"reply": "<text>"}

@app.get("/")
async def root():
    return {"message": "Gemini Chatbot API is running"}

@app.options("/chat")
async def options_chat():
    return {"message": "OK"}

@app.post("/chat")
async def chat(req: Dict[str, Any]):
    try:
        # Build contents list for Gemini API
        contents = []
        
        # Add conversation history
        for item in req.get("history", []):
            contents.append({
                "role": item.get("role"),
                "parts": [{"text": item.get("content")}]
            })
        
        # Add current user message
        contents.append({
            "role": "user",
            "parts": [{"text": req.get("message", "")}]
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
        
        return {"reply": reply_text}
    
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
            "You are an expert CV analyzer. Extract and list ONLY the following from this CV in a structured JSON format:\n\n"
            "Return ONLY a valid JSON object with these exact keys:\n"
            "{\n"
            '  "keySkills": ["skill1", "skill2", ...],\n'
            '  "toolsTechnologies": ["tool1", "tool2", ...],\n'
            '  "rolesAndDomains": ["role/domain1", "role/domain2", ...]\n'
            "}\n\n"
            "Instructions:\n"
            "- keySkills: List all technical and soft skills (e.g., Python, Communication, Problem Solving)\n"
            "- toolsTechnologies: List all programming languages, frameworks, software, platforms (e.g., React, Docker, AWS)\n"
            "- rolesAndDomains: List job titles AND industry domains (e.g., Software Engineer, Web Development, Healthcare)\n"
            "- Extract only what is explicitly mentioned in the CV\n"
            "- Return ONLY the JSON object, no additional text\n\n"
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
        
        # Try to parse as JSON, if it fails return as text
        import json
        try:
            # Clean markdown code blocks if present
            cleaned_summary = summary.strip()
            if cleaned_summary.startswith("```json"):
                cleaned_summary = cleaned_summary[7:]
            if cleaned_summary.startswith("```"):
                cleaned_summary = cleaned_summary[3:]
            if cleaned_summary.endswith("```"):
                cleaned_summary = cleaned_summary[:-3]
            cleaned_summary = cleaned_summary.strip()
            
            parsed_data = json.loads(cleaned_summary)
            return {
                "data": parsed_data,
                "raw_text": full_text
            }
        except json.JSONDecodeError:
            # If JSON parsing fails, return as text
            return {
                "data": {"summary": summary},
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
