import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CitizenNavbar, TopGovStrip } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { Citizen3DMapContainer } from '../../components/maps';
import { EmptyState } from '../../components/common';
import { Building2, ChevronDown, ChevronRight, CheckCircle, ArrowRight, MapPin } from 'lucide-react';

export default function PropertyIdentification() {
  const { selectedProperty, selectedFloor, selectedUnit, dispatch, notify } = useApp();
  const navigate = useNavigate();
  const [expandedFloor, setExpandedFloor] = useState(null);

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

  const handleFloorExpand = (floor) => {
    setExpandedFloor(expandedFloor?.id === floor.id ? null : floor);
    if (expandedFloor?.id !== floor.id) {
      dispatch({ type: 'SET_FLOOR', payload: floor });
      dispatch({ type: 'SET_UNIT', payload: null });
    }
  };

  const handleUnitSelect = (unit) => {
    dispatch({ type: 'SET_UNIT', payload: unit });
    notify(`Unit ${unit} selected on ${selectedFloor?.name}`, 'success', 'Unit Selected');
  };

  const canProceed = selectedFloor && selectedUnit;

  return (
    <div className="page">
      <TopGovStrip />
      <CitizenNavbar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div className="page-header">
          <div className="page-header-inner">
            <div>
              <h1 className="page-title">3D Property Identification</h1>
              <p className="page-subtitle">{selectedProperty.location} · {selectedProperty.parcelId}</p>
            </div>
            {canProceed && (
              <button className="btn btn-saffron" onClick={() => navigate('/citizen/generate')} id="proceed-generate-btn">
                Proceed to Generate V-ULPIN <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', gap: 0, overflow: 'hidden', minHeight: 0 }}>
          {/* Left: Vertical selector */}
          <div style={{ background: '#fff', borderRight: '1px solid var(--neutral-200)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Property info */}
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--neutral-100)', background: 'var(--navy-900)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <MapPin size={14} color="var(--saffron-400)" />
                <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>{selectedProperty.building?.name}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                {selectedProperty.building?.totalUnits} units · {floors.length} floors
              </div>
            </div>

            {/* Selection state */}
            {(selectedFloor || selectedUnit) && (
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--neutral-100)', background: 'var(--green-50)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '0.25rem' }}>Current Selection</div>
                {selectedFloor && (
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy-800)' }}>
                    {selectedFloor.name}
                    {selectedUnit && <span style={{ color: 'var(--green-700)' }}> › Unit {selectedUnit} <CheckCircle size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /></span>}
                  </div>
                )}
              </div>
            )}

            {/* Building tree */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <div style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--neutral-400)', borderBottom: '1px solid var(--neutral-100)' }}>
                Select Floor &amp; Unit
              </div>
              <div className="building-selector" style={{ border: 'none', borderRadius: 0 }}>
                {floors.map(floor => {
                  const isExpanded = expandedFloor?.id === floor.id;
                  const isFloorSelected = selectedFloor?.id === floor.id;
                  return (
                    <div className={`floor-item ${isExpanded ? 'expanded' : ''}`} key={floor.id}>
                      <div
                        className="floor-item-header"
                        onClick={() => handleFloorExpand(floor)}
                        style={{ background: isFloorSelected ? 'var(--neutral-100)' : '' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Building2 size={14} color={isFloorSelected ? 'var(--navy-800)' : 'var(--neutral-400)'} />
                          <span className="floor-name" style={{ fontWeight: isFloorSelected ? 600 : 500, color: isFloorSelected ? 'var(--navy-900)' : 'var(--neutral-700)' }}>
                            {floor.name}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--neutral-400)', background: 'var(--neutral-100)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                            {floor.units.length} units
                          </span>
                        </div>
                        {isExpanded ? <ChevronDown size={14} color="var(--neutral-400)" /> : <ChevronRight size={14} color="var(--neutral-400)" />}
                      </div>
                      {isExpanded && (
                        <div className="unit-list">
                          {floor.units.map(unit => (
                            <button
                              key={unit}
                              className={`unit-chip ${selectedUnit === unit && isFloorSelected ? 'selected' : ''}`}
                              onClick={() => handleUnitSelect(unit)}
                              id={`unit-${unit}-btn`}
                            >
                              {unit}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Property details panel */}
            <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid var(--neutral-100)', background: 'var(--neutral-50)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--neutral-400)', marginBottom: '0.5rem' }}>Property Details</div>
              {[
                ['Type', selectedProperty.propertyType],
                ['Area', selectedProperty.landArea],
                ['Old ULPIN', selectedProperty.oldULPIN],
                ...(selectedFloor ? [['Floor', selectedFloor.name]] : []),
                ...(selectedUnit ? [['Unit', selectedUnit]] : []),
                ...(selectedFloor && selectedUnit ? [['Elevation', `${selectedProperty.coordinates?.elevation}m`]] : []),
              ].map(([label, val]) => (
                <div className="info-row" key={label} style={{ padding: '0.3rem 0', borderBottom: '1px solid var(--neutral-100)' }}>
                  <span className="info-label" style={{ fontSize: '0.75rem' }}>{label}</span>
                  <span className="info-value" style={{ fontSize: '0.75rem' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Map */}
          <div style={{ overflow: 'hidden' }}>
            <Citizen3DMapContainer
              selectedProperty={selectedProperty}
              selectedFloor={selectedFloor}
              selectedUnit={selectedUnit}
              coordinates={selectedProperty.coordinates}
              activeLayers={['Buildings', 'Parcels']}
              onPropertySelected={(p) => dispatch({ type: 'SET_PROPERTY', payload: p })}
              onFloorSelected={(f) => dispatch({ type: 'SET_FLOOR', payload: f })}
              onUnitSelected={(u) => dispatch({ type: 'SET_UNIT', payload: u })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
