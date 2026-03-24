import { create } from 'zustand'
import { weatherApi, recordsApi } from '../services/api'

const useStore = create((set, get) => ({
  // ── Weather ────────────────────────────────────────────────────────────────
  weather:        null,
  videos:         [],
  weatherLoading: false,
  weatherError:   null,
  currentDateFrom: null,
  currentDateTo:   null,

  fetchWeather: async (location, dateFrom = null, dateTo = null) => {
    set({
      weatherLoading:  true,
      weatherError:    null,
      weather:         null,
      videos:          [],
      currentDateFrom: dateFrom,
      currentDateTo:   dateTo,
    })
    try {
      const { data } = await weatherApi.get(location, dateFrom, dateTo)
      set({ weather: data, weatherLoading: false })
      weatherApi.getVideos(location)
        .then(({ data }) => set({ videos: data }))
        .catch(() => {})
    } catch (err) {
      set({ weatherError: err.message, weatherLoading: false })
    }
  },

  clearWeather: () => set({
    weather:         null,
    videos:          [],
    weatherError:    null,
    currentDateFrom: null,
    currentDateTo:   null,
  }),

  loadRecord: async (record) => {
    // Se date_from === date_to (mesmo dia, salvo sem período real)
    // tratamos como sem período para buscar os 5 dias normais
    const dateFrom = record.date_from
    const dateTo   = record.date_to
    const hasPeriod = dateFrom !== dateTo

    set({ activeTab: 'weather' })
    await get().fetchWeather(
      record.location_query,
      hasPeriod ? dateFrom : null,
      hasPeriod ? dateTo   : null,
    )
  },

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
