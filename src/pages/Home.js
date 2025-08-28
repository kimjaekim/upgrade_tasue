import React, { useState, useEffect, Suspense } from "react";
import Map from "../components/Map";
import BikeRental from "./BikeRental";
import useAuth from "../hooks/useAuth";
import ReturnStationSelector from '../components/ReturnStationSelector';
import QRScanner from '../components/QRScanner';
import NavigationView from '../components/NavigationView';
import RideCompletionScreen from '../components/RideCompletionScreen';
import { getORSRoute } from '../utils/getORSRoute';

function Home() {
  const [showRental, setShowRental] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    // Global function to start bike rental from Map component
    window.startBikeRental = (station) => {
      setSelectedStation(station);
      setShowRental(true);
    };

    return () => {
      delete window.startBikeRental;
    };
  }, []);

  const handleCloseRental = () => {
    setShowRental(false);
    setSelectedStation(null);
  };

  if (showRental && selectedStation) {
    return (
      <BikeRentalWithStation
        station={selectedStation}
        user={user}
        onUpdateUser={updateUser}
        onClose={handleCloseRental}
      />
    );
  }

  return <Map />;
}

// Wrapper component to handle station-based rental flow
function BikeRentalWithStation({ station, user, onUpdateUser, onClose }) {
  const [currentStep, setCurrentStep] = useState('returnStation');
  const [returnStation, setReturnStation] = useState(null);
  const [scannedBike, setScannedBike] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [completedRide, setCompletedRide] = useState(null);

  const handleReturnStationSelect = async (stationData) => {
    // eslint-disable-next-line no-console
    console.log('[Home] onReturnStationSelect payload', stationData);
    setReturnStation(stationData.returnStation);

    const looksLatLng = (la, ln) => la >= 33 && la <= 39 && ln >= 124 && ln <= 132;
    const coerceNum = (v) => {
      const n = Number(v); return Number.isFinite(n) ? n : NaN;
    };
    const normalizePoint = (p, fallbackName) => {
      if (!p || typeof p !== 'object') return { lat: 36.3504, lng: 127.3845, name: fallbackName };
      let lat = coerceNum(p.lat ?? p.latitude ?? p.stationLatitude);
      let lng = coerceNum(p.lng ?? p.lon ?? p.long ?? p.longitude ?? p.stationLongitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        const x = coerceNum(p.x_pos ?? p.x ?? p.X);
        const y = coerceNum(p.y_pos ?? p.y ?? p.Y);
        if (Number.isFinite(x) && Number.isFinite(y)) {
          lat = y; lng = x;
          if (!looksLatLng(lat, lng) && looksLatLng(x, y)) { lat = x; lng = y; }
        }
      }
      if (!looksLatLng(lat, lng)) {
        // eslint-disable-next-line no-console
        console.warn('[Home] normalizePoint fallback', p);
        return { lat: 36.3504, lng: 127.3845, name: fallbackName };
      }
      return { lat: Number(lat), lng: Number(lng), name: p.name || p.stationName || fallbackName };
    };

    const start = stationData.startCoords
      ? normalizePoint(stationData.startCoords, station.stationName || station.name || '출발지')
      : normalizePoint(station, station.stationName || station.name || '출발지');
    const dest = stationData.returnCoords
      ? normalizePoint(stationData.returnCoords, stationData.returnStation?.stationName || stationData.returnStation?.name || '목적지')
      : normalizePoint(stationData.returnStation, stationData.returnStation?.stationName || stationData.returnStation?.name || '목적지');

    // 먼저 QR 스텝으로 즉시 전환하여 지연 제거
    setCurrentStep('scan');

    // ORS 경로는 백그라운드에서 비동기로 가져와 routeData 갱신
    (async () => {
      // Try fetching optimal cycling route from ORS
      let routePoints = [];
      let distanceKm = Number(stationData.distance ?? 0);
      let durationMin = Number(stationData.estimatedTime ?? 0);
      const canCallORS = [start.lat, start.lng, dest.lat, dest.lng].every(Number.isFinite) && looksLatLng(start.lat, start.lng) && looksLatLng(dest.lat, dest.lng);
      if (canCallORS) {
        try {
          const res = await getORSRoute(start, dest);
          // eslint-disable-next-line no-console
          console.log('[Home] ORS result', res);
          if (res && Array.isArray(res.routePoints)) {
            routePoints = res.routePoints;
            if (Number.isFinite(res.distanceKm)) distanceKm = res.distanceKm;
            if (Number.isFinite(res.durationMin)) durationMin = res.durationMin;
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[Home] ORS error', e);
        }
      }

      const next = {
        startLocation: start,
        destination: dest,
        distance: distanceKm,
        estimatedTime: durationMin,
        routePoints: Array.isArray(routePoints) && routePoints.length > 1 ? routePoints : undefined
      };

      // eslint-disable-next-line no-console
      console.log('[Home] nextRouteData', next);
      setRouteData(next);
    })();
  };

  const handleQRScanSuccess = (bikeData) => {
    setScannedBike(bikeData);
    setCurrentStep('navigation');
  };

  const handleRideComplete = (rideData) => {
    setCompletedRide(rideData);
    setCurrentStep('completed');
  };

  const handleCancel = () => {
    setCurrentStep('returnStation');
    setReturnStation(null);
    setScannedBike(null);
    setRouteData(null);
  };

  const handleViewHistory = () => {
    onClose();
    window.location.hash = '#/history';
  };


  switch (currentStep) {
    case 'returnStation':
      return (
        <ReturnStationSelector
          startStation={station}
          onReturnStationSelect={handleReturnStationSelect}
          onCancel={onClose}
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
          onClose={onClose}
          onViewHistory={handleViewHistory}
        />
      );

    default:
      return null;
  }
}

export default Home;
