import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.message ||
      'Erro inesperado'
    return Promise.reject(new Error(message))
  }
)

export const weatherApi = {
  get:       (location)              => api.get(`/weather/${encodeURIComponent(location)}`),
  getVideos: (location, max = 4)     => api.get(`/weather/${encodeURIComponent(location)}/videos`, { params: { max_results: max } }),
}

export const recordsApi = {
  list:   (params = {})   => api.get('/records/', { params }),
  get:    (id)            => api.get(`/records/${id}`),
  create: (data)          => api.post('/records/', data),
  update: (id, data)      => api.patch(`/records/${id}`, data),
  delete: (id)            => api.delete(`/records/${id}`),
  export: (fmt, params)   => api.get(`/records/export/${fmt}`, { params, responseType: 'blob' }),
}

export default api
