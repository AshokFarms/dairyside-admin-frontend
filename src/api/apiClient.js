import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // This API's error envelope is { success: false, error: '...' }; `message`
    // is only there for other shapes. Without the `error` branch every failure
    // surfaced as the generic "Request failed with status code 400".
    const body = error.response?.data
    const message =
      (typeof body?.error === 'string' && body.error) ||
      body?.error?.message ||
      body?.message ||
      error.message ||
      'Something went wrong'
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, message)
    return Promise.reject({ message, status: error.response?.status })
  }
)

export default apiClient
