import { Toaster } from 'react-hot-toast'
import useStore from './store/useStore'

export default function App() {
  const { activeTab, setActiveTab } = useStore()

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15,21,48,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22d3ee', secondary: '#070b1a' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#070b1a' } },
        }}
      />

      {/* Header */}
      <header className="border-b border-white/[0.06] glass sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #22d3ee, #a78bfa)' }}>
              ☁️
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white">WeatherSphere</span>
              <span className="hidden sm:inline text-night-500 text-xs ml-2">by Igor Michalski</span>
            </div>
          </div>

          <nav className="flex items-center gap-1 glass rounded-xl p-1">
            {[
              { id: 'weather', label: 'Weather', icon: '🌤' },
              { id: 'history', label: 'History', icon: '📋' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-night-400 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          <a href="https://www.linkedin.com/company/pm-accelerator/"
            target="_blank" rel="noopener noreferrer"
            className="tag hidden md:inline-flex hover:opacity-80 transition-opacity text-xs">
            PM Accelerator
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {activeTab === 'weather' && (
          <div className="text-center py-20">
            <h1 className="font-display font-bold text-4xl text-white">
              Weather tab — coming next!
            </h1>
          </div>
        )}
        {activeTab === 'history' && (
          <div className="text-center py-20">
            <h1 className="font-display font-bold text-4xl text-white">
              History tab — coming next!
            </h1>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-8">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-night-500 font-body">
            PM Accelerator Technical Assessment · Built by Igor Michalski · Weather data by OpenWeatherMap
          </p>
        </div>
      </footer>
    </div>
  )
}
