import React, { useRef, useEffect, useState } from 'react';

function QRScanner({ onScanSuccess, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    if (isScanning) return; // already running
    try {
      const constraints = { video: { facingMode: { ideal: 'environment' } }, audio: false };
      const video = videoRef.current;
      if (!video) return;

      // Ensure previous load/play is fully stopped before assigning new stream
      try { video.pause(); } catch (_) {}
      try { video.srcObject = null; } catch (_) {}

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      video.setAttribute('playsinline', 'true'); // iOS inline playback
      video.srcObject = stream;

      // Wait until metadata is loaded before calling play()
      await new Promise(resolve => {
        const onLoaded = () => { video.removeEventListener('loadedmetadata', onLoaded); resolve(); };
        video.addEventListener('loadedmetadata', onLoaded);
        // If metadata is already available, resolve immediately
        if (video.readyState >= 1) {
          video.removeEventListener('loadedmetadata', onLoaded);
          resolve();
        }
      });

      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        await playPromise.catch(() => {
          // Ignore play interruption errors (e.g., new load request)
        });
      }

      setIsScanning(true);
      startScanning();
    } catch (err) {
      setError('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch (_) {}
      try { videoRef.current.srcObject = null; } catch (_) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startScanning = () => {
    if (scanIntervalRef.current) return; // already scanning
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // 간단한 QR 코드 시뮬레이션 (실제로는 qr-scanner 라이브러리 사용)
          // 여기서는 화면을 클릭하면 QR 코드를 스캔한 것으로 시뮬레이션
        }
      }
    }, 100);
  };

  const simulateQRScan = () => {
    // 실제 타슈 자전거 QR 코드 시뮬레이션
    const mockBikeData = {
      bikeId: `TASHU-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
      stationId: Math.floor(Math.random() * 200) + 1,
      stationName: `대여소 ${Math.floor(Math.random() * 200) + 1}`,
      batteryLevel: Math.floor(Math.random() * 100) + 1,
      location: {
        lat: 36.3504119 + (Math.random() - 0.5) * 0.02,
        lng: 127.3845475 + (Math.random() - 0.5) * 0.02
      }
    };

    // 다음 단계로 이동 전 카메라/스캔 정리
    stopCamera();
    onScanSuccess(mockBikeData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600'
          }}>
            QR코드 스캔
          </h2>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {/* Camera View */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: 'calc(100% - 56px)',
          overflow: 'hidden',
          background: 'black'
        }}>
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            muted
            playsInline
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* camera view ends */}

      {/* Instructions */}
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '16px',
          marginBottom: '16px',
          lineHeight: '1.5'
        }}>
          자전거의 QR코드를 스캔 영역에 맞춰주세요
        </div>
        
        {/* 시뮬레이션 버튼 (개발용) */}
        <button
          onClick={simulateQRScan}
          style={{
            background: '#16a34a',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          🚲 QR 스캔 시뮬레이션
        </button>
        <div style={{
          fontSize: '12px',
          color: '#9ca3af',
          marginTop: '8px'
        }}>
          (개발용: 실제 QR코드 대신 시뮬레이션 버튼 사용)
        </div>
      </div>
    </div>

    {/* Floating mock scan button at root overlay (viewport-fixed) */}
    <button
      onClick={simulateQRScan}
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 18,
        transform: 'translateX(-50%)',
        zIndex: 9999,
        padding: '12px 18px',
        borderRadius: 999,
        border: 'none',
        background: '#22c55e',
        color: 'white',
        fontSize: 16,
        fontWeight: 600,
        boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
        cursor: 'pointer'
      }}
    >
      임의 스캔
    </button>
  </div>
);

}
export default QRScanner;
