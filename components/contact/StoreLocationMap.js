'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  RotateCcw,
  Plus,
  Minus,
  ExternalLink,
  AlertCircle,
  Clock,
  Car,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';
import styles from './StoreLocationMap.module.css';

const STORE_COORDS = { lat: 17.4646, lng: 78.3610 };
const STORE_NAME = 'Kondapur Sri Ram Nagar Store';
const STORE_ADDRESS = 'Kondapur Sri Ram Nagar Store, Hyderabad, Telangana, India';
const STORE_HOURS = 'Monday – Saturday: 10:00 AM – 8:00 PM';
const INITIAL_ZOOM = 15;

/**
 * Web Mercator Projection for OpenStreetMap tiles.
 */
function project(lat, lng, zoom) {
  const d = Math.PI / 180;
  const max = 85.0511287798;
  const latRad = Math.max(Math.min(max, lat), -max) * d;
  const sin = Math.sin(latRad);
  const n = Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * 256 * n;
  const y = ((1 - Math.log((1 + sin) / (1 - sin)) / (2 * Math.PI)) / 2) * 256 * n;
  return { x, y };
}

/**
 * Haversine formula to compute geodesic distance in km.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  if (d < 1) {
    return `${Math.round(d * 1000)} m`;
  }
  return `${d.toFixed(1)} km`;
}

/**
 * Computes optimal zoom level for two coordinates.
 */
function getFitZoom(distKm) {
  if (distKm <= 1.5) return 15;
  if (distKm <= 4) return 14;
  if (distKm <= 10) return 13;
  if (distKm <= 25) return 12;
  if (distKm <= 60) return 10;
  if (distKm <= 150) return 9;
  return 7;
}

