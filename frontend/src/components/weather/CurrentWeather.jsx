import useStore from '../../store/useStore'

const OWM_ICON = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`

function StatCard({ label, value, unit }) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-xs font-display text-night-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-display font-semibold text-white">
        {value}
        {unit && <span className="text-sm text-night-400 ml-1">{unit}</span>}
      </p>
    </div>
  )
}

export default function CurrentWeather() {
  const { weather } = useStore()
  if (!weather) return null

  const c = weather.current

  return (
    <div className="card fade-up">
      {/* Top row */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-3xl text-white leading-tight">
            {c.city}
            <span className="text-night-400 font-normal">, {c.country}</span>
          </h2>
          <p className="text-night-300 mt-1">{c.description}</p>
          <p className="text-xs text-night-500 mt-1 font-mono">
            {c.latitude.toFixed(4)}°, {c.longitude.toFixed(4)}°
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <img src={OWM_ICON(c.icon)} alt={c.description} className="w-20 h-20" />
          <div className="text-right">
            <p className="font-display font-bold text-5xl aurora-text leading-none">
              {Math.round(c.temperature)}°
            </p>
            <p className="text-sm text-night-400 mt-1">Feels {Math.round(c.feels_like)}°C</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Humidity"   value={c.humidity}   unit="%" />
        <StatCard label="Wind"       value={c.wind_speed} unit="km/h" />
        <StatCard label="Visibility" value={c.visibility} unit="km" />
        <StatCard label="Pressure"   value={c.pressure}   unit="hPa" />
      </div>
    </div>
  )
}
