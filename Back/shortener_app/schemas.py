from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class URLBase(BaseModel):
    target_url: str
    custom_key: Optional[str] = None  # Campo opcional

class URL(URLBase):
    is_active: bool
    clicks: int

    class Config:
        from_attributes = True

class URLInfo(URL):
    url: str
    admin_url: str

    class Config:
        from_attributes = True

class URLList(BaseModel):
    id: int
    target_url: str
    key: str
    is_active: bool
    clicks: int
    created_at: datetime

    class Config:
        from_attributes = True

class URLInfoExtended(URLList):
    url: str
    admin_url: str

    class Config:
        from_attributes = True

class ClickLogOut(BaseModel):
    timestamp: datetime
    ip_address: Optional[str]
    user_agent: Optional[str]
    referer: Optional[str]
    geo_info: Optional[dict]

    class Config:
        from_attributes = True

class URLWithClicks(URLInfo):
    click_logs: List[ClickLogOut]
