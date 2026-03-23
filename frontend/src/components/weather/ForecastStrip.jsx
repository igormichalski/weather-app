import useStore from '../../store/useStore'

const OWM_ICON = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`

function ForecastCard({ day, index }) {
  const date    = new Date(day.date + 'T12:00:00')
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const popPct  = Math.round(day.pop * 100)

  return (
    <div className="glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/[0.07] transition-colors duration-200"
      style={{ animation: `fadeUp 0.5s ease ${index * 80}ms both` }}>
      <p className="font-display font-semibold text-sm text-white">{dayName}</p>
      <p className="text-xs text-night-400">{dateStr}</p>
      <img src={OWM_ICON(day.icon)} alt={day.description} className="w-14 h-14" />
      <p className="text-xs text-night-300 text-center leading-tight">{day.description}</p>
      <div className="flex items-center gap-2 font-display">
        <span className="text-aurora-cyan font-semibold text-sm">{Math.round(day.temp_max)}°</span>
        <span className="text-night-600 text-xs">/</span>
        <span className="text-night-400 text-sm">{Math.round(day.temp_min)}°</span>
      </div>
      {popPct > 0 && <p className="text-xs text-blue-300">💧 {popPct}%</p>}
      <p className="text-xs text-night-500">{day.wind_speed} km/h</p>
    </div>
  )
}

export default function ForecastStrip() {
  const { weather } = useStore()
  if (!weather) return null

  const { forecast, date_range_used, date_from, date_to } = weather

  // Sem date range — comportamento normal
  if (!date_range_used) {
    if (!forecast?.length) return null
    return (
      <div>
        <h3 className="section-title mb-4">5-Day Forecast</h3>
        <div className="grid grid-cols-5 gap-3">
          {forecast.map((day, i) => <ForecastCard key={day.date} day={day} index={i} />)}
        </div>
      </div>
    )
  }

  // Com date range mas sem dados disponíveis
  if (date_range_used && (!forecast || forecast.length === 0)) {
    return (
      <div className="card flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📅</span>
          <div>
            <p className="font-display font-medium text-white">No forecast available for this period</p>
            <p className="text-sm text-night-400 mt-1 font-body">
              The requested period <span className="text-aurora-cyan font-mono">{date_from}</span> → <span className="text-aurora-cyan font-mono">{date_to}</span> is outside
              the 5-day forecast window. OpenWeatherMap provides forecasts for up to 5 days ahead.
            </p>
            <p className="text-sm text-night-400 mt-1 font-body">
              Showing current conditions only.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Com date range e com dados
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="section-title">Forecast</h3>
        <span className="tag text-xs font-mono">{date_from} → {date_to}</span>
      </div>
      <div className={`grid gap-3 ${forecast.length <= 3 ? 'grid-cols-3' : 'grid-cols-5'}`}>
        {forecast.map((day, i) => <ForecastCard key={day.date} day={day} index={i} />)}
      </div>
    </div>
  )
}
