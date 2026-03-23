import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator, model_validator
from datetime import date

from app.db.database import get_db
from app.models.weather_record import WeatherRecord
from app.services.weather_service import fetch_full_weather

router = APIRouter(prefix="/api/records", tags=["records"])


# ── Schemas de validação ───────────────────────────────────────────────────────

class RecordCreate(BaseModel):
    location_query: str
    date_from: str
    date_to: str
    notes: Optional[str] = None

    @field_validator("date_from", "date_to")
    @classmethod
    def validate_date(cls, v):
        try:
            date.fromisoformat(v)
        except ValueError:
            raise ValueError(f"Data deve estar no formato YYYY-MM-DD, recebido: {v}")
        return v

    @model_validator(mode="after")
    def validate_range(self):
        d_from = date.fromisoformat(self.date_from)
        d_to   = date.fromisoformat(self.date_to)
        if d_from > d_to:
            raise ValueError("date_from deve ser antes ou igual a date_to")
        if (d_to - d_from).days > 365:
            raise ValueError("Intervalo não pode exceder 365 dias")
        return self


class RecordUpdate(BaseModel):
    location_query: Optional[str] = None
    date_from:      Optional[str] = None
    date_to:        Optional[str] = None
    notes:          Optional[str] = None

    @field_validator("date_from", "date_to")
    @classmethod
    def validate_date(cls, v):
        if v is None:
            return v
        try:
            date.fromisoformat(v)
        except ValueError:
            raise ValueError(f"Data deve estar no formato YYYY-MM-DD, recebido: {v}")
        return v


# ── CREATE ─────────────────────────────────────────────────────────────────────

@router.post("/", status_code=201)
async def create_record(payload: RecordCreate, db: Session = Depends(get_db)):
    """Cria um registro de clima para uma localização e intervalo de datas."""
    location_meta, current, forecast = await fetch_full_weather(payload.location_query)

    record = WeatherRecord(
        location_query = payload.location_query,
        city           = location_meta["city"],
        country        = location_meta["country"],
        latitude       = location_meta["latitude"],
        longitude      = location_meta["longitude"],
        date_from      = payload.date_from,
        date_to        = payload.date_to,
        weather_data   = json.dumps({"current": current, "forecast": forecast}),
        notes          = payload.notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _serialize(record)


# ── READ ALL ───────────────────────────────────────────────────────────────────

@router.get("/")
def list_records(
    skip:  int            = Query(0, ge=0),
    limit: int            = Query(50, ge=1, le=200),
    city:  Optional[str]  = Query(None),
    db:    Session        = Depends(get_db),
):
    """Lista todos os registros salvos, com filtro opcional por cidade."""
    query = db.query(WeatherRecord)
    if city:
        query = query.filter(WeatherRecord.city.ilike(f"%{city}%"))
    records = query.order_by(WeatherRecord.created_at.desc()).offset(skip).limit(limit).all()
    return [_serialize(r) for r in records]


# ── READ ONE ───────────────────────────────────────────────────────────────────

@router.get("/{record_id}")
def get_record(record_id: int, db: Session = Depends(get_db)):
    """Retorna um registro específico pelo ID."""
    return _serialize(_get_or_404(record_id, db))


# ── UPDATE ─────────────────────────────────────────────────────────────────────

@router.patch("/{record_id}")
async def update_record(record_id: int, payload: RecordUpdate, db: Session = Depends(get_db)):
    """Atualiza campos de um registro. Se a localização mudar, rebusca o clima."""
    record = _get_or_404(record_id, db)

    if payload.location_query and payload.location_query != record.location_query:
        location_meta, current, forecast = await fetch_full_weather(payload.location_query)
        record.location_query = payload.location_query
        record.city           = location_meta["city"]
        record.country        = location_meta["country"]
        record.latitude       = location_meta["latitude"]
        record.longitude      = location_meta["longitude"]
        record.weather_data   = json.dumps({"current": current, "forecast": forecast})

    if payload.date_from:
        record.date_from = payload.date_from
    if payload.date_to:
        record.date_to = payload.date_to
    if payload.notes is not None:
        record.notes = payload.notes

    d_from = date.fromisoformat(record.date_from)
    d_to   = date.fromisoformat(record.date_to)
    if d_from > d_to:
        raise HTTPException(422, "date_from deve ser antes ou igual a date_to")

    db.commit()
    db.refresh(record)
    return _serialize(record)


# ── DELETE ─────────────────────────────────────────────────────────────────────

@router.delete("/{record_id}", status_code=204)
def delete_record(record_id: int, db: Session = Depends(get_db)):
    """Deleta um registro pelo ID."""
    record = _get_or_404(record_id, db)
    db.delete(record)
    db.commit()


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_or_404(record_id: int, db: Session) -> WeatherRecord:
    record = db.query(WeatherRecord).filter(WeatherRecord.id == record_id).first()
    if not record:
        raise HTTPException(404, f"Registro {record_id} não encontrado")
    return record


def _serialize(record: WeatherRecord) -> dict:
    return {
        "id":             record.id,
        "location_query": record.location_query,
        "city":           record.city,
        "country":        record.country,
        "latitude":       record.latitude,
        "longitude":      record.longitude,
        "date_from":      record.date_from,
        "date_to":        record.date_to,
        "weather_data":   json.loads(record.weather_data),
        "notes":          record.notes,
        "created_at":     str(record.created_at),
        "updated_at":     str(record.updated_at) if record.updated_at else None,
    }


# ── EXPORT ─────────────────────────────────────────────────────────────────────

from app.services.export_service import export_records as _export

@router.get("/export/{fmt}")
def export(
    fmt:  str,
    city: Optional[str] = Query(None),
    db:   Session       = Depends(get_db),
):
    """Exporta registros em json, csv, xml, markdown ou pdf."""
    query = db.query(WeatherRecord)
    if city:
        query = query.filter(WeatherRecord.city.ilike(f"%{city}%"))
    records = query.order_by(WeatherRecord.created_at.desc()).all()
    return _export(records, fmt)
