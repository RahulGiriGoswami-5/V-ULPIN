import React from 'react';
import { useApp } from '../../context/AppContext';

const ALL_LAYERS = [
  { name: 'Buildings',                  color: '#1a2744' },
  { name: 'Parcels',                    color: '#e8681a' },
  { name: 'Roads',                      color: '#6c757d' },
  { name: 'Water Pipelines',            color: '#2563eb' },
  { name: 'Electricity',                color: '#d97706' },
  { name: 'Sewage',                     color: '#7c3aed' },
  { name: 'Metro',                      color: '#dc2626' },
  { name: 'Underground Infrastructure', color: '#92400e' },
  { name: 'Rights of Way',             color: '#059669' },
];

export function GISLayerControls() {
  const { activeLayers, dispatch } = useApp();

  const toggleLayer = (name) => {
    dispatch({ type: 'TOGGLE_LAYER', payload: name });
  };

  const enableAll  = () => dispatch({ type: 'SET_ACTIVE_LAYERS', payload: ALL_LAYERS.map(l => l.name) });
  const disableAll = () => dispatch({ type: 'SET_ACTIVE_LAYERS', payload: [] });

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.625rem' }}>
        <button className="btn btn-sm btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem' }} onClick={enableAll} id="enable-all-layers-btn">All On</button>
        <button className="btn btn-sm btn-ghost"   style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem' }} onClick={disableAll} id="disable-all-layers-btn">All Off</button>
      </div>
      {ALL_LAYERS.map(layer => {
        const isActive = activeLayers.includes(layer.name);
        return (
          <button
            key={layer.name}
            className={`layer-btn ${isActive ? 'active' : ''}`}
            onClick={() => toggleLayer(layer.name)}
            id={`layer-${layer.name.toLowerCase().replace(/\s+/g, '-')}-btn`}
          >
            <div className="layer-indicator" style={{ background: isActive ? layer.color : 'var(--neutral-300)' }} />
            <span style={{ flex: 1, textAlign: 'left' }}>{layer.name}</span>
            <span style={{
              fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.4rem',
              borderRadius: 4,
              background: isActive ? 'rgba(255,255,255,0.15)' : 'var(--neutral-100)',
              color: isActive ? '#fff' : 'var(--neutral-500)',
            }}>{isActive ? 'ON' : 'OFF'}</span>
          </button>
        );
      })}
    </div>
  );
}
