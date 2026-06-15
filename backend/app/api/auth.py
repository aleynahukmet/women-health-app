from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core import security
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import Token, UserCreate, User as UserSchema

router = APIRouter()

@router.post("/register", response_model=UserSchema)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user_data = user_in.dict(exclude={"password"})
    user = User(
        **user_data,
        hashed_password=security.get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.uuid, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/social-login", response_model=Token)
def social_login(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Mock social login that creates a user if they don't exist and returns a token.
    In production, this would verify the Google/Apple ID token.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, is_active=True)
        db.add(user)
        db.commit()
        db.refresh(user)
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.uuid, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
