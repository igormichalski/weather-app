import useStore from '../../store/useStore'

export default function VideoGrid() {
  const { videos } = useStore()
  if (!videos?.length) return null

  return (
    <div>
      <h3 className="section-title mb-4">Explore the Destination</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {videos.map((v) => (
          <a key={v.video_id}
            href={`https://youtube.com/watch?v=${v.video_id}`}
            target="_blank" rel="noopener noreferrer"
            className="glass rounded-xl overflow-hidden group hover:bg-white/10 transition-all duration-200">

            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              <img src={v.thumbnail} alt={v.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <span className="text-white text-sm ml-0.5">▶</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-xs text-white leading-snug line-clamp-2">{v.title}</p>
              <p className="text-xs text-night-400 mt-1 truncate">{v.channel}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
