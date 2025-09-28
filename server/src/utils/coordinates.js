// Enhanced coordinate utilities that will be used across the application
export class CoordinateUtils {
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }

  static toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  static toDeg(radians) {
    return radians * (180 / Math.PI);
  }

  static calculateBearing(lat1, lon1, lat2, lon2) {
    const φ1 = this.toRad(lat1);
    const φ2 = this.toRad(lat2);
    const Δλ = this.toRad(lon2 - lon1);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);

    return (this.toDeg(θ) + 360) % 360;
  }

  static isPointInRadius(lat1, lon1, lat2, lon2, radiusMeters) {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2) * 1000; // Convert to meters
    return distance <= radiusMeters;
  }

  static calculateMidpoint(lat1, lon1, lat2, lon2) {
    return {
      latitude: (lat1 + lat2) / 2,
      longitude: (lon1 + lon2) / 2
    };
  }
}

export default CoordinateUtils;