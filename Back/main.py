from pydantic import BaseModel
import string, random
from fastapi import FastAPI,HTTPException
from fastapi.responses import RedirectResponse


app = FastAPI()

urls_db = {}  # temporal, luego lo conectaremos a una base de datos

class URLRequest(BaseModel):
    original_url: str

@app.post("/shorten")
def shorten_url(request: URLRequest):
    short_code = generate_short_code()
    urls_db[short_code] = request.original_url
    return {"short_url": f"http://localhost:8000/{short_code}"}



@app.get("/{short_code}")
def redirect_to_url(short_code: str):
    if short_code in urls_db:
        return RedirectResponse(url=urls_db[short_code])
    raise HTTPException(status_code=404, detail="URL no encontrada")



class URLRequest(BaseModel):
    original_url: str


def generate_short_code(length=6):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))
