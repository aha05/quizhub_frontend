import axios from "axios"
import { refreshAccessToken } from "./token.service"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

//🔄 Auto refresh access token on 401
let isRefreshing = false
let queue: Array<(token: string) => void> = []


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any
    const isAuthEndpoint = originalRequest.url?.includes("/auth/login") ||
                           originalRequest.url?.includes("/auth/register") ||
                           originalRequest.url?.includes("/auth/refresh")

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          })
        })
      }

      isRefreshing = true
      try {
        const newToken = await refreshAccessToken()
        queue.forEach((cb) => cb(newToken))
        queue = []

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (err) {
        localStorage.removeItem("accessToken")
        window.location.href = "/login"
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
