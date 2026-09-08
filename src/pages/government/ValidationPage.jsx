import React, { useState } from 'react';
import { GovernmentNavbar, TopGovStrip, PageHeader } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { integrityService, propertyService } from '../../services';
import { IntegrityScore } from '../../components/government/IntegrityScore';
import { PropertyInfoPanel } from '../../components/government/PropertyInfoPanel';
import { InfrastructureAnalysis } from '../../components/government/InfrastructureAnalysis';
import { Spinner } from '../../components/common';
import { Shield, CheckSquare, Eye, RefreshCw, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

export default function ValidationPage() {
  const { selectedProperty, integrityResult, validationResult, selectedConflict, dispatch, notify } = useApp();
  const [integrityLoading, setIntegrityLoading] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [selectedPropId, setSelectedPropId] = useState(selectedProperty?.id || '');

  const allProps = propertyService.getAll();

  const handlePropChange = (e) => {
    const prop = allProps.find(p => p.id === e.target.value);
    setSelectedPropId(e.target.value);
    if (prop) {
      dispatch({ type: 'SET_PROPERTY', payload: prop });
      dispatch({ type: 'SET_INTEGRITY_RESULT', payload: null });
      dispatch({ type: 'SET_VALIDATION_RESULT', payload: null });
    }
  };

  const handleIntegrityTest = async () => {
    if (!selectedProperty) return;
    setIntegrityLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    const result = integrityService.runIntegrityTest(selectedProperty);
    dispatch({ type: 'SET_INTEGRITY_RESULT', payload: result });
    setIntegrityLoading(false);
    notify(`Integrity Score: ${result.overall}/100`, result.status === 'verified' ? 'success' : result.status === 'attention' ? 'warning' : 'error', 'Test Complete');
  };

  const handleValidation = async () => {
    if (!selectedProperty) return;
    setValidationLoading(true);
    await new Promise(r => setTimeout(r, 1900));
    const result = integrityService.runSpatialValidation(selectedProperty);
    dispatch({ type: 'SET_VALIDATION_RESULT', payload: result });
    setValidationLoading(false);
    notify(result.hasConflicts ? `${result.conflicts.length} conflict(s) detected` : 'No conflicts found', result.hasConflicts ? 'warning' : 'success', 'Validation Complete');
  };

  return (
    <div className="page">
      <TopGovStrip />
      <GovernmentNavbar />
      <PageHeader
        title="Validation & Urban Planning"
        subtitle="Data integrity testing, spatial validation and infrastructure conflict analysis"
        actions={
          <select className="form-control" style={{ minWidth: 240, fontSize: '0.875rem' }} value={selectedPropId} onChange={handlePropChange} id="validation-prop-select">
            <option value="">Select Property…</option>
            {allProps.map(p => <option key={p.id} value={p.id}>{p.oldULPIN} — {p.location.split(',')[0]}</option>)}
          </select>
        }
      />

      <div className="page-content">
        {!selectedProperty ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 12, border: '1px solid var(--neutral-200)' }}>
            <Shield size={40} color="var(--neutral-300)" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <div style={{ fontWeight: 600, color: 'var(--neutral-700)' }}>Select a property to begin validation</div>
            <p style={{ color: 'var(--neutral-400)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Use the dropdown above or search a property in the ULPIN Search page.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: '1rem' }}>
            {/* Data Integrity */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={16} color="var(--navy-700)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)' }}>Data Integrity Test</span>
                </div>
                {integrityResult && (
                  <span className={`badge ${integrityResult.status === 'verified' ? 'badge-green' : integrityResult.status === 'attention' ? 'badge-amber' : 'badge-red'}`}>
                    {integrityResult.overall}/100
                  </span>
                )}
              </div>
              <div className="card-body">
                {integrityLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Spinner size="lg" />
                    <div style={{ marginTop: '0.875rem', fontWeight: 500, color: 'var(--neutral-600)' }}>Running Data Integrity Test…</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', marginTop: '0.25rem' }}>Analysing spatial, ownership, and record data</div>
                  </div>
                ) : integrityResult ? (
                  <IntegrityScore result={integrityResult} />
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Shield size={32} color="var(--neutral-200)" style={{ margin: '0 auto 0.875rem', display: 'block' }} />
                    <p style={{ color: 'var(--neutral-400)', fontSize: '0.875rem' }}>Click "Run Test" to calculate the data integrity score for this property.</p>
                  </div>
                )}
              </div>
              <div className="card-footer" style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-primary btn-sm flex-1"
                  style={{ justifyContent: 'center' }}
                  onClick={handleIntegrityTest}
                  disabled={integrityLoading}
                  id="run-integrity-validation-btn"
                >
                  {integrityLoading ? <Spinner white size="sm" /> : <Shield size={13} />}
                  {integrityResult ? 'Re-run Test' : 'Run Data Integrity Test'}
                </button>
                {integrityResult?.issues?.length > 0 && (
                  <button className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }} onClick={() => dispatch({ type: 'SET_SELECTED_CONFLICT', payload: validationResult?.conflicts?.[0] })} id="view-integrity-issues-btn">
                    <Eye size={13} /> View Issues
                  </button>
                )}
              </div>
            </div>

            {/* Spatial Validation */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckSquare size={16} color="var(--navy-700)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)' }}>Spatial Validation</span>
                </div>
                {validationResult && (
                  <span className={`badge ${validationResult.hasConflicts ? 'badge-red' : 'badge-green'}`}>
                    {validationResult.hasConflicts ? `${validationResult.conflicts.length} Conflict(s)` : 'No Conflicts'}
                  </span>
                )}
              </div>
              <div className="card-body">
                {validationLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Spinner size="lg" />
                    <div style={{ marginTop: '0.875rem', fontWeight: 500, color: 'var(--neutral-600)' }}>Running Spatial Validation…</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', marginTop: '0.25rem' }}>Checking boundaries, overlaps, elevation…</div>
                  </div>
                ) : validationResult ? (
                  <div>
                    {/* Check results */}
                    <div style={{ marginBottom: '0.875rem' }}>
                      {validationResult.checks.map(check => (
                        <div key={check.name} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', marginBottom: '0.625rem' }}>
                          <div style={{
                            width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                            background: check.status === 'pass' ? 'var(--green-600)' : check.status === 'warning' ? 'var(--amber-500)' : 'var(--red-600)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                          }}>
                            {check.status === 'pass' ? '✓' : check.status === 'warning' ? '!' : '✕'}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--neutral-800)' }}>{check.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', lineHeight: 1.4 }}>{check.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Conflicts */}
                    {validationResult.hasConflicts && (
                      <>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Detected Conflicts</div>
                        {validationResult.conflicts.map((c, i) => (
                          <div key={i} className={c.severity === 'critical' ? 'conflict-card' : 'warning-card'} style={{ cursor: 'pointer' }} onClick={() => dispatch({ type: 'SET_SELECTED_CONFLICT', payload: c })} id={`conflict-${i}-btn`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                              <AlertTriangle size={12} color={c.severity === 'critical' ? 'var(--red-600)' : 'var(--amber-600)'} />
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: c.severity === 'critical' ? 'var(--red-700)' : 'var(--amber-700)' }}>{c.type}</span>
                              <span className={`badge ${c.severity === 'critical' ? 'badge-red' : 'badge-amber'}`} style={{ marginLeft: 'auto' }}>{c.severity}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: c.severity === 'critical' ? 'var(--red-600)' : 'var(--amber-700)', lineHeight: 1.5 }}>{c.description}</div>
                          </div>
                        ))}
                      </>
                    )}

                    {!validationResult.hasConflicts && (
                      <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--green-50)', borderRadius: 8, border: '1px solid var(--green-200)' }}>
                        <CheckCircle size={24} color="var(--green-600)" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                        <div style={{ fontWeight: 600, color: 'var(--green-700)' }}>No Spatial Conflicts Found</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <CheckSquare size={32} color="var(--neutral-200)" style={{ margin: '0 auto 0.875rem', display: 'block' }} />
                    <p style={{ color: 'var(--neutral-400)', fontSize: '0.875rem' }}>Click "Run Validation" to check for spatial conflicts.</p>
                  </div>
                )}
              </div>
              <div className="card-footer">
                <button
                  className="btn btn-primary btn-sm flex-1"
                  style={{ justifyContent: 'center' }}
                  onClick={handleValidation}
                  disabled={validationLoading}
                  id="run-spatial-validation-page-btn"
                >
                  {validationLoading ? <Spinner white size="sm" /> : <CheckSquare size={13} />}
                  {validationResult ? 'Re-run Validation' : 'Run Spatial Validation'}
                </button>
              </div>
            </div>

            {/* Right column: Property info + Urban Planning */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card">
                <div className="card-header"><span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Property Details</span></div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  <PropertyInfoPanel compact />
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={14} color="var(--amber-600)" />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Urban Planning Analysis</span>
                  </div>
                </div>
                <div className="card-body">
                  <InfrastructureAnalysis />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
