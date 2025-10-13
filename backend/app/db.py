import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from .models import Base

MYSQL_HOST = os.getenv("MYSQL_HOST","127.0.0.1")
MYSQL_PORT = os.getenv("MYSQL_PORT","3307") 
MYSQL_DB   = os.getenv("MYSQL_DB","yt")
MYSQL_USER = os.getenv("MYSQL_USER","ytuser")
MYSQL_PW   = os.getenv("MYSQL_PW","ytpw")

ASYNC_URL = f"mysql+aiomysql://{MYSQL_USER}:{MYSQL_PW}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}?charset=utf8mb4"
engine = create_async_engine(ASYNC_URL, echo=False, pool_recycle=1800)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)