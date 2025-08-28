import { useEffect, useMemo, useState } from "react";

// Simple client-side fetcher for stations using the existing proxy
// Env vars: REACT_APP_API_BASE, REACT_APP_TASHU_TOKEN
export default function useStations(options = {}) {
  const base = process.env.REACT_APP_API_BASE || "http://localhost:3001";
  const token = process.env.REACT_APP_TASHU_TOKEN || "";
  const refreshMs = options.refreshMs ?? 60000; // default 1min

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStations = async () => {
    try {
      setError("");
      setLoading(true);
      
      // 실제 API 호출
      const url = `${base}/station?token=${encodeURIComponent(token)}`;
      console.log('Fetching stations from:', url);
      
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        console.log('Raw API response:', text.substring(0, 500) + '...');
        
        let json;
        try {
          json = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error("Invalid JSON response");
        }
        
        console.log('Parsed JSON type:', typeof json, 'isArray:', Array.isArray(json));
        
        // Handle different response formats
        let stations = json;
        if (json && typeof json === 'object' && !Array.isArray(json)) {
          // Check if it's wrapped in a property
          if (json.stations && Array.isArray(json.stations)) {
            stations = json.stations;
          } else if (json.data && Array.isArray(json.data)) {
            stations = json.data;
          } else if (json.result && Array.isArray(json.result)) {
            stations = json.result;
          } else {
            // Try to find the first array property
            const arrayProp = Object.values(json).find(val => Array.isArray(val));
            if (arrayProp) {
              stations = arrayProp;
            } else {
              throw new Error("No array found in response");
            }
          }
        }
        
        if (!Array.isArray(stations)) {
          throw new Error("Invalid station payload - not an array");
        }
        
        console.log('Final stations array length:', stations.length);
        if (stations.length > 0) {
          console.log('Sample station:', stations[0]);
        }
        
        setData(stations);
      } catch (apiError) {
        console.warn('API 호출 실패, 목 데이터 사용:', apiError.message);
        
        // API 실패 시 목 데이터 사용
        const mockStations = [
          {
            id: 1,
            name: "대전역",
            stationName: "대전역",
            x_pos: 127.4347,
            y_pos: 36.3315,
            availableBikes: 5
          },
          {
            id: 2,
            name: "시청역",
            stationName: "시청역", 
            x_pos: 127.3845,
            y_pos: 36.3504,
            availableBikes: 3
          },
          {
            id: 3,
            name: "정부청사역",
            stationName: "정부청사역",
            x_pos: 127.3900,
            y_pos: 36.3600,
            availableBikes: 7
          },
          {
            id: 4,
            name: "갑천역",
            stationName: "갑천역",
            x_pos: 127.3700,
            y_pos: 36.3400,
            availableBikes: 2
          },
          {
            id: 5,
            name: "월평역",
            stationName: "월평역",
            x_pos: 127.3500,
            y_pos: 36.3700,
            availableBikes: 4
          }
        ];
        
        console.log('Using fallback mock station data:', mockStations.length, 'stations');
        setData(mockStations);
      }
    } catch (e) {
      console.error('Station fetch error:', e);
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
    if (refreshMs > 0) {
      const id = setInterval(fetchStations, refreshMs);
      return () => clearInterval(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, token, refreshMs]);

  return { data, loading, error, refresh: fetchStations };
}
