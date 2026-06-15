from typing import Generator
import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import ALGORITHM
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import TokenData

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_uuid_str: str = payload.get("sub")
        if user_uuid_str is None:
            raise credentials_exception
        token_data = TokenData(user_uuid=user_uuid_str)
    except JWTError:
        raise credentials_exception
    
    try:
        # Convert string UUID from token back to UUID object for SQLAlchemy
        user_uuid = uuid.UUID(token_data.user_uuid)
    except (ValueError, TypeError):
        raise credentials_exception

    user = db.query(User).filter(User.uuid == user_uuid).first()
    if user is None:
        raise credentials_exception
    return user
