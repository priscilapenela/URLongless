#main.py
from fastapi import FastAPI, HTTPException, Depends, Request, APIRouter, Query
from sqlalchemy.orm import Session
from . import models, schemas, geo_info, crud
from .database import SessionLocal, engine, get_db
from fastapi.responses import RedirectResponse, FileResponse
from starlette.datastructures import URL as StarletteURL
from .config import get_settings
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from .models import ClickLog, URL 
from datetime import datetime, timezone, timedelta
from sqlalchemy import func, text, label
from .schemas import DonutChartResponse, DonutChartDataItem
import requests
import reverse_geocoder as rg
import segno
import os
import uuid

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Asegura ambos orígenes si el frontend varía
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QRRequest(BaseModel):
    target_url: str

def get_location_from_ip(ip):
    try:
        response = requests.get(f"https://ipinfo.io/{ip}/json")
        if response.status_code == 200:
            data = response.json()
            if "loc" in data:
                return data["loc"]
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
    settings = get_settings()
    
    # Usa la StarletteURL renombrada para construir las URLs
    base_url_obj = StarletteURL(settings.base_url) 
    
    admin_endpoint_path = app.url_path_for("administration info", secret_key=db_url.secret_key)
    
    short_url = str(base_url_obj.replace(path=db_url.key))
    admin_url = str(base_url_obj.replace(path=admin_endpoint_path))

    return schemas.URLInfo(
        target_url=db_url.target_url,
        is_active=db_url.is_active,
        clicks=db_url.clicks,
        custom_name=db_url.custom_name,
        admin_url=admin_url,
        url=short_url,
    )

@app.delete("/admin/{secret_key}")
def delete_url(
    secret_key: str, request: Request, db: Session = Depends(get_db)
):
    if db_url := crud.deactivate_db_url_by_secret_key(db, secret_key=secret_key):
        message = f"Successfully deleted shortened URL for '{db_url.target_url}'"
        return {"detail": message}
    else:
        raise_not_found(request)

@app.get("/analytics/referers")
def referrers_analytics(
    db: Session = Depends(get_db),
    start: datetime = Query(None),
    end: datetime = Query(None)    
):
    query = db.query(
        models.ClickLog.referer,
        func.count(models.ClickLog.id).label("total_clicks")
    ).group_by(models.ClickLog.referer).order_by(func.count(models.ClickLog.id).desc())

    if start:
        query = query.filter(models.ClickLog.timestamp >= start)
    if end:
        query = query.filter(models.ClickLog.timestamp <= end)

    results = query.all()
    formatted_results = []
    for referer, total_clicks in results:
        display_referer = referer if referer else "Directo / Desconocido"
        formatted_results.append({
            "key": display_referer,
            "value": total_clicks
        })

    return formatted_results

@app.get("/analytics/clicks_over_time")
def clicks_over_time(
    db: Session = Depends(get_db),
    start: datetime = Query(None),
    end: datetime = Query(None),
):
    print(f"Backend: Recibida petición para clicks_over_time. Start: {start}, End: {end}")

    day_expression = label("day", text("TO_CHAR(click_logs.timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD')"))

    query = db.query(
        models.URL.key.label("key"),
        day_expression, # Usamos la expresión de texto aquí
        func.count().label("clicks")
    ).join(models.ClickLog)

    if start:
        query = query.filter(models.ClickLog.timestamp >= start)
    if end:
        query = query.filter(models.ClickLog.timestamp <= end)

    query = query.group_by(models.URL.key, text("day")).order_by(text("day"))

    results = query.all()
    print(f"Backend: Resultados de la consulta SQL (raw): {results}")

    all_dates = []
    if start and end:
        current_date = start.date() # Obtener solo la parte de la fecha
        end_date_only = end.date()
        while current_date <= end_date_only:
            all_dates.append(current_date.strftime('%Y-%m-%d'))
            current_date += timedelta(days=1)

    grouped_by_url_and_day = {}
    for r in results:
        url_key = r.key
        day_str = r.day # Esto ya es 'YYYY-MM-DD'
        clicks = r.clicks

        if url_key not in grouped_by_url_and_day:
            grouped_by_url_and_day[url_key] = {}
        grouped_by_url_and_day[url_key][day_str] = clicks
    
    processed_series = []
    for url_key, daily_data in grouped_by_url_and_day.items():
        series_data_for_url = []
        for date_str in all_dates:
            value = daily_data.get(date_str, 0) # Obtén el valor, 0 si no hay clics para ese día
            series_data_for_url.append({
                "date": date_str,
                "value": value
            })
        processed_series.append({
            "name": url_key,
            "data": series_data_for_url
        })

    return processed_series

