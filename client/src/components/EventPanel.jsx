"use client"

import { useState } from "react"
import { AlertTriangle, X, Plus, MapPin, Eye, EyeOff } from "lucide-react"
import { useNavigationStore } from "../store/navigationStore"
import { apiService } from "../services/apiService"
import { format } from "date-fns"

export default function EventPanel() {
  const { events, removeEvent, showAllEvents, setShowAllEvents } = useNavigationStore()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    type: "traffic_jam",
    severity: "medium",
    latitude: "12.9718",
    longitude: "77.5948",
    radius: 300,
    description: "",
  })

  const handleCreateEvent = async () => {
    try {
      const result = await apiService.createEvent({
        type: newEvent.type,
        severity: newEvent.severity,
        location: {
          latitude: Number.parseFloat(newEvent.latitude),
          longitude: Number.parseFloat(newEvent.longitude),
        },
        radius: Number.parseInt(newEvent.radius),
        description: newEvent.description,
      })

      if (result.status === "success") {
        console.log("[v0] ✅ Event created:", result.event)
        setShowCreateForm(false)
        setNewEvent({
          type: "traffic_jam",
          severity: "medium",
          latitude: "12.9718",
          longitude: "77.5948",
          radius: 300,
          description: "",
        })
      }
    } catch (error) {
      console.error("[v0] ❌ Failed to create event:", error)
      alert("Failed to create event: " + error.message)
    }
  }

  const handleDeactivateEvent = async (eventId) => {
    try {
      await apiService.deactivateEvent(eventId)
      removeEvent(eventId)
      console.log("[v0] ✅ Event deactivated:", eventId)
    } catch (error) {
      console.error("[v0] ❌ Failed to deactivate event:", error)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-danger text-white"
      case "medium":
        return "bg-warning text-white"
      case "low":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getEventIcon = (type) => {
    return <AlertTriangle className="w-4 h-4" />
  }

  return (
    <div className="w-full lg:w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-lg">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Active Events
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAllEvents(!showAllEvents)}
            className={`p-2 rounded-lg transition-colors ${
              showAllEvents ? "bg-primary text-white" : "hover:bg-gray-100"
            }`}
            title={showAllEvents ? "Hide events on map" : "Show events on map"}
          >
            {showAllEvents ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {showCreateForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
          <h3 className="font-medium text-sm text-gray-900">Create New Event</h3>

          <select
            value={newEvent.type}
            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="traffic_jam">Traffic Jam</option>
            <option value="road_closure">Road Closure</option>
            <option value="accident">Accident</option>
            <option value="construction">Construction</option>
          </select>

          <select
            value={newEvent.severity}
            onChange={(e) => setNewEvent({ ...newEvent, severity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="low">Low Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="high">High Severity</option>
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Latitude"
              value={newEvent.latitude}
              onChange={(e) => setNewEvent({ ...newEvent, latitude: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Longitude"
              value={newEvent.longitude}
              onChange={(e) => setNewEvent({ ...newEvent, longitude: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <input
            type="number"
            placeholder="Radius (meters)"
            value={newEvent.radius}
            onChange={(e) => setNewEvent({ ...newEvent, radius: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          />

          <textarea
            placeholder="Description"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={2}
          />

          <button
            onClick={handleCreateEvent}
            className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
          >
            Create Event
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No active events</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.eventId}
              className="bg-white border border-gray-200 rounded-lg p-3 space-y-2 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  {getEventIcon(event.type)}
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 capitalize">{event.type.replace("_", " ")}</div>
                    <div className="text-xs text-gray-500 mt-1">{event.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeactivateEvent(event.eventId)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                  {event.severity}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.radius}m radius
                </span>
              </div>

              {event.startTime && (
                <div className="text-xs text-gray-400">{format(new Date(event.startTime), "MMM dd, HH:mm")}</div>
              )}

              {event.affectedEdges && event.affectedEdges.length > 0 && (
                <div className="text-xs text-gray-500">
                  Affects {event.affectedEdges.length} road segment{event.affectedEdges.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
