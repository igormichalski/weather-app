import { useState } from 'react'
import useStore from '../../store/useStore'
import toast from 'react-hot-toast'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [locating, setLocating] = useState(false)
  const { fetchWeather, weatherLoading } = useStore()

  const handleSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) { toast.error('Please enter a location'); return }
    fetchWeather(q)
  }

  const handleGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const q = `${coords.latitude.toFixed(4)},${coords.longitude.toFixed(4)}`
        setQuery(q)
        fetchWeather(q)
        setLocating(false)
      },
      () => {
        toast.error('Could not get your location. Please allow location access.')
        setLocating(false)
      },
      { timeout: 8000 }
    )
  }

  const quickSearch = (place) => {
    setQuery(place)
    fetchWeather(place)
  }

  const busy = weatherLoading || locating

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex gap-3 items-center">
        {/* Input */}
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-night-500">
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="City, ZIP code, landmark, or lat,lon…"
            className="input-field pl-11"
            disabled={busy}
            autoFocus
          />
        </div>

        {/* GPS */}
        <button type="button" onClick={handleGPS} disabled={busy}
          className="btn-ghost flex items-center gap-2 shrink-0">
          {locating
            ? <span className="w-4 h-4 border-2 border-aurora-cyan border-t-transparent rounded-full animate-spin" />
            : '📍'}
          <span className="hidden sm:inline">My Location</span>
        </button>

        {/* Search */}
        <button type="submit" disabled={busy}
          className="btn-primary flex items-center gap-2 shrink-0">
          {weatherLoading
            ? <span className="w-4 h-4 border-2 border-night-900 border-t-transparent rounded-full animate-spin" />
            : '🔍'}
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {/* Quick searches */}
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="text-xs text-night-500">Try:</span>
        {['Tokyo', 'New York', 'London', 'Paris', 'Sydney'].map(place => (
          <button key={place} type="button"
            onClick={() => quickSearch(place)}
            className="text-xs text-night-400 hover:text-aurora-cyan transition-colors">
            {place}
          </button>
        ))}
      </div>
    </div>
  )
}
