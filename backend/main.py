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
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
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

class InterviewQuestionRequest(BaseModel):
    role: str
    difficulty: str
    questionNumber: int
    previousQuestions: list[str] = []  # Track previous questions to avoid duplicates

class InterviewAnswerRequest(BaseModel):
    question: str
    answer: str
    role: str
    difficulty: str

class InterviewQuestionResponse(BaseModel):
    question: str

class InterviewFeedbackResponse(BaseModel):
    score: float
    feedback: str
    strengths: list[str]
    improvements: list[str]

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Gemini Chatbot API is running"}

@app.options("/chat")
async def options_chat():
    return {"message": "OK"}

@app.post("/chat")
async def chat(req: Dict[str, Any]):
    try:
        # Validate API key
        if not api_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
        
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
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")  # Log to Vercel logs
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

@app.options("/generate-interview-question")
async def options_generate_question():
    return {"message": "OK"}

@app.post("/generate-interview-question", response_model=InterviewQuestionResponse)
async def generate_interview_question(req: InterviewQuestionRequest):
    try:
        # Map role to readable name
        role_names = {
            'frontend': 'Frontend Developer',
            'backend': 'Backend Developer',
            'fullstack': 'Full Stack Developer',
            'data-science': 'Data Scientist',
            'mobile': 'Mobile Developer',
            'devops': 'DevOps Engineer',
            'ui-ux': 'UI/UX Designer',
            'product-manager': 'Product Manager'
        }
        
        role_name = role_names.get(req.role, req.role)
        
        # Build previous questions context to avoid duplicates
        previous_context = ""
        if req.previousQuestions and len(req.previousQuestions) > 0:
            previous_context = "\n\nPreviously asked questions (DO NOT repeat these):\n"
            for i, prev_q in enumerate(req.previousQuestions, 1):
                previous_context += f"{i}. {prev_q}\n"
        
        # Create prompt for interview question
        prompt = f"""You are an experienced technical interviewer conducting a {req.difficulty} level interview for a {role_name} position.

Generate a single, NEW and UNIQUE interview question (Question #{req.questionNumber}) that:
- Is appropriate for {req.difficulty} level candidates
- Tests practical knowledge and problem-solving skills
- Is clear and specific
- Would be commonly asked in real {role_name} interviews
- Is COMPLETELY DIFFERENT from any previously asked questions

Difficulty guidelines:
- Beginner: Basic concepts, syntax, fundamental principles (e.g., "What is a variable?", "Explain HTML tags")
- Intermediate: Practical experience, common scenarios, best practices (e.g., "How do you handle API errors?", "Explain state management")
- Advanced: System design, architecture, complex problem-solving, trade-offs (e.g., "Design a scalable chat system", "Explain microservices architecture")

IMPORTANT: 
- Generate a DIFFERENT question each time
- Maintain the {req.difficulty} difficulty level consistently
- Avoid repeating topics from previous questions
- Provide variety in question types (conceptual, practical, scenario-based){previous_context}

Return ONLY the interview question text, no additional formatting or labels."""

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )
        
        question_text = ""
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts:
                question_text = "".join(part.text for part in candidate.content.parts if hasattr(part, 'text'))
        
        if not question_text:
            question_text = "What interests you about this role and what relevant experience do you have?"
        
        return InterviewQuestionResponse(question=question_text.strip())
    
    except Exception as e:
        error_message = f"Error generating interview question: {str(e)}"
        raise HTTPException(status_code=500, detail=error_message)

@app.options("/evaluate-interview-answer")
async def options_evaluate_answer():
    return {"message": "OK"}

@app.post("/evaluate-interview-answer", response_model=InterviewFeedbackResponse)
async def evaluate_interview_answer(req: InterviewAnswerRequest):
    try:
        # Create prompt for evaluation
        prompt = f"""You are an experienced technical interviewer evaluating a candidate's answer.

Interview Question: {req.question}

Candidate's Answer: {req.answer}

Job Role: {req.role}
Difficulty Level: {req.difficulty}

Evaluate this answer and provide:
1. A score from 0-10 (be realistic and fair)
2. Overall feedback (2-3 sentences)
3. 2-3 specific strengths in the answer
4. 2-3 specific areas for improvement

Return your evaluation in this EXACT JSON format:
{{
    "score": <number between 0-10>,
    "feedback": "<overall feedback>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}}

Scoring guidelines:
- 9-10: Exceptional answer with deep understanding
- 7-8: Strong answer with good knowledge
- 5-6: Adequate answer with room for improvement
- 3-4: Weak answer with significant gaps
- 0-2: Poor answer with fundamental misunderstandings

Return ONLY the JSON object, no additional text."""

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )
        
        feedback_text = ""
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts:
                feedback_text = "".join(part.text for part in candidate.content.parts if hasattr(part, 'text'))
        
        # Parse JSON response
        import json
        try:
            # Clean markdown code blocks if present
            cleaned_feedback = feedback_text.strip()
            if cleaned_feedback.startswith("```json"):
                cleaned_feedback = cleaned_feedback[7:]
            if cleaned_feedback.startswith("```"):
                cleaned_feedback = cleaned_feedback[3:]
            if cleaned_feedback.endswith("```"):
                cleaned_feedback = cleaned_feedback[:-3]
            cleaned_feedback = cleaned_feedback.strip()
            
            parsed_data = json.loads(cleaned_feedback)
            
            return InterviewFeedbackResponse(
                score=float(parsed_data.get("score", 5)),
                feedback=parsed_data.get("feedback", "Thank you for your answer."),
                strengths=parsed_data.get("strengths", ["You provided an answer"]),
                improvements=parsed_data.get("improvements", ["Consider providing more details"])
            )
        except (json.JSONDecodeError, KeyError, ValueError):
            # Fallback if JSON parsing fails
            return InterviewFeedbackResponse(
                score=5.0,
                feedback="Thank you for your answer. " + feedback_text[:200],
                strengths=["You attempted the question"],
                improvements=["Consider structuring your answer better", "Provide more specific examples"]
            )
    
    except Exception as e:
        error_message = f"Error evaluating answer: {str(e)}"
        raise HTTPException(status_code=500, detail=error_message)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
