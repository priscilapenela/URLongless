# create_db_tables.py (o similar)
from shortener_app.database import engine, Base
from shortener_app.models import URL, ClickLog # Importa tus modelos para que Base los "conozca"

def create_tables():
    print("Creando tablas en la base de datos PostgreSQL...")
    Base.metadata.create_all(bind=engine)
    print("Tablas creadas exitosamente.")

if __name__ == "__main__":
    create_tables()