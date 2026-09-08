import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GovernmentNavbar, TopGovStrip, PageHeader } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { propertyService, integrityService } from '../../services';
import { Government3DMapContainer } from '../../components/maps';
import { GISLayerControls } from '../../components/government/GISLayerControls';
import { PropertyInfoPanel } from '../../components/government/PropertyInfoPanel';
import { IntegrityScore } from '../../components/government/IntegrityScore';
import { DecryptionPanel } from '../../components/government/DecryptionPanel';
import { InfrastructureAnalysis } from '../../components/government/InfrastructureAnalysis';
import { Spinner } from '../../components/common';
import { Search, Shield, CheckSquare, Building2, RefreshCw, AlertTriangle, Eye } from 'lucide-react';

export default function GISPage() {
  const { selectedProperty, selectedFloor, selectedUnit, activeLayers, integrityResult, validationResult, selectedConflict, dispatch, notify } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState('idle');
  const [activeTab, setActiveTab] = useState('layers');
  const [integrityLoading, setIntegrityLoading] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchStatus('searching');
    await new Promise(r => setTimeout(r, 800));
    const found = propertyService.smartSearch(searchQuery);
    if (found) {
      dispatch({ type: 'SET_PROPERTY', payload: found });
      notify(`Property located: ${found.location}`, 'success', 'Found');
      setSearchStatus('idle');
    } else {
      setSearchStatus('not-found');
      notify('No property found for that query.', 'warning', 'Not Found');
    }
  };

  const handleIntegrityTest = async () => {
    if (!selectedProperty) { notify('Select a property first.', 'warning'); return; }
    dispatch({ type: 'SET_INTEGRITY_LOADING', payload: true });
    setIntegrityLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const result = integrityService.runIntegrityTest(selectedProperty);
    dispatch({ type: 'SET_INTEGRITY_RESULT', payload: result });
    setIntegrityLoading(false);
    notify(`Integrity Score: ${result.overall}/100 — ${result.status === 'verified' ? 'Verified' : result.status === 'attention' ? 'Needs Attention' : 'Critical'}`, result.status === 'verified' ? 'success' : result.status === 'attention' ? 'warning' : 'error', 'Integrity Test Complete');
  };

  const handleValidation = async () => {
    if (!selectedProperty) { notify('Select a property first.', 'warning'); return; }
    dispatch({ type: 'SET_VALIDATION_LOADING', payload: true });
    setValidationLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    const result = integrityService.runSpatialValidation(selectedProperty);
    dispatch({ type: 'SET_VALIDATION_RESULT', payload: result });
    setValidationLoading(false);
    notify(
      result.hasConflicts ? `${result.conflicts.length} conflict(s) detected.` : 'No spatial conflicts found.',
      result.hasConflicts ? 'warning' : 'success',
      'Spatial Validation Complete'
    );
  };

  const handleViewIssues = () => {
    setActiveTab('integrity');
    if (validationResult?.conflicts[0]) {
      dispatch({ type: 'SET_SELECTED_CONFLICT', payload: validationResult.conflicts[0] });
    }
  };

  return (
    <div className="page">
      <TopGovStrip />
      <GovernmentNavbar />

      <div className="gis-layout" style={{ flex: 1, height: 'calc(100vh - 108px)' }}>
        {/* LEFT PANEL */}
        <div className="gis-left-panel">
          {/* Search */}
          <div className="panel-section">
            <div className="panel-section-title">Property Search</div>
            <div className="search-box" style={{ marginBottom: '0.5rem' }}>
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchStatus('idle'); }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="V-ULPIN / Old ULPIN / Parcel ID…"
                id="gis-search-input"
                style={{ fontSize: '0.8rem' }}
              />
              <button className="search-box-btn" onClick={handleSearch} disabled={searchStatus === 'searching'} style={{ padding: '0 0.75rem' }}>
                {searchStatus === 'searching' ? <Spinner white size="sm" /> : <Search size={13} />}
              </button>
            </div>
            {searchStatus === 'not-found' && (
              <div style={{ fontSize: '0.75rem', color: 'var(--red-600)', padding: '0.375rem', background: 'var(--red-50)', borderRadius: 4, border: '1px solid var(--red-100)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <AlertTriangle size={12} /> No property found.
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--neutral-100)' }}>
            {[
              { id: 'layers', label: 'Layers', icon: Building2 },
              { id: 'property', label: 'Property', icon: Search },
              { id: 'integrity', label: 'Integrity', icon: Shield },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  flex: 1, padding: '0.5rem', fontSize: '0.72rem', fontWeight: 500, border: 'none',
                  borderBottom: `2px solid ${activeTab === t.id ? 'var(--navy-800)' : 'transparent'}`,
                  background: activeTab === t.id ? 'var(--neutral-50)' : 'transparent',
                  color: activeTab === t.id ? 'var(--navy-800)' : 'var(--neutral-500)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                }}
              >
                <t.icon size={11} /> {t.label}
              </button>
            ))}
          </div>

          <div className="panel-scroll">
            {activeTab === 'layers' && (
              <div className="panel-section">
                <GISLayerControls />
              </div>
            )}
            {activeTab === 'property' && (
              selectedProperty ? <PropertyInfoPanel compact /> : (
                <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--neutral-400)', fontSize: '0.8rem' }}>
                  Search for a property to view details.
                </div>
              )
            )}
            {activeTab === 'integrity' && (
              <div className="panel-section">
                {integrityResult ? (
                  <>
                    <IntegrityScore result={integrityResult} compact />
                    {integrityResult.issues?.length > 0 && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Issues Found</div>
                        {integrityResult.issues.map(issue => (
                          <div key={issue.field} style={{ background: 'var(--amber-50)', border: '1px solid var(--amber-100)', borderRadius: 6, padding: '0.5rem', marginBottom: '0.375rem', fontSize: '0.72rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--amber-800)' }}>{issue.field} — {issue.value}%</div>
                            <div style={{ color: 'var(--amber-700)', marginTop: '0.2rem' }}>{issue.note}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--neutral-400)', fontSize: '0.8rem', padding: '1rem 0' }}>
                    Run integrity test to view score.
                  </div>
                )}
              </div>
            )}

            {/* Decrypt panel always visible */}
            <DecryptionPanel />
          </div>

          {/* Action buttons */}
          <div style={{ padding: '0.75rem', borderTop: '1px solid var(--neutral-100)', background: 'var(--neutral-50)', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <button
              className="btn btn-primary btn-sm"
              style={{ justifyContent: 'center' }}
              onClick={handleIntegrityTest}
              disabled={!selectedProperty || integrityLoading}
              id="run-integrity-test-btn"
            >
              {integrityLoading ? <><Spinner white size="sm" /> Running…</> : <><Shield size={12} /> Run Data Integrity Test</>}
            </button>
            <button
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'center' }}
              onClick={handleValidation}
              disabled={!selectedProperty || validationLoading}
              id="run-spatial-validation-btn"
            >
              {validationLoading ? <><Spinner size="sm" /> Validating…</> : <><CheckSquare size={12} /> Run Spatial Validation</>}
            </button>
            {(integrityResult?.issues?.length > 0 || validationResult?.hasConflicts) && (
              <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'center', color: 'var(--amber-700)' }} onClick={handleViewIssues} id="view-issues-btn">
                <Eye size={12} /> View Issues
              </button>
            )}
            <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'center' }} onClick={() => navigate('/government/reports')} id="gen-report-from-gis-btn">
              Generate Report →
            </button>
          </div>
        </div>

        {/* MAP */}
        <div className="gis-map-area">
          <Government3DMapContainer
            selectedProperty={selectedProperty}
            activeLayers={activeLayers}
            selectedConflict={selectedConflict}
            onPropertySelected={(p) => dispatch({ type: 'SET_PROPERTY', payload: p })}
          />

          {/* Validation overlay */}
          {validationResult && (
            <div style={{
              position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)',
              background: validationResult.hasConflicts ? 'var(--red-600)' : 'var(--green-600)',
              color: '#fff', padding: '0.4rem 1rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600,
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}>
              {validationResult.hasConflicts
                ? `⚠ ${validationResult.conflicts.length} Conflict(s) Detected`
                : '✓ No Spatial Conflicts'}
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="gis-right-panel">
          {/* Validation results */}
          <div className="panel-section">
            <div className="panel-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Spatial Validation
              {validationLoading && <Spinner size="sm" />}
            </div>
            {validationResult ? (
              <div>
                {validationResult.checks.map(check => (
                  <div key={check.name} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      background: check.status === 'pass' ? 'var(--green-600)' : check.status === 'warning' ? 'var(--amber-500)' : 'var(--red-600)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem', fontWeight: 700,
                    }}>
                      {check.status === 'pass' ? '✓' : check.status === 'warning' ? '!' : '✕'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--neutral-800)' }}>{check.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--neutral-500)', lineHeight: 1.4 }}>{check.detail}</div>
                    </div>
                  </div>
                ))}

                {validationResult.hasConflicts && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--neutral-400)', marginBottom: '0.5rem' }}>Conflicts</div>
                    {validationResult.conflicts.map((c, i) => (
                      <div
                        key={i}
                        className="conflict-card"
                        onClick={() => dispatch({ type: 'SET_SELECTED_CONFLICT', payload: c })}
                        style={{ cursor: 'pointer', border: selectedConflict === c ? '1px solid var(--red-400)' : '' }}
                      >
                        <div className="conflict-card-title">{c.type}</div>
                        <div className="conflict-card-desc">{c.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--neutral-400)', fontSize: '0.75rem', padding: '0.75rem 0' }}>
                Select a property and run spatial validation.
              </div>
            )}
          </div>

          {/* Infrastructure analysis */}
          <div className="panel-scroll">
            <div className="panel-section">
              <div className="panel-section-title">Urban Planning / Infrastructure</div>
              <InfrastructureAnalysis />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
