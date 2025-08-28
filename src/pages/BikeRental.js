import React, { useState } from 'react';
import QRScanner from '../components/QRScanner';
import ReturnStationSelector from '../components/ReturnStationSelector';
import NavigationView from '../components/NavigationView';
import RideCompletionScreen from '../components/RideCompletionScreen';
import { getORSRoute } from '../utils/getORSRoute';

function BikeRental({ user, onUpdateUser }) {
  const [currentStep, setCurrentStep] = useState('returnStation'); // returnStation, scan, navigation, completed
  const [startStation, setStartStation] = useState(null);
  const [returnStation, setReturnStation] = useState(null);
  const [scannedBike, setScannedBike] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [completedRide, setCompletedRide] = useState(null);

  const handleReturnStationSelect = async (stationData) => {
    // Debug incoming payload from selector
    // eslint-disable-next-line no-console
    console.log('[BikeRental] onReturnStationSelect payload', stationData);
    setStartStation(stationData.startStation);
    setReturnStation(stationData.returnStation);

    // Prefer explicit coords provided by ReturnStationSelector
    const selectorStart = stationData.startCoords;
    const selectorDest = stationData.returnCoords;

    const coercePoint = (p) => ({ lat: Number(p?.lat), lng: Number(p?.lng) });
    let startCoords = coercePoint(selectorStart);
    let destCoords = coercePoint(selectorDest);

    const looksLatLng = (la, ln) => la >= 33 && la <= 39 && ln >= 124 && ln <= 132;

    // If start station is missing or invalid, fallback to browser location (or Daejeon center)
    let effectiveStart = { ...startCoords };
    if (!(Number.isFinite(effectiveStart.lat) && Number.isFinite(effectiveStart.lng))) {
      try {
        const pos = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) return resolve(null);
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        if (pos && pos.coords) {
          effectiveStart = { lat: Number(pos.coords.latitude), lng: Number(pos.coords.longitude) };
        } else {
          effectiveStart = { lat: 36.3504, lng: 127.3845 }; // Daejeon center
        }
      } catch (_) {
        effectiveStart = { lat: 36.3504, lng: 127.3845 };
      }
    }

    const start = {
      lat: effectiveStart.lat,
      lng: effectiveStart.lng,
      name: (stationData.startStation && (stationData.startStation.stationName || stationData.startStation.name)) || '현재 위치'
    };
    let dest = {
      lat: destCoords.lat,
      lng: destCoords.lng,
      name: stationData.returnStation.stationName || stationData.returnStation.name
    };

    if (!(Number.isFinite(dest.lat) && Number.isFinite(dest.lng))) {
      // eslint-disable-next-line no-console
      console.error('[BikeRental] Destination coords invalid, falling back to start/downtown', destCoords);
      // Try use start as dest to draw at least a marker; if start also invalid, Daejeon center
      dest = Number.isFinite(start.lat) && Number.isFinite(start.lng)
        ? { lat: start.lat, lng: start.lng, name: dest.name || '목적지' }
        : { lat: 36.3504, lng: 127.3845, name: dest.name || '목적지' };
    }

    // Final debug
    // eslint-disable-next-line no-console
    console.log('[BikeRental] start/dest resolved', { start, dest });

    // Fetch real cycling route from ORS (fallback to straight line)
    let routePoints = [];
    let orsDistanceKm = NaN;
    let orsDurationMin = NaN;
    try {
      const canCallORS = [start.lat, start.lng, dest.lat, dest.lng].every(Number.isFinite) && looksLatLng(start.lat, start.lng) && looksLatLng(dest.lat, dest.lng);
      // eslint-disable-next-line no-console
      console.log('[BikeRental] ORS call eligible?', canCallORS, { start, dest });
      if (canCallORS) {
        const res = await getORSRoute(start, dest);
        // eslint-disable-next-line no-console
        console.log('[BikeRental] ORS result', res);
        if (res && Array.isArray(res.routePoints)) {
          routePoints = res.routePoints;
          orsDistanceKm = res.distanceKm;
          orsDurationMin = res.durationMin;
        } else if (Array.isArray(res)) {
          // backward compatibility if util returns array
          routePoints = res;
        }
      }
    } catch (e) {
      // ignore, will fallback
    }

    const nextRouteData = {
      startLocation: start,
      destination: dest,
      distance: Number.isFinite(orsDistanceKm) ? orsDistanceKm : Number(stationData.distance ?? 0),
      estimatedTime: Number.isFinite(orsDurationMin) ? orsDurationMin : Number(stationData.estimatedTime ?? 0),
      routePoints: Array.isArray(routePoints) && routePoints.length > 1 ? routePoints : undefined
    };

    // If still invalid, stop and notify
    if (!([nextRouteData.startLocation.lat, nextRouteData.startLocation.lng, nextRouteData.destination.lat, nextRouteData.destination.lng].every(Number.isFinite))) {
      // eslint-disable-next-line no-alert
      alert('좌표를 확인할 수 없어 경로를 표시할 수 없습니다. 다른 반납 대여소를 선택해 주세요.');
      return;
    }

    // eslint-disable-next-line no-console
    console.log('[BikeRental] nextRouteData', nextRouteData);
    setRouteData(nextRouteData);
    setCurrentStep('scan');
  };

  const handleQRScanSuccess = (bikeData) => {
    setScannedBike(bikeData);
    setCurrentStep('navigation');
  };

  const handleRideComplete = (rideData) => {
    setCompletedRide(rideData);
    setCurrentStep('completed');
  };

  const handleClose = () => {
    // Reset all states
    setCurrentStep('returnStation');
    setStartStation(null);
    setReturnStation(null);
    setScannedBike(null);
    setRouteData(null);
    setCompletedRide(null);
  };

  const handleCancel = () => {
    setCurrentStep('returnStation');
    setStartStation(null);
    setReturnStation(null);
    setScannedBike(null);
    setRouteData(null);
  };

  const handleViewHistory = () => {
    handleClose();
    // Navigate to history page (will be handled by parent component)
    window.location.hash = '#/history';
  };

  // Render current step
  switch (currentStep) {
    case 'returnStation':
      return (
        <ReturnStationSelector
          startStation={startStation}
          onReturnStationSelect={handleReturnStationSelect}
          onCancel={handleClose}
        />
      );

    case 'scan':
      return (
        <QRScanner
          onScanSuccess={handleQRScanSuccess}
          onClose={handleCancel}
        />
      );

    case 'navigation':
      return (
        <NavigationView
          routeData={routeData}
          bikeData={scannedBike}
          user={user}
          onUpdateUser={onUpdateUser}
          onRideComplete={handleRideComplete}
          onCancel={handleCancel}
        />
      );

    case 'completed':
      return (
        <RideCompletionScreen
          rideData={completedRide}
          bikeData={scannedBike}
          onClose={handleClose}
          onViewHistory={handleViewHistory}
        />
      );

    default:
      return null;
  }
}

export default BikeRental;