export default function StoreLocationMap() {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 320 });
  const [center, setCenter] = useState(STORE_COORDS);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [activePopup, setActivePopup] = useState('store'); // 'store' | 'user' | null
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, centerPoint: { x: 0, y: 0 } });

  // Update container dimensions for pixel projection
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setDimensions({ width: clientWidth, height: clientHeight });
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Geolocation Handler
  const handleLocateUser = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 0);
        const distanceStr = calculateDistance(STORE_COORDS.lat, STORE_COORDS.lng, userLat, userLng);
        const rawDistKm = parseFloat(distanceStr.replace(/[^0-9.]/g, '')) * (distanceStr.includes('m') ? 0.001 : 1);

        const newLoc = {
          lat: userLat,
          lng: userLng,
          accuracy,
          distance: distanceStr,
          rawDistKm,
        };

        setUserLocation(newLoc);
        setIsLocating(false);

        // Auto-center and fit zoom
        const midLat = (STORE_COORDS.lat + userLat) / 2;
        const midLng = (STORE_COORDS.lng + userLng) / 2;
        const fitZoom = getFitZoom(rawDistKm);

        setCenter({ lat: midLat, lng: midLng });
        setZoom(fitZoom);
        setActivePopup('user');
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation access error:', err);
        if (err.code === 1) {
          setLocationError('Unable to access your current location. Please allow location access in your browser.');
        } else if (err.code === 2) {
          setLocationError('Position unavailable. Please check your device location settings.');
        } else {
          setLocationError('Location request timed out. Please try again.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  const handleRecenterStore = () => {
    setCenter(STORE_COORDS);
    setZoom(INITIAL_ZOOM);
    setActivePopup('store');
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 1, 18));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 1, 4));

  // Drag to pan map logic
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Left button only
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      centerPoint: project(center.lat, center.lng, zoom),
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    const newX = dragStart.centerPoint.x - dx;
    const newY = dragStart.centerPoint.y - dy;

    // Unproject to lat/lng
    const n = Math.pow(2, zoom);
    const lng = (newX / (256 * n)) * 360 - 180;
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * newY) / (256 * n))));
    const lat = (latRad * 180) / Math.PI;

    setCenter({ lat, lng });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch drag for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX,
        y: touch.clientY,
        centerPoint: project(center.lat, center.lng, zoom),
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.x;
    const dy = touch.clientY - dragStart.y;

    const newX = dragStart.centerPoint.x - dx;
    const newY = dragStart.centerPoint.y - dy;

    const n = Math.pow(2, zoom);
    const lng = (newX / (256 * n)) * 360 - 180;
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * newY) / (256 * n))));
    const lat = (latRad * 180) / Math.PI;

    setCenter({ lat, lng });
  };

  // Compute tile range for viewport
  const centerProjected = project(center.lat, center.lng, zoom);
  const minX = Math.floor((centerProjected.x - dimensions.width / 2) / 256);
  const maxX = Math.floor((centerProjected.x + dimensions.width / 2) / 256);
  const minY = Math.floor((centerProjected.y - dimensions.height / 2) / 256);
  const maxY = Math.floor((centerProjected.y + dimensions.height / 2) / 256);

  const tiles = [];
  const maxTile = Math.pow(2, zoom);
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      if (y >= 0 && y < maxTile) {
        const wrappedX = ((x % maxTile) + maxTile) % maxTile;
        const left = x * 256 - (centerProjected.x - dimensions.width / 2);
        const top = y * 256 - (centerProjected.y - dimensions.height / 2);
        tiles.push({
          key: `${zoom}-${x}-${y}`,
          url: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
          left,
          top,
        });
      }
    }
  }

  // Compute pixel positions for markers
  const storeProjected = project(STORE_COORDS.lat, STORE_COORDS.lng, zoom);
  const storeScreenX = dimensions.width / 2 + (storeProjected.x - centerProjected.x);
  const storeScreenY = dimensions.height / 2 + (storeProjected.y - centerProjected.y);

  let userScreenX = null;
  let userScreenY = null;
  if (userLocation) {
    const userProjected = project(userLocation.lat, userLocation.lng, zoom);
    userScreenX = dimensions.width / 2 + (userProjected.x - centerProjected.x);
    userScreenY = dimensions.height / 2 + (userProjected.y - centerProjected.y);
  }

  // Directions destination URL
  const directionsUrl = userLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${STORE_COORDS.lat},${STORE_COORDS.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=Kondapur+Sri+Ram+Nagar+Store+Hyderabad+Telangana+India`;

  return (
    <div className={styles.locationCard}>
      {/* Interactive Map Viewport */}
      <div
        ref={containerRef}
        className={`${styles.mapContainer} ${isDragging ? styles.grabbing : styles.grab}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        role="region"
        aria-label="Interactive Store and User Location Map"
      >
        {/* OpenStreetMap Tile Layer */}
        <div className={styles.tileLayer} aria-hidden="true">
          {tiles.map((tile) => (
            <img
              key={tile.key}
              src={tile.url}
              alt=""
              loading="lazy"
              draggable="false"
              className={styles.tileImg}
              style={{
                left: `${tile.left}px`,
                top: `${tile.top}px`,
              }}
            />
          ))}
        </div>

        {/* SVG Route Line between User and Store */}
        {userLocation && userScreenX !== null && userScreenY !== null && (
          <svg className={styles.svgOverlay} aria-hidden="true">
            <line
              x1={storeScreenX}
              y1={storeScreenY}
              x2={userScreenX}
              y2={userScreenY}
              stroke="rgba(232, 163, 61, 0.7)"
              strokeWidth="3"
              strokeDasharray="6 6"
            />
            {/* Distance Midpoint Badge */}
            <g transform={`translate(${(storeScreenX + userScreenX) / 2}, ${(storeScreenY + userScreenY) / 2})`}>
              <rect x="-35" y="-12" width="70" height="24" rx="12" fill="rgba(14, 12, 10, 0.9)" stroke="rgba(232, 163, 61, 0.6)" strokeWidth="1" />
              <text x="0" y="4" fill="#e8a33d" fontSize="11" fontWeight="bold" textAnchor="middle">
                {userLocation.distance}
              </text>
            </g>
          </svg>
        )}

        {/* Store Marker */}
        <div
          className={styles.markerContainer}
          style={{ left: `${storeScreenX}px`, top: `${storeScreenY}px` }}
          onClick={(e) => {
            e.stopPropagation();
            setActivePopup(activePopup === 'store' ? null : 'store');
          }}
        >
          <div className={styles.storePin}>
            <div className={styles.storePinIcon}>
              <MapPin size={18} />
            </div>
            <div className={styles.storePulse} />
          </div>

          {/* Store Popup */}
          {activePopup === 'store' && (
            <div className={styles.popupCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.popupHeader}>
                <span className={styles.popupTag}>Official Store</span>
                <button
                  type="button"
                  onClick={() => setActivePopup(null)}
                  className={styles.popupClose}
                  aria-label="Close popup"
                >
                  <X size={13} />
                </button>
              </div>
              <h4 className={styles.popupTitle}>{STORE_NAME}</h4>
              <p className={styles.popupAddress}>Kondapur, Sri Ram Nagar, Hyderabad, Telangana</p>
              <div className={styles.popupMeta}>
                <Clock size={12} aria-hidden="true" />
                <span>Mon–Sat: 10:00 AM – 8:00 PM</span>
              </div>
            </div>
          )}
        </div>

        {/* User Location Marker */}
        {userLocation && userScreenX !== null && userScreenY !== null && (
          <div
            className={styles.markerContainer}
            style={{ left: `${userScreenX}px`, top: `${userScreenY}px` }}
            onClick={(e) => {
              e.stopPropagation();
              setActivePopup(activePopup === 'user' ? null : 'user');
            }}
          >
            <div className={styles.userPin}>
              <div className={styles.userDot} />
              <div className={styles.userRadar} />
            </div>

            {/* User Popup */}
            {activePopup === 'user' && (
              <div className={`${styles.popupCard} ${styles.userPopupCard}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.popupHeader}>
                  <span className={`${styles.popupTag} ${styles.userTag}`}>Your Location</span>
                  <button
                    type="button"
                    onClick={() => setActivePopup(null)}
                    className={styles.popupClose}
                    aria-label="Close popup"
                  >
                    <X size={13} />
                  </button>
                </div>
                <h4 className={styles.popupTitle}>Current Position</h4>
                <p className={styles.popupAddress}>
                  Distance to store: <strong style={{ color: 'var(--color-accent)' }}>{userLocation.distance}</strong>
                </p>
                <div className={styles.popupMeta}>
                  <CheckCircle2 size={12} color="#38bdf8" aria-hidden="true" />
                  <span>Accuracy: ±{userLocation.accuracy}m</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Controls Overlay */}
        <div className={styles.topControls}>
          <div className={styles.infoBadge}>
            <span className={styles.badgeDot} />
            <span>{userLocation ? `Distance: ~${userLocation.distance}` : 'Kondapur, Hyderabad'}</span>
          </div>

          <div className={styles.actionButtonsGroup}>
            <button
              type="button"
              onClick={handleLocateUser}
              disabled={isLocating}
              className={`${styles.iconBtn} ${userLocation ? styles.activeLocateBtn : ''}`}
              title="Use My Current Location"
              aria-label="Detect and show my current location on map"
            >
              {isLocating ? (
                <Loader2 size={16} className={styles.spin} />
              ) : (
                <Navigation size={16} className={userLocation ? styles.navActive : ''} />
              )}
            </button>

            <button
              type="button"
              onClick={handleRecenterStore}
              className={styles.iconBtn}
              title="Recenter Store Location"
              aria-label="Recenter map to Kondapur store"
            >
              <RotateCcw size={15} />
            </button>

            <div className={styles.zoomStack}>
              <button
                type="button"
                onClick={handleZoomIn}
                className={styles.zoomBtn}
                title="Zoom In"
                aria-label="Zoom in"
              >
                <Plus size={14} />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className={styles.zoomBtn}
                title="Zoom Out"
                aria-label="Zoom out"
              >
                <Minus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Attribution watermark */}
        <div className={styles.attribution} aria-hidden="true">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>
        </div>
      </div>

      {/* Geolocation Error Alert */}
      {locationError && (
        <div className={styles.errorAlert} role="alert">
          <AlertCircle size={16} className={styles.errorIcon} aria-hidden="true" />
          <div className={styles.errorText}>{locationError}</div>
          <button
            type="button"
            onClick={() => setLocationError(null)}
            className={styles.dismissBtn}
            aria-label="Dismiss location message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Store Location Card Body */}
      <div className={styles.locationBody}>
        <div className={styles.storeDetailsRow}>
          <div>
            <h3 className={styles.locationTitle}>Visit MOBILÉ Store</h3>
            <p className={styles.locationSubtitle}>
              {STORE_ADDRESS} · {STORE_HOURS}
            </p>
          </div>

          {userLocation && (
            <div className={styles.distanceBadge}>
              <Car size={15} aria-hidden="true" />
              <span>~{userLocation.distance} away</span>
            </div>
          )}
        </div>

        <div className={styles.bottomActions}>
          {!userLocation && (
            <button
              type="button"
              onClick={handleLocateUser}
              disabled={isLocating}
              className={styles.locateActionBtn}
            >
              {isLocating ? (
                <>
                  <Loader2 size={16} className={styles.spin} aria-hidden="true" />
                  <span>Detecting location...</span>
                </>
              ) : (
                <>
                  <Navigation size={16} aria-hidden="true" />
                  <span>Use My Current Location</span>
                </>
              )}
            </button>
          )}

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.directionsBtn}
            aria-label="Get driving directions on Google Maps"
          >
            <span>Get Directions</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