@app.get("/analytics/geo_clicks")
def geo_clicks_analytics(
    db: Session = Depends(get_db),
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None)
):
    query = db.query(
        models.ClickLog,
        models.URL.key.label("short_code")
    ).join(models.URL, models.ClickLog.url_id == models.URL.id)

    if start:
        query = query.filter(models.ClickLog.timestamp >= start)
    if end:
        query = query.filter(models.ClickLog.timestamp <= end)

    results = query.all()

    country_data = {}

    for log_entry, short_code_val in results:
        country_code = "Unknown"
        if log_entry.geo_info:
            geo_data = log_entry.geo_info
            if isinstance(geo_data, dict):
                if 'country_code' in geo_data and geo_data['country_code']:
                    country_code = geo_data['country_code']
                elif 'country' in geo_data and geo_data['country']:
                    country_code = geo_data['country']

        clicks_count = log_entry.clicks if hasattr(log_entry, 'clicks') and log_entry.clicks is not None else 1

        if country_code not in country_data:
            country_data[country_code] = {"total_clicks": 0, "unique_links": set()}

        country_data[country_code]["total_clicks"] += clicks_count
        country_data[country_code]["unique_links"].add(short_code_val)

    formatted_results = [
        {
            "country": country,
            "total_clicks": data["total_clicks"],
            "unique_links_count": len(data["unique_links"])
        }
        for country, data in country_data.items()
    ]

    formatted_results.sort(key=lambda x: x['total_clicks'], reverse=True)

    return formatted_results

@app.get("/analytics/clicks_by_url", response_model=DonutChartResponse)
async def get_clicks_by_url(
    db: Session = Depends(get_db),
    start: Optional[datetime] = Query(None, description="Fecha de inicio (YYYY-MM-DDTHH:MM:SSZ)"),
    end: Optional[datetime] = Query(None, description="Fecha de fin (YYYY-MM-DDTHH:MM:SSZ)"),
):
    print(f"Backend: Recibida petición para clicks_by_url. Start: {start}, End: {end}") # <-- CRUCIAL
    query = db.query(
        URL.custom_name,
        URL.key,
        func.count(ClickLog.id).label("total_clicks")
    ).join(ClickLog, URL.id == ClickLog.url_id)

    if start:
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        query = query.filter(ClickLog.timestamp >= start)
    if end:
        if end.tzinfo is None:
            end = end.replace(tzinfo=timezone.utc)
        query = query.filter(ClickLog.timestamp <= end)

    query = query.group_by(models.URL.id, models.URL.custom_name, models.URL.key)
    query = query.order_by(func.count(ClickLog.id).desc())

    import logging
    logging.basicConfig()
    logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

    url_data_raw = query.all()
    print(f"Backend: Resultados de la consulta SQL (raw): {url_data_raw}")

    series_data: List[DonutChartDataItem] = []
    total_clicks_sum = 0

    for custom_name, key, total_clicks in url_data_raw:
        name_for_chart = custom_name if custom_name else key
        series_data.append(DonutChartDataItem(name=name_for_chart, value=total_clicks))
        total_clicks_sum += total_clicks

    if not series_data:
        return DonutChartResponse(series=[], total=0)

    return DonutChartResponse(series=series_data, total=total_clicks_sum)

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

    from datetime import datetime
    db_url.last_accessed = datetime.now() # Usa datetime.now() para la hora local o datetime.utcnow() para UTC
    db.add(db_url) # Vuelve a añadir a la sesión para marcarlo como modificado, aunque el commit lo manejará
    db.commit() # Guarda los cambios, incluyendo last_accessed
    db.refresh(db_url) # Refresca para obtener el estado más reciente de la DB

    user_agent = request.headers.get("user-agent", "")
    referer = request.headers.get("referer", "")
    ip_address = request.headers.get("X-Forwarded-For", request.client.host)

    loc = get_location_from_ip(ip_address)
    geo_info_data = None # Renombrado para evitar conflicto con el módulo geo_info
    if loc:
        try:
            lat, lon = map(float, loc.split(","))
            location = rg.search((lat, lon))[0]
            geo_info_data = {
                "loc": loc,
                "city": location.get("name"),
                "state": location.get("admin1"),
                "country_code": location.get("cc")
            }
        except Exception as e:
            print("Error procesando coordenadas:", e)

    click_log = ClickLog(
        url_id=db_url.id,
        timestamp=datetime.utcnow(),
        user_agent=user_agent,
        referer=referer,
        ip_address=ip_address,
        geo_info=geo_info_data 
    )
    db.add(click_log)
    db.commit()
    db.refresh(click_log)
    return RedirectResponse(db_url.target_url)