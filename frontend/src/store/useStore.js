import { create } from 'zustand'
import { weatherApi, recordsApi } from '../services/api'

const useStore = create((set) => ({
  // ── Weather ────────────────────────────────────────────────────────────────
  weather:        null,
  videos:         [],
  weatherLoading: false,
  weatherError:   null,

  fetchWeather: async (location) => {
    set({ weatherLoading: true, weatherError: null, weather: null, videos: [] })
    try {
      const { data } = await weatherApi.get(location)
      set({ weather: data, weatherLoading: false })
      // vídeos em background — não bloqueia
      weatherApi.getVideos(location)
        .then(({ data }) => set({ videos: data }))
        .catch(() => {})
    } catch (err) {
      set({ weatherError: err.message, weatherLoading: false })
    }
  },

  clearWeather: () => set({ weather: null, videos: [], weatherError: null }),

  // ── Records ────────────────────────────────────────────────────────────────
  records:        [],
  recordsLoading: false,
  recordsError:   null,

  fetchRecords: async (params = {}) => {
    set({ recordsLoading: true, recordsError: null })
    try {
      const { data } = await recordsApi.list(params)
      set({ records: data, recordsLoading: false })
    } catch (err) {
      set({ recordsError: err.message, recordsLoading: false })
    }
  },

  createRecord: async (payload) => {
    const { data } = await recordsApi.create(payload)
    set((s) => ({ records: [data, ...s.records] }))
    return data
  },

  updateRecord: async (id, payload) => {
    const { data } = await recordsApi.update(id, payload)
    set((s) => ({ records: s.records.map((r) => (r.id === id ? data : r)) }))
    return data
  },

  deleteRecord: async (id) => {
    await recordsApi.delete(id)
    set((s) => ({ records: s.records.filter((r) => r.id !== id) }))
  },

  // ── UI ─────────────────────────────────────────────────────────────────────
  activeTab:    'weather',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))

export default useStore
