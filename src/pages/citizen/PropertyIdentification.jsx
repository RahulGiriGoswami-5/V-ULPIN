import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CitizenNavbar, TopGovStrip } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { Citizen3DMapContainer } from '../../components/maps';
import { EmptyState } from '../../components/common';
import { Building2, CheckCircle, ArrowRight, MapPin, Layers } from 'lucide-react';

export default function PropertyIdentification() {
  const { selectedProperty, selectedFloor, selectedUnit, dispatch, notify } = useApp();
  const navigate = useNavigate();

  if (!selectedProperty) {
    return (
      <div className="page">
        <TopGovStrip />
        <CitizenNavbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState
            icon={Building2}
            title="No Property Selected"
            description="Please search for and select a property first."
            action={<button className="btn btn-saffron" onClick={() => navigate('/citizen/search')}>Go to Property Search</button>}
          />
        </div>
      </div>
    );
  }

  const floors = selectedProperty.building?.floors || [];

  const handleFloorSelect = (floor) => {
    dispatch({ type: 'SET_FLOOR', payload: floor });
    dispatch({ type: 'SET_UNIT', payload: null });
  };

  const handleUnitSelect = (unit) => {
    dispatch({ type: 'SET_UNIT', payload: unit });
    notify(`Unit ${unit} selected on ${selectedFloor?.name}`, 'success', 'Unit Selected');
  };

  const canProceed = selectedFloor && selectedUnit;

  return (
    <div className="page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopGovStrip />
      <CitizenNavbar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div className="page-header" style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--neutral-200)' }}>
          <div className="page-header-inner">
            <div>
              <h1 className="page-title" style={{ fontSize: '1.25rem' }}>3D Property Identification</h1>
              <p className="page-subtitle" style={{ fontSize: '0.8rem' }}>
                {selectedProperty.location} · {selectedProperty.parcelId} · {selectedProperty.building?.name}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {canProceed ? (
                <button className="btn btn-saffron" onClick={() => navigate('/citizen/generate')} id="proceed-generate-btn">
                  Proceed to Generate V-ULPIN <ArrowRight size={15} />
                </button>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', background: 'var(--neutral-100)', padding: '0.4rem 0.85rem', borderRadius: 20 }}>
                  Select floor and unit below to proceed
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clean, Full-Width Top Control Bar for Vertical Selection */}
        <div style={{
          background: '#fff',
          borderBottom: '1px solid var(--neutral-200)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          zIndex: 10,
        }}>
          {/* Top Row: Property & Floor Selection */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--navy-900)', fontWeight: 600, fontSize: '0.85rem' }}>
                <Building2 size={16} color="var(--navy-800)" />
                <span>{selectedProperty.building?.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', fontWeight: 400 }}>
                  ({floors.length} Floors · {selectedProperty.building?.totalUnits} Units)
                </span>
              </div>

              <div style={{ height: 16, width: 1, background: 'var(--neutral-300)' }} />

              {/* Floor Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Floor:
                </span>
                {floors.map(floor => {
                  const isSelected = selectedFloor?.id === floor.id;
                  return (
                    <button
                      key={floor.id}
                      onClick={() => handleFloorSelect(floor)}
                      className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                      style={{
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.75rem',
                        borderRadius: 6,
                        fontWeight: isSelected ? 600 : 500,
                      }}
                      id={`floor-${floor.id}-btn`}
                    >
                      {floor.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selection Summary Pill */}
            {(selectedFloor || selectedUnit) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: canProceed ? 'var(--green-50)' : 'var(--amber-50)',
                border: `1px solid ${canProceed ? 'var(--green-200)' : 'var(--amber-200)'}`,
                padding: '0.25rem 0.75rem',
                borderRadius: 20,
                fontSize: '0.75rem',
                color: canProceed ? 'var(--green-800)' : 'var(--amber-800)',
              }}>
                {selectedFloor && <span>{selectedFloor.name}</span>}
                {selectedUnit && (
                  <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    › Unit {selectedUnit} {canProceed && <CheckCircle size={12} color="var(--green-600)" />}
                  </span>
                )}
                {canProceed && (
                  <span style={{ color: 'var(--green-600)', marginLeft: 4 }}>
                    (Elev: {selectedProperty.coordinates?.elevation}m)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Bottom Row: Units on Selected Floor */}
          {selectedFloor && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              paddingTop: '0.375rem',
              borderTop: '1px dashed var(--neutral-200)',
              flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Units on {selectedFloor.name}:
              </span>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {selectedFloor.units.map(unit => {
                  const isUnitSelected = selectedUnit === unit;
                  return (
                    <button
                      key={unit}
                      onClick={() => handleUnitSelect(unit)}
                      className={`unit-chip ${isUnitSelected ? 'selected' : ''}`}
                      id={`unit-${unit}-btn`}
                      style={{
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        borderRadius: 4,
                      }}
                    >
                      {unit}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Full-Width Spacious 3D Map Area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Citizen3DMapContainer
            selectedProperty={selectedProperty}
            selectedFloor={selectedFloor}
            selectedUnit={selectedUnit}
            coordinates={selectedProperty.coordinates}
            onPropertySelected={(p) => dispatch({ type: 'SET_PROPERTY', payload: p })}
            onFloorSelected={(f) => dispatch({ type: 'SET_FLOOR', payload: f })}
            onUnitSelected={(u) => dispatch({ type: 'SET_UNIT', payload: u })}
          />
        </div>
      </div>
    </div>
  );
}
