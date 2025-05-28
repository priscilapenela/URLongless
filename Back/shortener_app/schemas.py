from pydantic import BaseModel
from typing import List

class URLBase(BaseModel):
    target_url: str
    custom_key: str | None = None  # Nuevo campo opcional

class URL(URLBase):
    is_active: bool
    clicks: int

    class Config:
        orm_mode = True

class URLInfo(URL):
    url: str
    admin_url: str

class URLList(BaseModel):
    id: int
    target_url: str
    key: str
    is_active: bool
    clicks: int

    class Config:
        orm_mode = True

class URLInfoExtended(URLList):
    url: str
    admin_url: str