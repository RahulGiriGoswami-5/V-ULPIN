import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GovernmentNavbar, TopGovStrip } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { Government3DMapContainer } from '../../components/maps';
import { PropertyInfoPanel } from '../../components/government/PropertyInfoPanel';
import { DecryptionPanel } from '../../components/government/DecryptionPanel';
import { IntegrityScore } from '../../components/government/IntegrityScore';
import { Map, Shield, FileText, CheckSquare, ArrowRight, Layers } from 'lucide-react';

export default function GovDashboard() {
  const navigate = useNavigate();
  const { selectedProperty, integrityResult, validationResult, selectedConflict, dispatch } = useApp();

  return (
    <div className="page">
      <TopGovStrip />
      <GovernmentNavbar />

      {/* Operational Workflow Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--neutral-200)', padding: '0.75rem 1.5rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, background: 'var(--navy-50)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} color="var(--navy-800)" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                Government Verification & 3D GIS Dashboard
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                Secure V-ULPIN Decryption, Spatial Validation & Land Record Verification
              </div>
            </div>
          </div>

          {/* Quick operational actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/government/search')} id="dash-search-decrypt-btn">
              <Shield size={13} /> Decrypt V-ULPIN
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/government/records')} id="dash-records-btn">
              <FileText size={13} /> Land Records
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/government/validation')} id="dash-validation-btn">
              <CheckSquare size={13} /> Spatial Validation
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/government/gis')} id="dash-full-gis-btn">
              <Map size={13} /> Open 3D GIS <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main GIS layout */}
      <div className="gis-layout" style={{ flex: 1 }}>
        {/* Left panel: Property Details & Identification */}
        <div className="gis-left-panel">
          <div className="panel-section" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
            <div className="panel-section-title">Selected Property Record</div>
            {selectedProperty ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
                Viewing vertical parcel on 3D GIS
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
                Decrypt a V-ULPIN or select a property below to view details
              </div>
            )}
          </div>
          <div className="panel-scroll">
            {selectedProperty ? (
              <PropertyInfoPanel compact />
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--neutral-400)', fontSize: '0.8rem' }}>
                <Map size={32} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.35 }} />
                Use the Decryption Panel on the right or search to locate a property parcel.
              </div>
            )}
          </div>
          <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid var(--neutral-100)', background: 'var(--neutral-50)' }}>
            <button className="btn btn-outline btn-sm w-full" onClick={() => navigate('/government/gis')}>
              <Map size={13} /> Full 3D GIS & Infrastructure View <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Map area */}
        <div className="gis-map-area">
          <Government3DMapContainer
            selectedProperty={selectedProperty}
            selectedConflict={selectedConflict}
            onPropertySelected={(p) => dispatch({ type: 'SET_PROPERTY', payload: p })}
          />
        </div>

        {/* Right panel: Integrity & Decryption */}
        <div className="gis-right-panel">
          <div className="panel-section">
            <div className="panel-section-title">Data Integrity Score</div>
            {integrityResult ? (
              <IntegrityScore result={integrityResult} compact />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--neutral-400)', fontSize: '0.8rem', padding: '1rem 0' }}>
                Decrypt or select a property to calculate data integrity score.
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
