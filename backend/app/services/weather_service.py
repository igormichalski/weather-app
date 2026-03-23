import httpx
from fastapi import HTTPException
from app.core.config import get_settings

settings = get_settings()
OWM_BASE = "https://api.openweathermap.org"


async def geocode_location(query: str) -> dict:
    """Converte qualquer texto de localização em lat/lon + nome da cidade."""
    url = f"{OWM_BASE}/geo/1.0/direct"
    params = {"q": query, "limit": 1, "appid": settings.openweather_api_key}

    async with httpx.AsyncClient() as client:
        r = await client.get(url, params=params, timeout=10)

    if r.status_code != 200:
        raise HTTPException(502, "Serviço de geocoding indisponível")

    data = r.json()
    if not data:
        raise HTTPException(404, f"Localização não encontrada: '{query}'")

    loc = data[0]
    return {
        "city":      loc.get("name", query),
        "country":   loc.get("country", ""),
        "latitude":  loc["lat"],
        "longitude": loc["lon"],
    }


async def get_current_weather(lat: float, lon: float) -> dict:
    """Busca o clima atual para uma coordenada."""
    url = f"{OWM_BASE}/data/2.5/weather"
    params = {
        "lat": lat, "lon": lon,
        "appid": settings.openweather_api_key,
        "units": "metric",
    }
    async with httpx.AsyncClient() as client:
        r = await client.get(url, params=params, timeout=10)

    if r.status_code != 200:
        raise HTTPException(502, f"Erro na API de clima: {r.text}")
    return r.json()


async def get_forecast(lat: float, lon: float) -> dict:
    """Busca a previsão de 5 dias (intervalos de 3h)."""
    url = f"{OWM_BASE}/data/2.5/forecast"
    params = {
        "lat": lat, "lon": lon,
        "appid": settings.openweather_api_key,
        "units": "metric",
        "cnt": 40,
    }
    async with httpx.AsyncClient() as client:
        r = await client.get(url, params=params, timeout=10)

    if r.status_code != 200:
        raise HTTPException(502, f"Erro na API de previsão: {r.text}")
    return r.json()


def parse_forecast(forecast_data: dict) -> list:
    """Agrupa os intervalos de 3h em resumos diários."""
    from collections import defaultdict

    daily = defaultdict(list)
    for item in forecast_data["list"]:
        day = item["dt_txt"][:10]
        daily[day].append(item)

    days = []
    for day_str, slots in sorted(daily.items())[:5]:
        temps   = [s["main"]["temp"] for s in slots]
        midday  = next((s for s in slots if "12:00" in s["dt_txt"]), slots[0])
        days.append({
            "date":        day_str,
            "temp_min":    round(min(temps), 1),
            "temp_max":    round(max(temps), 1),
            "description": midday["weather"][0]["description"].title(),
            "icon":        midday["weather"][0]["icon"],
            "humidity":    midday["main"]["humidity"],
            "wind_speed":  round(midday["wind"]["speed"] * 3.6, 1),
            "pop":         round(max(s.get("pop", 0) for s in slots), 2),
        })
    return days


async def fetch_full_weather(location_query: str) -> tuple:
    """
    Ponto de entrada principal.
    Retorna (location_meta, current_data, forecast_days).
    """
    import asyncio

    # Detecta se é coordenada "lat,lon"
    parts = location_query.split(",")
    if len(parts) == 2:
        try:
            lat, lon = float(parts[0].strip()), float(parts[1].strip())
            location_meta = {"city": f"{lat},{lon}", "country": "",
                             "latitude": lat, "longitude": lon}
        except ValueError:
            location_meta = await geocode_location(location_query)
    else:
        location_meta = await geocode_location(location_query)

    lat = location_meta["latitude"]
    lon = location_meta["longitude"]

    current, forecast_raw = await asyncio.gather(
        get_current_weather(lat, lon),
        get_forecast(lat, lon),
    )

    forecast_days = parse_forecast(forecast_raw)

    return location_meta, current, forecast_days
