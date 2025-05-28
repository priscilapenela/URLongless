# delete_all.py
from shortener_app.database import SessionLocal
from shortener_app.models import URL

db = SessionLocal()
db.query(URL).delete()
db.commit()
db.close()

print("Todas las URLs han sido eliminadas.")