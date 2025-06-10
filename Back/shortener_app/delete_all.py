# delete_all.py
from shortener_app.database import SessionLocal
from shortener_app.models import URL, ClickLog
import os

db_path = "shortener.db"
db = SessionLocal()

# Primero eliminar logs (si no usás cascade)
db.query(ClickLog).delete()

# Luego eliminar URLs
db.query(URL).delete()

db.commit()
db.close()