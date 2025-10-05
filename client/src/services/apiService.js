// Prefer env; otherwise derive from current host to avoid hardcoded localhost
const deriveApiBaseUrl = () => {
  try {
    const { protocol, hostname } = window.location
    const port = 5001
    return `${protocol}//${hostname}:${port}/api`
  } catch (_) {
    return "http://localhost:5001/api"
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || deriveApiBaseUrl()

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Request failed" }))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Health check
  async healthCheck() {
    return this.request("/health")
  }

  // Route endpoints
  async calculateRoute(data) {
    return this.request("/routes/calculate", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getRoute(routeId) {
    return this.request(`/routes/${routeId}`)
  }

  async updateRoute(routeId, affectedEdges) {
    return this.request(`/routes/${routeId}/update`, {
      method: "PUT",
      body: JSON.stringify({ affectedEdges }),
    })
  }

  async getAvailableAlgorithms() {
    return this.request("/routes/algorithms")
  }

  // Event endpoints
  async createEvent(eventData) {
    return this.request("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    })
  }

  async getActiveEvents() {
    return this.request("/events/active")
  }

  async updateEvent(eventId, updates) {
    return this.request(`/events/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  async deleteEvent(eventId) {
    return this.request(`/events/${eventId}`, {
      method: "DELETE",
    })
  }

  async deactivateEvent(eventId) {
    return this.request(`/events/${eventId}/deactivate`, {
      method: "PUT",
    })
  }
}

export const apiService = new ApiService()
