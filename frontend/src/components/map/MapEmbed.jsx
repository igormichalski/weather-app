import useStore from '../../store/useStore'

export default function MapEmbed() {
  const { weather } = useStore()
  if (!weather) return null

  const { current, google_maps_key } = weather

  if (!google_maps_key) {
    return (
      <div className="card flex items-center justify-center h-48 text-night-500 text-sm">
        Add GOOGLE_MAPS_API_KEY to enable map
      </div>
    )
  }

  const src = `https://www.google.com/maps/embed/v1/place?key=${google_maps_key}&q=${encodeURIComponent(
    `${current.city},${current.country}`
  )}&zoom=11`

  return (
    <div>
      <h3 className="section-title mb-4">Location Map</h3>
      <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <iframe
          title={`Map of ${current.city}`}
          src={src}
          width="100%"
          height="340"
          style={{ border: 0, display: 'block', filter: 'invert(0.9) hue-rotate(180deg)' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  )
}
