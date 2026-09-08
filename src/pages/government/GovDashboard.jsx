import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GovernmentNavbar, TopGovStrip } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { analyticsService } from '../../services';
import { Government3DMapContainer } from '../../components/maps';
import { GISLayerControls } from '../../components/government/GISLayerControls';
import { PropertyInfoPanel } from '../../components/government/PropertyInfoPanel';
import { DecryptionPanel } from '../../components/government/DecryptionPanel';
import { IntegrityScore } from '../../components/government/IntegrityScore';
import { BarChart2, Map, Shield, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export default function GovDashboard() {
  const navigate = useNavigate();
  const { selectedProperty, activeLayers, integrityResult, validationResult, selectedConflict } = useApp();
  const analytics = analyticsService.getDashboardAnalytics();

  const stats = [
    { label: 'Total Parcels', value: analytics.totalParcels.toLocaleString('en-IN'), icon: Map, color: 'var(--navy-800)', bg: 'var(--neutral-100)' },
    { label: 'Verified', value: analytics.verifiedProperties.toLocaleString('en-IN'), icon: CheckCircle, color: 'var(--green-600)', bg: 'var(--green-100)' },
    { label: 'Avg. Integrity', value: `${analytics.averageIntegrityScore}%`, icon: Shield, color: 'var(--saffron-500)', bg: 'var(--saffron-100)' },
    { label: 'Conflicts', value: analytics.conflictedProperties.toLocaleString('en-IN'), icon: AlertTriangle, color: 'var(--red-600)', bg: 'var(--red-100)' },
  ];

  return (
    <div className="page">
      <TopGovStrip />
      <GovernmentNavbar />

      {/* Dashboard: 4-column stats + decrypt panel */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--neutral-200)', padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 2fr', gap: '1rem', alignItems: 'center' }}>
          {stats.map(s => (
            <div key={s.label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, background: s.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={18} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-900)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            </div>
          ))}
          {/* Decrypt quick access */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/government/search')}>
              <Shield size={14} /> Decrypt V-ULPIN
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/government/analytics')}>
              <BarChart2 size={14} /> Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Main GIS layout */}
      <div className="gis-layout" style={{ flex: 1 }}>
        {/* Left panel */}
        <div className="gis-left-panel">
          <div className="panel-section" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
            <div className="panel-section-title">Map Layers</div>
            <GISLayerControls />
          </div>
          <div className="panel-scroll">
            {selectedProperty ? (
              <PropertyInfoPanel compact />
            ) : (
              <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--neutral-400)', fontSize: '0.8rem' }}>
                <Map size={28} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.4 }} />
                Search or select a property to view details
              </div>
            )}
          </div>
          <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid var(--neutral-100)', background: 'var(--neutral-50)' }}>
            <button className="btn btn-outline btn-sm w-full" onClick={() => navigate('/government/gis')}>
              <Map size={13} /> Open Full GIS View <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="gis-map-area">
          <Government3DMapContainer
            selectedProperty={selectedProperty}
            activeLayers={activeLayers}
            selectedConflict={selectedConflict}
          />
        </div>

        {/* Right panel */}
        <div className="gis-right-panel">
          <div className="panel-section">
            <div className="panel-section-title">Integrity Score</div>
            {integrityResult ? (
              <IntegrityScore result={integrityResult} compact />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--neutral-400)', fontSize: '0.8rem', padding: '1rem 0' }}>
                Select a property and run the integrity test.
              </div>
            )}
          </div>
          <div className="panel-scroll">
            <DecryptionPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
