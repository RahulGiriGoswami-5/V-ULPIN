import React, { useState, useRef } from 'react';
import { MapPin, Maximize2, Navigation, RotateCcw } from 'lucide-react';

// ── Citizen 3D Map Container ─────────────────────────────────
// Integrates the 3D city/property viewer into the Citizen Property Identification workflow
export function Citizen3DMapContainer({
  selectedProperty,
  selectedFloor,
  selectedUnit,
  coordinates,
  onPropertySelected,
  onFloorSelected,
  onUnitSelected,
  onMapLocationChanged,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  const coord = coordinates || selectedProperty?.coordinates || { lat: 20.5937, lng: 78.9629, elevation: 0 };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleResetView = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ action: 'resetView' }, '*');
    }
  };

  return (
    <div
      ref={containerRef}
      className="map-container"
      style={{
        minHeight: 450,
        height: '100%',
        position: 'relative',
        background: '#07101f',
        borderRadius: 0,
      }}
    >
      {/* Live 3D Map Viewer */}
      <iframe
        ref={iframeRef}
        src="/3d-viewer/index.html?embed=true&hideSidebar=true"
        title="3D Property Viewer"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          position: 'absolute',
          inset: 0,
        }}
        allow="fullscreen"
      />

      {/* Selected property tag */}
      {selectedProperty && (
        <div className="map-selected-tag" style={{ zIndex: 10 }}>
          <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
          {selectedProperty.location} ({selectedProperty.parcelId})
        </div>
      )}

      {/* Map controls */}
      <div className="map-controls-overlay" style={{ zIndex: 10 }}>
        <button
          className="map-control-btn"
          title="Reset 3D View"
          onClick={handleResetView}
        >
          <RotateCcw size={14} />
        </button>
        <button
          className="map-control-btn"
          title="Fullscreen"
          onClick={handleFullscreen}
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Status bar */}
      <div className="map-status-bar" style={{ zIndex: 10 }}>
        <span>
          3D City &amp; Cadastral Model
          {selectedFloor && ` · Floor: ${selectedFloor.name}`}
          {selectedUnit && ` · Unit: ${selectedUnit}`}
        </span>
        <div className="map-coord-badge">
          {coord.lat.toFixed(4)}°N, {coord.lng.toFixed(4)}°E · {coord.elevation || 0}m
        </div>
      </div>
    </div>
  );
}

// ── Government 3D Map Container ──────────────────────────────
// Integrates the 3D city/property viewer into Government GIS & Dashboard
export function Government3DMapContainer({
  selectedProperty,
  selectedULPIN,
  selectedParcel,
  selectedFloor,
  selectedUnit,
  coordinates,
  selectedConflict,
  highlightMode,
  onPropertySelected,
  onFloorSelected,
  onUnitSelected,
  onMapLocationChanged,
  onConflictSelected,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  const coord = coordinates || selectedProperty?.coordinates || { lat: 20.5937, lng: 78.9629, elevation: 0 };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleResetView = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ action: 'resetView' }, '*');
    }
  };

  return (
    <div
      ref={containerRef}
      className="map-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 450,
        background: '#07101f',
      }}
    >
      {/* Live 3D Map Viewer */}
      <iframe
        ref={iframeRef}
        src="/3d-viewer/index.html?embed=true"
        title="Government 3D GIS Viewer"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          position: 'absolute',
          inset: 0,
        }}
        allow="fullscreen"
      />

      {/* Selected property tag */}
      {selectedProperty && (
        <div className="map-selected-tag" style={{ zIndex: 10 }}>
          <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
          {selectedProperty.oldULPIN || selectedProperty.parcelId}
        </div>
      )}

      {/* Conflict indicator */}
      {selectedConflict && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          background: 'var(--red-600)',
          color: '#fff',
          padding: '0.35rem 0.75rem',
          borderRadius: 4,
          fontSize: '0.75rem',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 15,
        }}>
          ⚠ {selectedConflict.type}
        </div>
      )}

      {/* Controls */}
      <div className="map-controls-overlay" style={{ zIndex: 10 }}>
        <button
          className="map-control-btn"
          title="Reset 3D View"
          onClick={handleResetView}
        >
          <RotateCcw size={14} />
        </button>
        <button
          className="map-control-btn"
          title="Fullscreen"
          onClick={handleFullscreen}
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Status bar */}
      <div className="map-status-bar" style={{ zIndex: 10 }}>
        <span>
          Government 3D GIS Cadastral Engine
          {highlightMode ? ` · Mode: ${highlightMode}` : ''}
        </span>
        <div className="map-coord-badge">
          {coord.lat.toFixed(4)}°N, {coord.lng.toFixed(4)}°E · {coord.elevation || 0}m
        </div>
      </div>
    </div>
  );
}
