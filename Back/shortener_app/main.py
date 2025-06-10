from fastapi import FastAPI, HTTPException, Depends, Request, APIRouter, Query
from sqlalchemy.orm import Session
from . import models, schemas, geo_info, crud
from .database import SessionLocal, engine
from fastapi.responses import RedirectResponse, FileResponse
from starlette.datastructures import URL
from .config import get_settings
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from .models import ClickLog 
from datetime import datetime
from sqlalchemy import func
import requests
import reverse_geocoder as rg
import segno
import os
import uuid

app = FastAPI()
router = APIRouter()
models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # o ["*"] para permitir todo durante desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QRRequest(BaseModel):
    target_url: str  # debe coincidir con tu frontend

def get_location_from_ip(ip):
    try:
        response = requests.get(f"https://ipinfo.io/{ip}/json")
        if response.status_code == 200:
            data = response.json()
            if "loc" in data:
                return data["loc"]  # ejemplo: "34.0522,-118.2437"
    except Exception as e:
        print("Error al obtener localización:", e)
    return None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def raise_not_found(request):
    message = f"URL '{request.url}' doesn't exist"
    raise HTTPException(status_code=404, detail=message)

@app.get("/")
def read_root():
    return "Welcome to the URL shortener API :)"

@app.post("/url", response_model=schemas.URLInfo)
def create_url(url: schemas.URLBase, db: Session = Depends(get_db)):
    print("Recibido en backend:", url)
    try:
        db_url = crud.create_db_url(db=db, url=url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return get_admin_info(db_url)

@app.post("/generate_qr")
def generate_qr(data: QRRequest):
    url = data.target_url
    if not url:
        raise HTTPException(status_code=400, detail="No URL provided")

    filename = f"qr_{uuid.uuid4().hex}.png"
    filepath = os.path.join("temp_qrs", filename)
    os.makedirs("temp_qrs", exist_ok=True)

    qr = segno.make_qr(url)
    qr.save(filepath, scale=5)

    return FileResponse(filepath, media_type="image/png", filename=filename)

@app.get(
    "/admin/{secret_key}",
    name="administration info",
    response_model=schemas.URLInfo,
)
def get_url_info(
    secret_key: str, request: Request, db: Session = Depends(get_db)
):
    if db_url := crud.get_db_url_by_secret_key(db, secret_key=secret_key):
        return get_admin_info(db_url)
    else:
        raise_not_found(request)

def get_admin_info(db_url: models.URL) -> schemas.URLInfo:
    base_url = URL(get_settings().base_url)
    admin_endpoint = app.url_path_for(
        "administration info", secret_key=db_url.secret_key
    )
    db_url.url = str(base_url.replace(path=db_url.key))
    db_url.admin_url = str(base_url.replace(path=admin_endpoint))
    return db_url

@app.delete("/admin/{secret_key}")
def delete_url(
    secret_key: str, request: Request, db: Session = Depends(get_db)
):
    if db_url := crud.deactivate_db_url_by_secret_key(db, secret_key=secret_key):
        message = f"Successfully deleted shortened URL for '{db_url.target_url}'"
        return {"detail": message}
    else:
        raise_not_found(request)

@router.get("/analytics/clicks_per_day")
def clicks_per_day(db: Session = Depends(get_db)):
    result = (
        db.query(func.date(ClickLog.timestamp), func.count())
        .group_by(func.date(ClickLog.timestamp))
        .all()
    )
    return [{"date": str(r[0]), "clicks": r[1]} for r in result]

@app.get("/analytics/clicks_over_time")
def clicks_over_time(
    db: Session = Depends(get_db),
    start: datetime = Query(None),
    end: datetime = Query(None),
):
    query = db.query(
        models.URL.key.label("key"),
        func.strftime('%Y-%m-%d %H:00', models.ClickLog.timestamp).label("hour"),
        func.count().label("clicks")
    ).join(models.ClickLog).group_by("key", "hour").order_by("hour")

    if start:
        query = query.filter(models.ClickLog.timestamp >= start)
    if end:
        query = query.filter(models.ClickLog.timestamp <= end)

    results = query.all()

    # Formateo de respuesta
    grouped = {}
    for key, hour, clicks in results:
        grouped.setdefault(key, []).append({
            "date": hour,
            "value": clicks
        })

    return [{"name": key, "color": "#8b5cf6", "data": values} for key, values in grouped.items()]

@app.get("/urls", response_model=List[schemas.URLList])
def get_all_urls(db: Session = Depends(get_db)):
    return db.query(models.URL).all()

@app.get("/url/{key}/locations", response_model=List[dict])
def url_locations(key: str, db: Session = Depends(get_db)):
    locations = geo_info.get_geo_info_names(db, key)
    if not locations:
        raise HTTPException(status_code=404, detail="Localización no encontrada")
    return locations

@app.get("/{url_key}")
def forward_to_target_url(
    url_key: str,
    request: Request,
    db: Session = Depends(get_db)
):
    db_url = crud.get_db_url_by_key(db=db, url_key=url_key)
    if not db_url:
        raise_not_found(request)

    crud.update_db_clicks(db=db, db_url=db_url)

    user_agent = request.headers.get("user-agent", "")
    referer = request.headers.get("referer", "")
    ip_address = request.headers.get("X-Forwarded-For", request.client.host)

    # NUEVO: obtener coordenadas y reverse geocoding
    loc = get_location_from_ip(ip_address)
    geo_info = None
    if loc:
        try:
            lat, lon = map(float, loc.split(","))
            location = rg.search((lat, lon))[0]
            geo_info = {
                "loc": loc,
                "city": location.get("name"),
                "state": location.get("admin1"),
                "country_code": location.get("cc")
            }
        except Exception as e:
            print("Error procesando coordenadas:", e)

    # Guardar clic con geo_info
    click_log = ClickLog(
        url_id=db_url.id,
        timestamp=datetime.utcnow(),
        user_agent=user_agent,
        referer=referer,
        ip_address=ip_address,
        geo_info=geo_info
    )
    db.add(click_log)
    db.commit()

    return RedirectResponse(db_url.target_url)

