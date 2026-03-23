import httpx
from fastapi import HTTPException
from app.core.config import get_settings

settings = get_settings()
YT_BASE = "https://www.googleapis.com/youtube/v3"


async def search_location_videos(city: str, country: str, max_results: int = 4) -> list:
    """Busca vídeos de viagem/turismo para uma localização."""
    query = f"{city} {country} travel tourism"

    params = {
        "part":              "snippet",
        "q":                 query,
        "type":              "video",
        "maxResults":        max_results,
        "key":               settings.youtube_api_key,
        "relevanceLanguage": "en",
        "safeSearch":        "strict",
    }

    async with httpx.AsyncClient() as client:
        r = await client.get(f"{YT_BASE}/search", params=params, timeout=10)

    if r.status_code == 403:
        raise HTTPException(403, "Cota do YouTube excedida ou chave inválida")
    if r.status_code != 200:
        raise HTTPException(502, "YouTube API indisponível")

    items = r.json().get("items", [])

    return [
        {
            "video_id":  item["id"]["videoId"],
            "title":     item["snippet"]["title"],
            "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"],
            "channel":   item["snippet"]["channelTitle"],
        }
        for item in items
        if item.get("id", {}).get("videoId")
    ]
