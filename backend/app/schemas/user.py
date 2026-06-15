from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime, date

class UserBase(BaseModel):
    email: Optional[EmailStr] = None

class UserCreate(UserBase):
    email: EmailStr
    password: Optional[str] = None

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int
    uuid: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_uuid: Optional[str] = None
