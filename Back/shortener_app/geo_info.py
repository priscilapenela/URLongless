import reverse_geocoder as rg
from typing import List
from sqlalchemy.orm import Session, joinedload
from .models import URL
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, ForeignKey

def get_geo_info_names(db: Session, url_key: str) -> List[dict]:
    url = db.query(URL).options(joinedload(URL.click_logs)).filter(URL.key == url_key).first()
    click_logs = relationship("ClickLog", back_populates="url")
    url = relationship("URL", back_populates="click_logs")
    url_id = Column(Integer, ForeignKey("urls.id"))
    
    if not url:
        return []

    results = []
    for click in url.click_logs:
        if click.geo_info and "loc" in click.geo_info:
            lat_str, lon_str = click.geo_info["loc"].split(",")
            lat, lon = float(lat_str), float(lon_str)
            location = rg.search((lat, lon))[0]
            results.append({
                "lat": lat,
                "lon": lon,
                "city": location.get("name"),
                "state": location.get("admin1"),
                "county": location.get("admin2"),
                "country_code": location.get("cc"),
            })
    return results