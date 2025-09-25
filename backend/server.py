import openai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2

load_dotenv()

# Initialize OpenAI client
open_ai_key = os.getenv("OPEN_AI_KEY")
if not open_ai_key:
    raise ValueError("OPEN_AI_KEY environment variable is not set. Please set it in your .env file.")
client = openai.OpenAI(api_key=open_ai_key)

# Create FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for request data
class TopicRequest(BaseModel):
    topic_name: str
    subject: str
    level: str
    paper: str = None  # Optional for non-business subjects

# PDF processing functions
def get_pdf_path(subject, level, paper=None):
    """Map subject/level to file path"""
    base = os.path.join(os.path.dirname(__file__), "materials")
    if subject == "agriculture":
        if level == "higher":
            return os.path.join(base, "agriculture", "higher level", "last papers", "LC024ALP000EV.pdf")
        else:
            return os.path.join(base, "agriculture", "ordinary level", "last papers", "LC024GLP000EV.pdf")
    elif subject == "business":
        if level == "higher":
            paper1 = os.path.join(base, "business", "higher level", "last papers", "LC033ALP032EV.pdf")
            paper2 = os.path.join(base, "business", "higher level", "last papers", "LC033ALP041EV.pdf")
            return paper1, paper2
        else:
            paper1 = os.path.join(base, "business", "ordinary level", "last papers", "LC033GLP032EV.pdf")
            paper2 = os.path.join(base, "business", "ordinary level", "last papers", "LC033GLP033EV.pdf")
            return paper1, paper2
    return None

def extract_text_by_rules(pdf_path, start_page=0, skip_first_page=False, stop_word=None):
    """Extract text from PDF with specific rules"""
    with open(pdf_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        text = ""
        pages = reader.pages
        if skip_first_page:
            pages = pages[1:]
        else:
            pages = pages[start_page:]
        for page in pages:
            page_text = page.extract_text()
            if stop_word and stop_word in page_text:
                break
            text += page_text
        return text

# Root endpoint - returns server status
@app.get("/")
async def root():
    return {"status": "Server is running"}

# AI questions endpoint - POST only
@app.post("/api/ai/generate_questions")
async def generate_questions(data: TopicRequest):
    print(f"Received request: topic={data.topic_name}, subject={data.subject}, level={data.level}")
    
    try:
        # Process PDF based on subject
        if data.subject == "business":
            result = get_pdf_path(data.subject, data.level)
            if not result or len(result) != 2:
                raise HTTPException(status_code=404, detail="Past exam paper not found for business")
            paper1_pdf_path, paper2_pdf_path = result
            if not os.path.exists(paper1_pdf_path) or not os.path.exists(paper2_pdf_path):
                raise HTTPException(status_code=404, detail="Past exam paper files not found")
            paper1_text = extract_text_by_rules(paper1_pdf_path, start_page=2, stop_word="Answer Book")
            paper2_text = extract_text_by_rules(paper2_pdf_path, skip_first_page=True, stop_word="There is no examination material on this page")
            combined_text = paper1_text + "\n\n" + paper2_text
            
        elif data.subject == "agriculture":
            pdf_path = get_pdf_path(data.subject, data.level)
            if not pdf_path:
                raise HTTPException(status_code=404, detail="Missing path for agriculture paper")
            if not os.path.exists(pdf_path):
                raise HTTPException(status_code=404, detail=f"Past exam paper not found at path: {pdf_path}")
            past_exam_text = extract_text_by_rules(pdf_path, skip_first_page=True, stop_word="Do not write on this page")
            combined_text = past_exam_text
        else:
            raise HTTPException(status_code=400, detail="Invalid subject. Only 'agriculture' and 'business' are supported.")
        
        # Generate AI questions
        prompt = (
            f"You are an experienced Leaving Certificate teacher. "
            f"Here is past exam paper for {data.subject} ({data.level}):\n\n"
            f"{combined_text}\n\n"
            f"Write 3 structured exam-style open-ended questions about the topic: '{data.topic_name}'.\n"
            f"Each question should have two or more parts. Format them as follows:\n\n"
            f"1. [First question with parts]\n\n"
            f"2. [Second question with parts]\n\n"
            f"3. [Third question with parts]\n\n"
            f"Make sure each question is numbered and has a blank line between questions."
        )
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return {"questions": response.choices[0].message.content}
        
    except Exception as e:
        print(f"Error generating questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)