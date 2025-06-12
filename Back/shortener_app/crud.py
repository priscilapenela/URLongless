# shortener_app/crud.py
from sqlalchemy.orm import Session
from . import keygen, models, schemas
import secrets
from starlette.datastructures import URL as StarletteURL # Asegúrate de que esto está renombrado si lo usas aquí
from .config import get_settings

def create_db_url(db: Session, url: schemas.URLBase) -> models.URL:

    if url.custom_key:
        # Si el custom_key ya está en uso, lanzar error
        existing = get_db_url_by_key(db, url.custom_key)
        if existing:
            raise ValueError("Custom key already in use.")
        key = url.custom_key
    else:
        key = keygen.create_unique_random_key(db)

    secret_key = f"{key}_{keygen.create_random_key(length=8)}"
    db_url = models.URL(
        target_url=url.target_url,
        key=key,
        secret_key=secret_key,
        custom_name=url.custom_key, # <--- ¡AÑADE ESTA LÍNEA!
        is_active=True,             # <--- Añadido para asegurar valores por defecto
        clicks=0                    # <--- Añadido para asegurar valores por defecto
    )
    db.add(db_url)
    db.commit()
    db.refresh(db_url)
    return db_url

def get_db_url_by_key(db: Session, url_key: str) -> models.URL:
    return (
        db.query(models.URL)
        .filter(models.URL.key == url_key, models.URL.is_active)
        .first()
    )

def get_db_url_by_secret_key(db: Session, secret_key: str) -> models.URL:
    return (
        db.query(models.URL)
        .filter(models.URL.secret_key == secret_key, models.URL.is_active)
        .first()
    )

def deactivate_db_url_by_secret_key(db: Session, secret_key: str) -> models.URL:
    db_url = get_db_url_by_secret_key(db, secret_key)
    if db_url:
        db_url.is_active = False
        
        db.commit()
        db.refresh(db_url)
    return db_url

def update_db_clicks(db: Session, db_url: models.URL) -> models.URL:
    db_url.clicks += 1
    db.commit()
    db.refresh(db_url)
    return db_url