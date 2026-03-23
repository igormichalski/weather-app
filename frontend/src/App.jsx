import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import useStore from './store/useStore'
import SearchBar from './components/weather/SearchBar'
import CurrentWeather from './components/weather/CurrentWeather'
import ForecastStrip from './components/weather/ForecastStrip'
import MapEmbed from './components/map/MapEmbed'
import VideoGrid from './components/weather/VideoGrid'
import SaveRecordModal from './components/crud/SaveRecordModal'
import RecordsTable from './components/crud/RecordsTable'

export default function App() {
  const { activeTab, setActiveTab, weather, weatherError, clearWeather } = useStore()
  const [showSave, setShowSave] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right"
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

      <header className="border-b border-white/[0.06] glass sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #22d3ee, #a78bfa)' }}>☁️</div>
            <div>
              <span className="font-display font-bold text-lg text-white">WeatherSphere</span>
              <span className="hidden sm:inline text-night-500 text-xs ml-2">by Igor Michalski</span>
            </div>
          </div>
          <nav className="flex items-center gap-1 glass rounded-xl p-1">
            {[{ id: 'weather', label: 'Weather', icon: '🌤' }, { id: 'history', label: 'History', icon: '📋' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-medium transition-all duration-200 ${
                  activeTab === tab.id ? 'bg-white/10 text-white' : 'text-night-400 hover:text-white'}`}>
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
          <a href="https://www.linkedin.com/company/pm-accelerator/" target="_blank" rel="noopener noreferrer"
            className="tag hidden md:inline-flex hover:opacity-80 transition-opacity text-xs">PM Accelerator</a>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">

        {/* ── Weather tab ────────────────────────────────────────────────── */}
        {activeTab === 'weather' && (
          <div className="flex flex-col gap-8">
            <div className="text-center pt-4">
              <h1 className="font-display font-bold text-4xl sm:text-5xl text-white tracking-tight">
                Real-time <span className="aurora-text">weather</span><br/>
                for any place on Earth
              </h1>
              <p className="text-night-400 mt-3 text-base max-w-lg mx-auto font-body">
                Search by city, ZIP code, landmark, or GPS coordinates.
              </p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <SearchBar />
            </div>

            {weatherError && (
              <div className="max-w-2xl mx-auto w-full rounded-xl p-4 flex items-center gap-3"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <span>⚠️</span>
                <p className="text-sm text-red-300 flex-1">{weatherError}</p>
                <button onClick={clearWeather} className="text-red-400 hover:text-red-300">✕</button>
              </div>
            )}

            {weather && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-end">
                  <button onClick={() => setShowSave(true)} className="btn-ghost flex items-center gap-2 text-sm">
                    🔖 Save to History
                  </button>
                </div>
                <CurrentWeather />
                <ForecastStrip />
                <MapEmbed />
                <VideoGrid />
              </div>
            )}
          </div>
        )}

        {/* ── History tab ────────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-white">Saved Records</h2>
              <p className="text-night-400 text-sm mt-1 font-body">
                All saved weather lookups. Edit, delete, and export in 5 formats.
              </p>
            </div>
            <RecordsTable />
          </div>
        )}
      </main>

      <footer className="border-t border-white/[0.06] mt-8">
        <div className="max-w-5xl mx-auto px-4 py-8 grid sm:grid-cols-2 gap-6">
          <div>
            <p className="font-display font-medium text-white mb-2">About this project</p>
            <p className="text-xs text-night-400 font-body leading-relaxed">
              WeatherSphere is a full-stack weather app built as a technical assessment
              for the AI Engineer Internship at PM Accelerator. Built by Igor Michalski.
            </p>
          </div>
          <div>
            <a href="https://www.linkedin.com/company/pm-accelerator/" target="_blank" rel="noopener noreferrer"
              className="font-display font-medium text-white mb-2 hover:text-aurora-cyan transition-colors block">
              PM Accelerator ↗
            </a>
            <p className="text-xs text-night-400 font-body leading-relaxed">
              Product Manager Accelerator is a global community dedicated to empowering
              aspiring product managers through mentorship, real-world AI product development,
              and collaboration with diverse international teams.
            </p>
          </div>
        </div>
        <div className="border-t border-white/[0.04]">
          <p className="text-xs text-night-600 text-center py-4 font-body">
            Weather data by OpenWeatherMap · PM Accelerator Technical Assessment 2026
          </p>
        </div>
      </footer>

      {showSave && <SaveRecordModal onClose={() => setShowSave(false)} />}
    </div>
  )
}
