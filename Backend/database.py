#database file 
from sqlalchemy import create_engine,Column,Text,String,ForeignKey,DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker,relationship,Session
from dotenv import load_dotenv
import os

import datetime

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
engine = create_engine(DATABASE_URL,pool_size=5,max_overflow=10,pool_timeout=30,pool_pre_ping=True)

SessionLocal = sessionmaker(autoflush=False,autocommit=False,bind=engine)

Base = declarative_base()

# ChatSession is the parent container for messages
class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(String,primary_key=True,index=True)
    title = Column(String,index=True)
    created_at = Column(DateTime,default=datetime.datetime.utcnow)
    messages = relationship("ChatMessage",back_populates="session",cascade="all, delete-orphan")

# ChatMessage holds the individual message turns
class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(String,primary_key=True,index=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"))
    role = Column(String)
    content = Column(Text)
    created_at = Column(DateTime,default=datetime.datetime.utcnow)

    session = relationship("ChatSession",back_populates="messages")

# Create tables in database
Base.metadata.create_all(bind=engine)

# Database Session Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
