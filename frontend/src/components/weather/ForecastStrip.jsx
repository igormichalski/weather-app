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
      <img src={OWM_ICON(day.icon)} alt={day.description} className="w-14 h-14" title={day.description} />
      <p className="text-xs text-night-300 text-center leading-tight">{day.description}</p>

      {/* Temp range */}
      <div className="flex items-center gap-2 font-display">
        <span className="text-aurora-cyan font-semibold text-sm">{Math.round(day.temp_max)}°</span>
        <span className="text-night-600 text-xs">/</span>
        <span className="text-night-400 text-sm">{Math.round(day.temp_min)}°</span>
      </div>

      {/* Rain probability */}
      {popPct > 0 && (
        <p className="text-xs text-blue-300">💧 {popPct}%</p>
      )}

      <p className="text-xs text-night-500">{day.wind_speed} km/h</p>
    </div>
  )
}

export default function ForecastStrip() {
  const { weather } = useStore()
  if (!weather?.forecast?.length) return null

  return (
    <div>
      <h3 className="section-title mb-4">5-Day Forecast</h3>
      <div className="grid grid-cols-5 gap-3">
        {weather.forecast.map((day, i) => (
          <ForecastCard key={day.date} day={day} index={i} />
        ))}
      </div>
    </div>
  )
}
