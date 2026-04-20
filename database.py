from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Azure database link
URL = os.getenv("AZURE_SQL_CONNECTION_STRING")

engine = create_engine(URL, fast_executemany = True)
SessionLocal = sessionmaker(bind = engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()