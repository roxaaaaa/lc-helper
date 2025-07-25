from logging import exception
import data
import openai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
open_ai_key = os.getenv("OPEN_AI_KEY")
client = openai.OpenAI(api_key=open_ai_key)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:3000"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TopicRequest(BaseModel):
    topic_name: str

@app.post("/api/ai/generate_questions")
async def generate_questions(data: TopicRequest):
    prompt = (
        f"You are an experienced Leaving Certificate teacher. "
        f"Write 3 structured exam-style open-ended questions about the topic: '{data.topic_name}'.\n"
        f"Each question should have two or more parts. Format them clearly."
    )
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        return {"questions": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))