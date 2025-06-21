# shortener_app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import get_settings
import os

settings = get_settings()
DATABASE_URL = settings.database_url
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)
Base = declarative_base()

# Dependencia para obtener la sesión de la base de datos
def get_db(): # <--- Asegúrate de que esta función exista y esté definida correctamente
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Esto es común para que los modelos se registren en la base
# from . import models # Asegúrate de que tus modelos (URL, ClickLog) estén definidos aquí
# models.Base.metadata.create_all(bind=engine)