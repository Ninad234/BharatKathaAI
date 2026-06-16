#database file 
from sqlalchemy import create_engine,Column,Text,String,ForeignKey,DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker,relationship,Session

import datetime

DATABASE_URL = "sqlite:///./bharatkatha.db"
engine = create_engine(DATABASE_URL,connect_args={"check_same_thread":False})
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
