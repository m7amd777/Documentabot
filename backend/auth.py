import os
import sqlite3
from datetime import datetime, timedelta, timezone
from typing import Annotated

import bcrypt as _bcrypt
from dotenv import load_dotenv
from fastapi import Cookie, Depends, HTTPException, Response
from jose import JWTError, jwt

from database import get_db

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 10080))
COOKIE_NAME = "access_token"


def hash_password(plain: str) -> str:
    return _bcrypt.hashpw(plain.encode(), _bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="strict",
        secure=False,   # set to True in production (HTTPS)
        max_age=EXPIRE_MINUTES * 60,
    )


def clear_auth_cookie(response: Response):
    response.delete_cookie(key=COOKIE_NAME, httponly=True, samesite="strict")


DB = Annotated[sqlite3.Connection, Depends(get_db)]


def get_current_user(
    db: DB,
    access_token: str | None = Cookie(default=None),
) -> dict:
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated.")

    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    row = db.execute("SELECT id, name FROM users WHERE id = ?", (user_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=401, detail="User not found.")

    return dict(row)


CurrentUser = Annotated[dict, Depends(get_current_user)]
