import { useState, useRef, useCallback } from 'react';

const useRideTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [rideHistory, setRideHistory] = useState(() => {
    const saved = localStorage.getItem('tashu_ride_history');
    return saved ? JSON.parse(saved) : [];
  });

  const watchIdRef = useRef(null);
  const routePointsRef = useRef([]);
  const startTimeRef = useRef(null);
  const simTimerRef = useRef(null);

  // Calculate distance between two GPS coordinates (Haversine formula)
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }, []);

  // Calculate total distance from route points
  const calculateTotalDistance = useCallback((points) => {
    if (points.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      totalDistance += calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
    }
    return totalDistance;
  }, [calculateDistance]);

  // Calculate CO2 saved (0.2 kg CO2 per km)
  const calculateCO2Saved = useCallback((distance) => {
    return distance * 0.2;
  }, []);

  // Calculate points (1 point per 10g CO2 saved)
  const calculatePoints = useCallback((co2Saved) => {
    return Math.floor(co2Saved * 1000 / 10); // Convert kg to g, then divide by 10
  }, []);

  const startRide = useCallback(() => {
    if (!navigator.geolocation) {
      alert('GPS를 지원하지 않는 브라우저입니다.');
      return false;
    }

    setIsTracking(true);
    startTimeRef.current = new Date();
    routePointsRef.current = [];

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const startPoint = {
          lat: latitude,
          lng: longitude,
          timestamp: new Date().toISOString()
        };
        
        routePointsRef.current = [startPoint];
        setCurrentRide({
          id: Date.now(),
          startTime: startTimeRef.current.toISOString(),
          startLocation: startPoint,
          distance: 0,
          co2Saved: 0,
          points: 0,
          duration: 0,
          status: 'active'
        });
      },
      (error) => {
        console.error('GPS 위치를 가져올 수 없습니다:', error);
        setIsTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPoint = {
          lat: latitude,
          lng: longitude,
          timestamp: new Date().toISOString()
        };

        routePointsRef.current.push(newPoint);
        
        // Update current ride with new distance
        const totalDistance = calculateTotalDistance(routePointsRef.current);
        const co2Saved = calculateCO2Saved(totalDistance);
        const points = calculatePoints(co2Saved);
        const duration = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);

        setCurrentRide(prev => ({
          ...prev,
          distance: totalDistance,
          co2Saved: co2Saved,
          points: points,
          duration,
          currentLocation: newPoint
        }));
      },
      (error) => {
        console.error('GPS 추적 오류:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return true;
  }, [calculateTotalDistance, calculateCO2Saved, calculatePoints]);

  const stopRide = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }

    if (currentRide && routePointsRef.current.length > 1) {
      const endTime = new Date();
      const duration = Math.floor((endTime - new Date(currentRide.startTime)) / 1000); // seconds
      
      const completedRide = {
        ...currentRide,
        endTime: endTime.toISOString(),
        endLocation: routePointsRef.current[routePointsRef.current.length - 1],
        duration: duration,
        route: [...routePointsRef.current],
        status: 'completed'
      };

      // Save to history
      const newHistory = [completedRide, ...rideHistory];
      setRideHistory(newHistory);
      localStorage.setItem('tashu_ride_history', JSON.stringify(newHistory));

      setCurrentRide(null);
      setIsTracking(false);
      routePointsRef.current = [];

      return completedRide;
    }

    setCurrentRide(null);
    setIsTracking(false);
    routePointsRef.current = [];
    return null;
  }, [currentRide, rideHistory]);

  // Simulation: advance along given routePoints with a constant speed (km/h)
  const startSimulatedRide = useCallback((routePoints, speedKmh = 15) => {
    if (!Array.isArray(routePoints) || routePoints.length < 2) return false;
    setIsTracking(true);
    startTimeRef.current = new Date();
    routePointsRef.current = [
      { lat: routePoints[0].lat, lng: routePoints[0].lng, timestamp: new Date().toISOString() }
    ];

    setCurrentRide({
      id: Date.now(),
      startTime: startTimeRef.current.toISOString(),
      startLocation: routePointsRef.current[0],
      distance: 0,
      co2Saved: 0,
      points: 0,
      duration: 0,
      status: 'active',
      currentLocation: routePointsRef.current[0]
    });

    // compute per-tick step distance (km) for 1 sec interval
    const metersPerSec = (speedKmh * 1000) / 3600;
    const kmPerTick = metersPerSec / 1000; // 1-second tick

    let segIndex = 0;
    let segProgressKm = 0;
    let segLengthKm = calculateDistance(
      routePoints[0].lat, routePoints[0].lng,
      routePoints[1].lat, routePoints[1].lng
    );

    simTimerRef.current = setInterval(() => {
      // If segment finished, move to next
      if (segProgressKm >= segLengthKm && segIndex < routePoints.length - 2) {
        segIndex += 1;
        segProgressKm = 0;
        segLengthKm = calculateDistance(
          routePoints[segIndex].lat, routePoints[segIndex].lng,
          routePoints[segIndex + 1].lat, routePoints[segIndex + 1].lng
        );
      }

      // If last segment done, stop
      if (segIndex >= routePoints.length - 2 && segProgressKm >= segLengthKm) {
        clearInterval(simTimerRef.current);
        simTimerRef.current = null;
        stopRide();
        return;
      }

      // Interpolate along current segment
      const a = routePoints[segIndex];
      const b = routePoints[segIndex + 1];
      const t = Math.min(1, segProgressKm / (segLengthKm || 1e-9));
      const lat = a.lat + (b.lat - a.lat) * t;
      const lng = a.lng + (b.lng - a.lng) * t;
      const newPoint = { lat, lng, timestamp: new Date().toISOString() };
      routePointsRef.current.push(newPoint);

      // Update totals
      const totalDistance = calculateTotalDistance(routePointsRef.current);
      const co2Saved = calculateCO2Saved(totalDistance);
      const points = calculatePoints(co2Saved);
      const duration = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);

      setCurrentRide(prev => ({
        ...prev,
        distance: totalDistance,
        co2Saved,
        points,
        duration,
        currentLocation: newPoint
      }));

      segProgressKm += kmPerTick;
    }, 1000);

    return true;
  }, [calculateDistance, calculateTotalDistance, calculateCO2Saved, calculatePoints, stopRide]);

  const cancelRide = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setCurrentRide(null);
    setIsTracking(false);
    routePointsRef.current = [];
  }, []);

  // Get statistics
  const getStats = useCallback(() => {
    const today = new Date().toDateString();
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date();
    thisMonth.setDate(1);

    const todayRides = rideHistory.filter(ride => 
      new Date(ride.startTime).toDateString() === today
    );
    const weekRides = rideHistory.filter(ride => 
      new Date(ride.startTime) >= thisWeek
    );
    const monthRides = rideHistory.filter(ride => 
      new Date(ride.startTime) >= thisMonth
    );

    const calculateTotals = (rides) => ({
      distance: rides.reduce((sum, ride) => sum + ride.distance, 0),
      co2Saved: rides.reduce((sum, ride) => sum + ride.co2Saved, 0),
      points: rides.reduce((sum, ride) => sum + ride.points, 0),
      rides: rides.length
    });

    return {
      today: calculateTotals(todayRides),
      week: calculateTotals(weekRides),
      month: calculateTotals(monthRides),
      total: calculateTotals(rideHistory)
    };
  }, [rideHistory]);

  return {
    isTracking,
    currentRide,
    rideHistory,
    startRide,
    startSimulatedRide,
    stopRide,
    cancelRide,
    getStats,
    routePoints: routePointsRef.current
  };
};

export default useRideTracking;
