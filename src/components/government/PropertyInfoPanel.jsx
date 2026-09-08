import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common';
import { MapPin, Building2 } from 'lucide-react';

export function PropertyInfoPanel({ compact = false }) {
  const { selectedProperty, selectedFloor, selectedUnit } = useApp();

  if (!selectedProperty) return null;

  const fields = [
    ['Old ULPIN', selectedProperty.oldULPIN],
    ['Parcel ID', selectedProperty.parcelId],
    ['Survey No.', selectedProperty.surveyNumber],
    ['Property Type', selectedProperty.propertyType],
    ['Land Area', selectedProperty.landArea],
    ['Location', selectedProperty.location],
    ['State', selectedProperty.state],
    ['Building', selectedProperty.building?.name],
    ['Floors', selectedProperty.building?.floors?.length],
    ['Total Units', selectedProperty.building?.totalUnits],
    ['Elevation', `${selectedProperty.coordinates?.elevation}m ASL`],
    ...(selectedFloor ? [['Selected Floor', selectedFloor.name]] : []),
    ...(selectedUnit ? [['Selected Unit', selectedUnit]] : []),
  ];

  return (
    <div style={{ padding: compact ? '0.75rem 1rem' : '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '0.875rem', alignItems: 'flex-start' }}>
        <div style={{ width: 32, height: 32, background: 'var(--navy-900)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Building2 size={15} color="var(--saffron-400)" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: compact ? '0.8rem' : '0.9375rem', color: 'var(--navy-900)' }}>{selectedProperty.building?.name}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--neutral-500)' }}>{selectedProperty.location.split(',').slice(0, 2).join(',')}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <StatusBadge status={selectedProperty.ownershipStatus} />
        <StatusBadge status={selectedProperty.mappingStatus} />
      </div>

      <div style={{ borderTop: '1px solid var(--neutral-100)', paddingTop: '0.75rem' }}>
        {fields.map(([label, val]) => (
          <div key={label} className="info-row" style={{ padding: '0.3rem 0', borderBottom: '1px solid var(--neutral-100)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--neutral-900)', textAlign: 'right', fontFamily: label.includes('ULPIN') || label.includes('ID') ? 'monospace' : 'inherit', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Infrastructure */}
      {selectedProperty.infrastructure && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--neutral-100)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--neutral-400)', marginBottom: '0.5rem' }}>Infrastructure</div>
          {Object.entries(selectedProperty.infrastructure).map(([key, val]) => (
            <div key={key} className="info-row" style={{ padding: '0.3rem 0', borderBottom: '1px solid var(--neutral-100)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--neutral-500)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--neutral-700)', textAlign: 'right', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
