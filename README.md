# 🌍 WeatherSphere

**Full-stack weather application** — PM Accelerator AI Engineer Internship Technical Assessment

> Built by: **Igor Michalski**
> Assessment completed: **Tech Assessment #1 (Frontend) + Tech Assessment #2 (Backend) — Full Stack**

---

## Overview

WeatherSphere is a production-grade weather app that lets users search any location worldwide and get real-time weather data, a 5-day forecast, an interactive map, and curated travel videos — all with full CRUD persistence and multi-format data export.

---

## Features

| Requirement | Status |
|---|---|
| Location input (city, ZIP, GPS coordinates, landmark) | ✅ |
| Current weather with real icons | ✅ |
| 5-day forecast | ✅ |
| Geolocation (current position via browser) | ✅ |
| Error handling (city not found, API failure) | ✅ |
| Responsive design (mobile / tablet / desktop) | ✅ |
| Google Maps embed | ✅ |
| YouTube travel videos | ✅ |
| CRUD — Create records with location + date range | ✅ |
| CRUD — Read / list all saved records | ✅ |
| CRUD — Update records with re-validation | ✅ |
| CRUD — Delete records | ✅ |
| Date range validation | ✅ |
| Location validation via geocoding | ✅ |
| Export: JSON, CSV, XML, PDF, Markdown | ✅ |
| Candidate name + PM Accelerator description | ✅ |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, Axios |
| Backend | Python 3.11, FastAPI, SQLAlchemy, Uvicorn |
| Database | SQLite |
| Weather API | OpenWeatherMap |
| Maps | Google Maps Embed API |
| Videos | YouTube Data API v3 |
| PDF export | ReportLab |

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- API keys (see below)

---

## Getting API Keys

### OpenWeatherMap (required)
1. Go to [openweathermap.org](https://openweathermap.org) → Sign up free
2. Go to **API keys** in your account
3. Copy the default key

### Google Maps + YouTube (optional)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable **Maps Embed API** and **YouTube Data API v3**
3. Go to **Credentials** → Create API Key

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/igormichalski/weather-app.git
cd weather-app
```

### 2. Backend setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
OPENWEATHER_API_KEY=your_key_here
GOOGLE_MAPS_API_KEY=your_key_here
YOUTUBE_API_KEY=your_key_here
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

---

## Running the App

You need **two terminal windows** open simultaneously.

### Terminal 1 — Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
API available at: `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

### Terminal 2 — Frontend
```bash
cd frontend
npm run dev
```
App available at: `http://localhost:5173`

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/weather/{location}` | Current weather + 5-day forecast |
| GET | `/api/weather/{location}/videos` | YouTube videos for location |
| GET | `/api/records/` | List all saved records |
| POST | `/api/records/` | Create a new record |
| GET | `/api/records/{id}` | Get a single record |
| PATCH | `/api/records/{id}` | Update a record |
| DELETE | `/api/records/{id}` | Delete a record |
| GET | `/api/records/export/{fmt}` | Export (json/csv/xml/pdf/markdown) |

---

## Project Structure
```
weather-app/
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   │   ├── weather.py       # Weather + YouTube endpoints
│   │   │   └── records.py       # CRUD + export endpoints
│   │   ├── core/
│   │   │   └── config.py        # Settings from .env
│   │   ├── db/
│   │   │   └── database.py      # SQLAlchemy + SQLite
│   │   ├── models/
│   │   │   └── weather_record.py
│   │   ├── services/
│   │   │   ├── weather_service.py
│   │   │   ├── youtube_service.py
│   │   │   └── export_service.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── weather/         # SearchBar, CurrentWeather, ForecastStrip, VideoGrid
    │   │   ├── crud/            # SaveRecordModal, RecordsTable
    │   │   └── map/             # MapEmbed
    │   ├── services/
    │   │   └── api.js           # Axios client
    │   ├── store/
    │   │   └── useStore.js      # Zustand global state
    │   ├── App.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

---

## License

MIT
