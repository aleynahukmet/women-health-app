from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Date
from app.models.utils import GUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, date
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(GUID, default=uuid.uuid4, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # We do NOT put health data or PII (name, age) here. 
    # The link to health data is via the uuid.
