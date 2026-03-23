from fastapi import APIRouter
from app.services.weather_service import fetch_full_weather
from app.core.config import get_settings

router = APIRouter(prefix="/api/weather", tags=["weather"])
settings = get_settings()


@router.get("/{location}")
async def get_weather(location: str):
    """
    Busca clima atual + previsão de 5 dias para qualquer localização.
    Aceita: nome da cidade, 'Cidade,País', coordenadas 'lat,lon'.
    """
    location_meta, current, forecast_days = await fetch_full_weather(location)

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
        "forecast": forecast_days,
        "google_maps_key": settings.google_maps_api_key,
    }
