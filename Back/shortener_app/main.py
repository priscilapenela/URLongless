from fastapi import FastAPI, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from . import models, schemas
from .database import SessionLocal, engine
from fastapi.responses import RedirectResponse, FileResponse
from . import schemas, models, crud
from starlette.datastructures import URL
from .config import get_settings
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import segno
import os
import uuid

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

class QRRequest(BaseModel):
    target_url: str  # debe coincidir con tu frontend

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


@app.get("/urls", response_model=List[schemas.URLList])
def get_all_urls(db: Session = Depends(get_db)):
    return db.query(models.URL).all()

@app.get("/{url_key}")
def forward_to_target_url(
        url_key: str,
        request: Request,
        db: Session = Depends(get_db)
    ):
    if db_url := crud.get_db_url_by_key(db=db, url_key=url_key):
        crud.update_db_clicks(db=db, db_url=db_url)
        return RedirectResponse(db_url.target_url)
    else:
        raise_not_found(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # o ["*"] para permitir todo durante desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)