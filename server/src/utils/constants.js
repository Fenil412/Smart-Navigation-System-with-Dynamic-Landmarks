// Constants that will be referenced throughout the application
export const ROAD_TYPES = {
  HIGHWAY: 'highway',
  PRIMARY: 'primary', 
  SECONDARY: 'secondary',
  LOCAL: 'local'
};

export const EVENT_TYPES = {
  TRAFFIC_JAM: 'traffic_jam',
  ROAD_CLOSURE: 'road_closure',
  ACCIDENT: 'accident',
  CONSTRUCTION: 'construction',
  WEATHER: 'weather'
};

export const EVENT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const ALGORITHMS = {
  DIJKSTRA: 'dijkstra',
  ASTAR: 'astar',
  DSTAR_LITE: 'dstar_lite'
};

export const NODE_TYPES = {
  INTERSECTION: 'intersection',
  LANDMARK: 'landmark',
  POI: 'poi'
};

// Default weights for different road types
export const DEFAULT_WEIGHTS = {
  [ROAD_TYPES.HIGHWAY]: 1,
  [ROAD_TYPES.PRIMARY]: 1.2,
  [ROAD_TYPES.SECONDARY]: 1.5,
  [ROAD_TYPES.LOCAL]: 2
};

// Impact factors for different event types and severities
export const EVENT_IMPACT_FACTORS = {
  [EVENT_TYPES.TRAFFIC_JAM]: {
    [EVENT_SEVERITY.LOW]: 1.5,
    [EVENT_SEVERITY.MEDIUM]: 2,
    [EVENT_SEVERITY.HIGH]: 3,
    [EVENT_SEVERITY.CRITICAL]: 5
  },
  [EVENT_TYPES.ACCIDENT]: {
    [EVENT_SEVERITY.LOW]: 2,
    [EVENT_SEVERITY.MEDIUM]: 3,
    [EVENT_SEVERITY.HIGH]: 4,
    [EVENT_SEVERITY.CRITICAL]: 6
  },
  [EVENT_TYPES.CONSTRUCTION]: {
    [EVENT_SEVERITY.LOW]: 1.8,
    [EVENT_SEVERITY.MEDIUM]: 2.5,
    [EVENT_SEVERITY.HIGH]: 3.5,
    [EVENT_SEVERITY.CRITICAL]: 999 // Effectively closed
  },
  [EVENT_TYPES.ROAD_CLOSURE]: {
    [EVENT_SEVERITY.LOW]: 10,
    [EVENT_SEVERITY.MEDIUM]: 50,
    [EVENT_SEVERITY.HIGH]: 100,
    [EVENT_SEVERITY.CRITICAL]: 999999 // Completely closed
  }
};

// Default search radius in meters
export const SEARCH_RADIUS = {
  NEAREST_NODE: 1000, // 1km
  EVENT_RADIUS: 500   // 500m
};

// API Response codes and messages
export const API_RESPONSES = {
  SUCCESS: 'success',
  ERROR: 'error',
  NOT_FOUND: 'not_found',
  INVALID_INPUT: 'invalid_input'
};

export default {
  ROAD_TYPES,
  EVENT_TYPES,
  ALGORITHMS,
  DEFAULT_WEIGHTS,
  EVENT_IMPACT_FACTORS,
  SEARCH_RADIUS,
  API_RESPONSES
};