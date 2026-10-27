import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || '/api/v1'
).replace(/\/+$/, '')

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Handle 401 → try refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry
    ) {
      original._retry = true

      try {
<<<<<<< HEAD
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )

=======
        const { data } = await api.post('/auth/refresh', {}, { withCredentials: true })
>>>>>>> 42f23ad (fix(cors): resolve express preflight options, python cors fallbacks, and token refresh url)
        useAuthStore.getState().setAccessToken(data.data.accessToken)
        original.headers.Authorization = `Bearer ${data.data.accessToken}`

        return api(original)
      } catch {
        useAuthStore.getState().logout()
      }
    }

    return Promise.reject(error)
  }
)

export const AI_API_BASE_URL =
  import.meta.env.VITE_AI_API_URL || 'http://localhost:8000'

/**
 * Dynamically fetches all bids from the backend database (supporting both
 * the Python AI service response shape and the Node/MongoDB paginated shape)
 * and resolves the currently selected or latest bid.
 */
export async function fetchBidsFromDb(preferredBidId = null) {
  let bids = []
  try {
    const res = await fetch(`${AI_API_BASE_URL}/api/v1/bids/`)
    const json = await res.json()
    if (Array.isArray(json?.data)) {
      bids = json.data
    } else if (Array.isArray(json?.data?.items)) {
      bids = json.data.items
    }
  } catch {
    const { data } = await api.get('/bids')
    bids = Array.isArray(data?.data?.items) ? data.data.items : Array.isArray(data?.data) ? data.data : []
  }

  const activeBid =
    (preferredBidId && bids.find((b) => b.id === preferredBidId || b._id === preferredBidId)) ||
    bids[0] ||
    null

  return { bids, activeBid }
}

export default api
