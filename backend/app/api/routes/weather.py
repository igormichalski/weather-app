from fastapi import APIRouter, Query
from typing import Optional
from datetime import date
from app.services.weather_service import fetch_full_weather
from app.services.youtube_service import search_location_videos
from app.core.config import get_settings

router = APIRouter(prefix="/api/weather", tags=["weather"])
settings = get_settings()


@router.get("/{location}")
async def get_weather(
    location: str,
    date_from: Optional[str] = Query(None),
    date_to:   Optional[str] = Query(None),
):
    """
    Busca clima + forecast para qualquer localização.
    Se date_from e date_to forem passados, filtra o forecast para aquele período.
    """
    location_meta, current, forecast_days = await fetch_full_weather(location)

    # Filtra o forecast pelo período se fornecido
    filtered_forecast = forecast_days
    date_range_used = False

    if date_from and date_to:
        try:
            d_from = date.fromisoformat(date_from)
            d_to   = date.fromisoformat(date_to)

            if d_from > d_to:
                from fastapi import HTTPException
                raise HTTPException(422, "date_from deve ser antes de date_to")

            filtered_forecast = [
                d for d in forecast_days
                if d_from <= date.fromisoformat(d["date"]) <= d_to
            ]
            date_range_used = True
        except ValueError:
            from fastapi import HTTPException
            raise HTTPException(422, "Datas devem estar no formato YYYY-MM-DD")

    return {
        "current": {
            "city":        location_meta["city"],
            "country":     location_meta["country"],
            "latitude":    location_meta["latitude"],
            "longitude":   location_meta["longitude"],
            "temperature": round(current["main"]["temp"], 1),
            "feels_like":  round(current["main"]["feels_like"], 1),
            "humidity":    current["main"]["humidity"],
            "description": current["weather"][0]["description"].title(),
            "icon":        current["weather"][0]["icon"],
            "wind_speed":  round(current["wind"]["speed"] * 3.6, 1),
            "visibility":  current.get("visibility", 0) // 1000,
            "pressure":    current["main"]["pressure"],
        },
        "forecast":        filtered_forecast,
        "date_range_used": date_range_used,
        "date_from":       date_from,
        "date_to":         date_to,
        "google_maps_key": settings.google_maps_api_key,
    }


@router.get("/{location}/videos")
async def get_videos(location: str, max_results: int = 4):
    """Busca vídeos do YouTube para uma localização."""
    location_meta, _, _ = await fetch_full_weather(location)
    videos = await search_location_videos(
        location_meta["city"],
        location_meta["country"],
        max_results=max_results,
    )
    return videos
