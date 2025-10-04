import { create } from "zustand"

export const useNavigationStore = create((set) => ({
  // Connection status
  connectionStatus: "disconnected",
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  // Graph data
  graphData: null,
  setGraphData: (data) => set({ graphData: data }),

  // Current route
  currentRoute: null,
  setCurrentRoute: (route) => set({ currentRoute: route }),

  // Selected algorithm
  selectedAlgorithm: "dijkstra",
  setSelectedAlgorithm: (algorithm) => set({ selectedAlgorithm: algorithm }),

  startCoords: null,
  endCoords: null,
  setStartCoords: (coords) => set({ startCoords: coords }),
  setEndCoords: (coords) => set({ endCoords: coords }),

  // Events
  events: [],
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  removeEvent: (eventId) =>
    set((state) => ({
      events: state.events.filter((e) => e.eventId !== eventId),
    })),

  showAllEvents: true,
  setShowAllEvents: (show) => set({ showAllEvents: show }),

  // Vehicle position
  vehiclePosition: null,
  setVehiclePosition: (position) => set({ vehiclePosition: position }),

  // Reset
  reset: () =>
    set({
      currentRoute: null,
      vehiclePosition: null,
    }),
}))
