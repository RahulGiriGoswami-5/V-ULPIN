import React, { useState } from 'react';
import {
  MapPin, ZoomIn, ZoomOut, RotateCcw,
  Navigation, Maximize2,
} from 'lucide-react';

// ── Citizen 3D Map Container ─────────────────────────────────
// Integration contract: accepts selectedProperty, selectedFloor, selectedUnit,
// coordinates, highlightMode.
// Exposes: onPropertySelected, onFloorSelected, onUnitSelected, onMapLocationChanged.
//
// All props and callbacks continue to work.

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
  const [zoom, setZoom] = useState(14);
  const [showLegend, setShowLegend] = useState(true);

  const handleZoomIn  = () => setZoom(z => Math.min(z + 1, 20));
  const handleZoomOut = () => setZoom(z => Math.max(z - 1, 8));
  const handleReset   = () => {
    setZoom(14);
    onMapLocationChanged?.({ lat: coordinates?.lat, lng: coordinates?.lng });
  };

  const coord = coordinates || selectedProperty?.coordinates || { lat: 20.5937, lng: 78.9629, elevation: 0 };

  return (
    <div className="map-container" style={{ minHeight: 360, borderRadius: 8 }}>
      {/* ── 3D Map Placeholder ── */}
      {/* INSERT YOUR EXISTING 3D MAP COMPONENT HERE */}
      <div className="map-placeholder">
        <div className="map-placeholder-icon">
          <MapPin size={32} color="var(--neutral-400)" />
        </div>
        {selectedProperty ? (
          <>
            <h3 style={{ color: 'var(--navy-800)' }}>{selectedProperty.location}</h3>
            <p>
              {selectedFloor && `Floor: ${selectedFloor.name}`}
              {selectedFloor && selectedUnit && ' › '}
              {selectedUnit && `Unit: ${selectedUnit}`}
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
              3D Map will render here upon integration
            </p>
          </>
        ) : (
          <>
            <h3>3D Property Map</h3>
            <p>Search for a property to locate and identify it on the 3D map.</p>
          </>
        )}
      </div>
      {/* END 3D MAP PLACEHOLDER */}

      {/* Selected tag */}
      {selectedProperty && (
        <div className="map-selected-tag">
          <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
          {selectedProperty.parcelId}
        </div>
      )}

      {/* Map controls */}
      <div className="map-controls-overlay">
        <button className="map-control-btn" title="Zoom In" onClick={handleZoomIn}><ZoomIn size={14} /></button>
        <button className="map-control-btn" title="Zoom Out" onClick={handleZoomOut}><ZoomOut size={14} /></button>
        <button className="map-control-btn" title="Reset View" onClick={handleReset}><RotateCcw size={14} /></button>
        <button className="map-control-btn" title="Navigate" onClick={() => onMapLocationChanged?.({ lat: coord.lat, lng: coord.lng })}><Navigation size={14} /></button>
      </div>

      {/* Legend */}
      {showLegend && selectedProperty && (
        <div className="map-legend">
          <div className="map-legend-title">Legend</div>
          <div className="map-legend-item"><div className="legend-dot" style={{ background: '#1a2744' }} /> Selected Property</div>
          <div className="map-legend-item"><div className="legend-dot" style={{ background: '#e8681a' }} /> Active Floor</div>
          <div className="map-legend-item"><div className="legend-dot" style={{ background: '#16a34a' }} /> Verified Unit</div>
        </div>
      )}

      {/* Status bar */}
      <div className="map-status-bar">
        <span>Zoom: {zoom}</span>
        <div className="map-coord-badge">
          {coord.lat.toFixed(4)}°N, {coord.lng.toFixed(4)}°E
          {coord.elevation ? ` · ${coord.elevation}m` : ''}
        </div>
      </div>
    </div>
  );
}

// ── Government 3D Map Container ──────────────────────────────
// Integration contract: accepts selectedProperty, selectedULPIN, selectedParcel,
// selectedFloor, selectedUnit, coordinates, selectedConflict, highlightMode.
// Exposes: onPropertySelected, onFloorSelected, onUnitSelected,
//          onMapLocationChanged, onConflictSelected.

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
  const [zoom, setZoom] = useState(15);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn  = () => setZoom(z => Math.min(z + 1, 20));
  const handleZoomOut = () => setZoom(z => Math.max(z - 1, 8));
  const handleReset   = () => { setZoom(15); };

  const coord = coordinates || selectedProperty?.coordinates || { lat: 20.5937, lng: 78.9629, elevation: 0 };

  return (
    <div className="map-container" style={{ position: 'relative' }}>
      {/* ── 3D GIS Map Placeholder ── */}
      {/* INSERT YOUR EXISTING GOVERNMENT 3D MAP COMPONENT HERE */}
      <div className="map-placeholder">
        <div className="map-placeholder-icon">
          <MapPin size={32} color="var(--navy-600)" />
        </div>
        {selectedProperty ? (
          <>
            <h3 style={{ color: 'var(--navy-800)', fontSize: '1rem' }}>{selectedProperty.location}</h3>
            <p style={{ fontSize: '0.8rem' }}>
              {selectedProperty.parcelId} · {selectedProperty.propertyType}
            </p>
            {selectedConflict && (
              <p style={{ fontSize: '0.75rem', color: 'var(--red-600)', marginTop: '0.5rem', fontWeight: 600 }}>
                Conflict highlighted: {selectedConflict.type}
              </p>
            )}
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
              3D Map renders here upon integration
            </p>
          </>
        ) : (
          <>
            <h3>Government 3D GIS</h3>
            <p>Search or select a property to view it on the 3D GIS map.</p>
          </>
        )}
      </div>
      {/* END 3D GIS MAP PLACEHOLDER */}

      {/* Selected property tag */}
      {selectedProperty && (
        <div className="map-selected-tag">
          <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
          {selectedProperty.oldULPIN}
        </div>
      )}

      {/* Conflict indicator */}
      {selectedConflict && (
        <div style={{
          position: 'absolute', top: '3.25rem', left: '1rem',
          background: 'var(--red-600)', color: '#fff',
          padding: '0.3rem 0.75rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}>
          ⚠ {selectedConflict.type}
        </div>
      )}

      {/* Controls */}
      <div className="map-controls-overlay">
        <button className="map-control-btn" title="Zoom In" onClick={handleZoomIn}><ZoomIn size={14} /></button>
        <button className="map-control-btn" title="Zoom Out" onClick={handleZoomOut}><ZoomOut size={14} /></button>
        <button className="map-control-btn" title="Reset View" onClick={handleReset}><RotateCcw size={14} /></button>
        <button className="map-control-btn" title="Navigate to Property" onClick={() => onMapLocationChanged?.({ lat: coord.lat, lng: coord.lng })}>
          <Navigation size={14} />
        </button>
        <button className="map-control-btn" title="Fullscreen" onClick={() => setIsFullscreen(f => !f)}>
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Status bar */}
      <div className="map-status-bar">
        <span>Zoom: {zoom}{highlightMode ? ` · Mode: ${highlightMode}` : ''}</span>
        <div className="map-coord-badge">
          {coord.lat.toFixed(4)}°N, {coord.lng.toFixed(4)}°E · {coord.elevation || 0}m
        </div>
      </div>
    </div>
  );
}
