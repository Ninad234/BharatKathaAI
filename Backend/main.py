import os
import json
import uuid 
from fastapi import FastAPI, Depends, HTTPException
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from openai import OpenAI

import database as db_mod

app = FastAPI(title="BharatKatha AI")

load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://bharat-katha-ai.vercel.app","http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

class ChatCreate(BaseModel):
    id:str
    title:str

class MessageSend(BaseModel):
    message:str

class SessionUpdate(BaseModel):
    title:str



# 1. Fetch all chat sessions
@app.get("/api/sessions")
def get_session(db: Session = Depends(db_mod.get_db)):
    sessions = db.query(db_mod.ChatSession).order_by(db_mod.ChatSession.created_at.desc()).all()
    return [
        {
            "id":s.id,
            "title":s.title,
            "messages":[{"role":m.role,"content":m.content} for m in s.messages]
        }
        for s in sessions
    ]


# 2. Create a new chat session
@app.post("/api/sessions")
def create_session(session_data: ChatCreate,db: Session = Depends(db_mod.get_db)):
    existing = db.query(db_mod.ChatSession).filter(db_mod.ChatSession.id == session_data.id).first()
    if existing:
        return {"status":"exists"}
    new_session = db_mod.ChatSession(id = session_data.id,title=session_data.title)
    db.add(new_session)
    db.commit()
    return {"status":"created"}

# 3. Delete a chat session
@app.delete("/api/session/{session_id}")
def delete_session(session_id:str,db: Session = Depends(db_mod.get_db)):
    session = db.query(db_mod.ChatSession).filter(db_mod.ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404,detail="Session not Found")
    db.delete(session)
    db.commit()
    return{"status":"deleted"}

# 4. Stream chat response (Server-Sent Events)
@app.post("/api/session/{session_id}/stream")
async def stream_chat(session_id:str,payload:MessageSend,db: Session = Depends(db_mod.get_db)):
    print("Starting stream_chat function...")
    session = db.query(db_mod.ChatSession).filter(db_mod.ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404,detail="Session not Found")
    user_prompt = payload.message
    user_msg = db_mod.ChatMessage(
        id = str(uuid.uuid4()),
        session_id = session_id,
        role = "user",
        content = user_prompt
    )
    db.add(user_msg)
    db.commit()

    db_messages = db.query(db_mod.ChatMessage).filter(db_mod.ChatMessage.session_id == session_id).order_by(db_mod.ChatMessage.created_at).all()
    api_messages = [
        {
            "role": "system",
            "content": "You are an excellent Indian culture and heritage bot who has all the knowledge about Indian culture and heritage only. You will not answer any questions outside of Indian heritage, philosophy, history, geography, arts, and traditions. Format responses using beautiful Markdown."
        }
    ]
    for m in db_messages[:-1]:
        api_messages.append({"role":m.role,"content":m.content})
    
    api_messages.append({"role":"user","content":user_prompt})

    if len(db_messages) <= 2:
        session.title = user_prompt[:25] + "..." if len(user_prompt) > 25 else user_prompt
        db.commit()

    async def event_generator():
        try:
            stream = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=api_messages,
                stream=True
            )
            full_assistant_reply = ""
            for chunk in stream:
                text_chunk = chunk.choices[0].delta.content
                if text_chunk:
                    full_assistant_reply += text_chunk
                    yield f"data:{json.dumps({'chunk':text_chunk})}\n\n"

            assistant_msg = db_mod.ChatMessage(
                id=str(uuid.uuid4()),
                session_id=session_id,
                role="assistant",
                content=full_assistant_reply
                )
            db.add(assistant_msg)
            db.commit()
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(),media_type="text/event-stream")        

@app.put("/api/session/{session_id}")
def update_session(session_id:str,payload:SessionUpdate,db: Session = Depends(db_mod.get_db)):
    session = db.query(db_mod.ChatSession).filter(db_mod.ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404,detail="Session not found")
    session.title = payload.title
    db.commit()
    return {"status":"updated","title":session.title}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app",host='127.0.0.1',port=8000,reload=True)
