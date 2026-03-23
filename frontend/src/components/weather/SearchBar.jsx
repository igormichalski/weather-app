import { useState } from 'react'
import useStore from '../../store/useStore'
import toast from 'react-hot-toast'

export default function SearchBar() {
  const [query,    setQuery]    = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')
  const [locating, setLocating] = useState(false)
  const { fetchWeather, weatherLoading } = useStore()

  const handleSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) { toast.error('Please enter a location'); return }

    if ((dateFrom && !dateTo) || (!dateFrom && dateTo)) {
      toast.error('Please fill both date fields or leave both empty')
      return
    }
    if (dateFrom && dateTo && dateFrom > dateTo) {
      toast.error('Start date must be before end date')
      return
    }

    fetchWeather(q, dateFrom || null, dateTo || null)
  }

  const handleGPS = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const q = `${coords.latitude.toFixed(4)},${coords.longitude.toFixed(4)}`
        setQuery(q)
        fetchWeather(q, dateFrom || null, dateTo || null)
        setLocating(false)
      },
      () => { toast.error('Could not get your location'); setLocating(false) },
      { timeout: 8000 }
    )
  }

  const quickSearch = (place) => {
    setQuery(place)
    setDateFrom('')
    setDateTo('')
    fetchWeather(place, null, null)
  }

  const busy = weatherLoading || locating

  return (
    <div className="w-full flex flex-col gap-3">

      {/* Location row */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-night-500">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            placeholder="City, ZIP code, landmark, or lat,lon…"
            className="input-field pl-11"
            disabled={busy}
            autoFocus
          />
        </div>
        <button type="button" onClick={handleGPS} disabled={busy}
          className="btn-ghost flex items-center gap-2 shrink-0">
          {locating
            ? <span className="w-4 h-4 border-2 border-aurora-cyan border-t-transparent rounded-full animate-spin" />
            : '📍'}
          <span className="hidden sm:inline">My Location</span>
        </button>
      </div>

      {/* Date range row */}
      <div className="flex gap-3 items-center">
        <div className="flex-1 flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-night-500 font-display uppercase tracking-wider mb-1 block">
              From <span className="text-night-600">(optional)</span>
            </label>
            <input type="date" value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-field text-sm" disabled={busy} />
          </div>
          <div className="flex-1">
            <label className="text-xs text-night-500 font-display uppercase tracking-wider mb-1 block">
              To <span className="text-night-600">(optional)</span>
            </label>
            <input type="date" value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-field text-sm" disabled={busy} />
          </div>
        </div>
        <button type="button" onClick={handleSearch} disabled={busy}
          className="btn-primary flex items-center gap-2 shrink-0 mt-5">
          {weatherLoading
            ? <span className="w-4 h-4 border-2 border-night-900 border-t-transparent rounded-full animate-spin" />
            : '🔍'}
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Quick searches */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-night-500">Try:</span>
        {['Tokyo', 'New York', 'London', 'Paris', 'Sydney'].map(place => (
          <button key={place} type="button" onClick={() => quickSearch(place)}
            className="text-xs text-night-400 hover:text-aurora-cyan transition-colors">
            {place}
          </button>
        ))}
      </div>
    </div>
  )
}
