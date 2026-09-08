import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CitizenNavbar, TopGovStrip } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { vulpinService } from '../../services';
import { EmptyState, Spinner } from '../../components/common';
import { Shield, CheckCircle, Copy, ArrowRight, AlertCircle, Building2 } from 'lucide-react';

const STEPS = [
  'Validating old ULPIN',
  'Locating property in cadastral database',
  'Processing spatial coordinates',
  'Mapping vertical structure',
  'Generating V-ULPIN identifier',
  'Verification complete',
];

export default function VULPINGeneration() {
  const { selectedProperty, selectedFloor, selectedUnit, generatedVULPIN, dispatch, notify } = useApp();
  const navigate = useNavigate();
  const [genStatus, setGenStatus] = useState('idle'); // idle | generating | done
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);

  if (!selectedProperty || !selectedFloor || !selectedUnit) {
    return (
      <div className="page">
        <TopGovStrip />
        <CitizenNavbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState
            icon={AlertCircle}
            title="Property Not Identified"
            description="Please select a property, floor, and unit before generating V-ULPIN."
            action={<button className="btn btn-saffron" onClick={() => navigate('/citizen/property')}>Go to 3D Identification</button>}
          />
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    setGenStatus('generating');
    setCurrentStep(0);
    setCompletedSteps([]);

    for (let i = 0; i < STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, 600 + Math.random() * 300));
      setCompletedSteps(prev => [...prev, i]);
    }

    const vulpin = vulpinService.generateVULPIN(selectedProperty, selectedFloor, selectedUnit);
    dispatch({ type: 'SET_VULPIN', payload: vulpin });
    setGenStatus('done');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedVULPIN).then(() => {
      notify('V-ULPIN copied to clipboard.', 'success', 'Copied');
    }).catch(() => {
      notify('Copy failed — please copy manually.', 'error');
    });
  };

  const getStepStatus = (idx) => {
    if (completedSteps.includes(idx)) return 'done';
    if (currentStep === idx) return 'active';
    return 'pending';
  };

  return (
    <div className="page">
      <TopGovStrip />
      <CitizenNavbar />

      <div style={{ flex: 1, maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy-900)' }}>Generate V-ULPIN</h1>
          <p style={{ color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
            Generate your 3D Vertical Property Identity from the selected property, floor, and unit.
          </p>
        </div>

        {/* Selection summary */}
        <div className="card" style={{ marginBottom: '1.25rem', background: 'var(--navy-900)' }}>
          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              ['Property', selectedProperty.location.split(',')[0]],
              ['Floor', selectedFloor.name],
              ['Unit', `Unit ${selectedUnit}`],
            ].map(([label, val]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{label}</div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Old ULPIN */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-body">
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '0.375rem', fontWeight: 500 }}>Old ULPIN (Input)</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 600, color: 'var(--neutral-900)', background: 'var(--neutral-50)', padding: '0.625rem 0.875rem', borderRadius: 6, border: '1px solid var(--neutral-200)' }}>
              {selectedProperty.oldULPIN}
            </div>
          </div>
        </div>

        {/* Generate button */}
        {genStatus === 'idle' && !generatedVULPIN && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ marginBottom: '1.25rem', color: 'var(--neutral-500)', fontSize: '0.875rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
              The system will validate your property information, map the vertical structure, and generate a unique V-ULPIN.
            </div>
            <button className="btn btn-saffron btn-xl" onClick={handleGenerate} id="generate-vulpin-btn">
              <Shield size={18} /> Generate V-ULPIN
            </button>
          </div>
        )}

        {/* Processing */}
        {genStatus === 'generating' && (
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="card-header">
              <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>Processing…</span>
              <Spinner />
            </div>
            <div className="card-body">
              <div className="step-flow">
                {STEPS.map((step, idx) => {
                  const status = getStepStatus(idx);
                  return (
                    <div className={`step-item ${status}`} key={step}>
                      <div className={`step-dot ${status}`}>
                        {status === 'done' ? <CheckCircle size={12} /> : idx + 1}
                      </div>
                      <span className={`step-label ${status}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {(genStatus === 'done' || (genStatus === 'idle' && generatedVULPIN)) && generatedVULPIN && (
          <>
            <div className="card" style={{ marginBottom: '1.25rem', border: '1px solid var(--green-200)' }}>
              <div className="card-header" style={{ background: 'var(--green-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={18} color="var(--green-600)" />
                  <span style={{ fontWeight: 700, color: 'var(--green-700)', fontSize: '1rem' }}>V-ULPIN Generated Successfully</span>
                </div>
                <span className="badge badge-green">Verified</span>
              </div>
              <div className="card-body">
                <div className="vulpin-display">
                  <div className="vulpin-label">V-ULPIN — 3D Vertical Property Identity</div>
                  <div className="vulpin-code" id="generated-vulpin-display">{generatedVULPIN}</div>
                  <div className="vulpin-meta">
                    Generated: {new Date().toLocaleString('en-IN')} &nbsp;·&nbsp;
                    {selectedProperty.oldULPIN} &nbsp;·&nbsp; {selectedFloor.name} › Unit {selectedUnit}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1.25rem' }}>
                  {[
                    ['Old ULPIN', selectedProperty.oldULPIN],
                    ['Parcel ID', selectedProperty.parcelId],
                    ['Building', selectedProperty.building?.name],
                    ['Floor', selectedFloor.name],
                    ['Unit', `Unit ${selectedUnit}`],
                    ['Location', selectedProperty.location.split(',').slice(0, 2).join(',')],
                  ].map(([label, val]) => (
                    <div className="info-row" key={label} style={{ padding: '0.375rem 0', borderBottom: '1px solid var(--neutral-100)' }}>
                      <span className="info-label">{label}</span>
                      <span className="info-value" style={{ fontSize: '0.8rem' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-footer" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={handleCopy} id="copy-vulpin-btn">
                  <Copy size={14} /> Copy V-ULPIN
                </button>
                <button className="btn btn-outline" onClick={handleGenerate} id="regenerate-vulpin-btn">
                  Re-generate
                </button>
                <button className="btn btn-saffron" onClick={() => navigate('/citizen/secure')} id="proceed-secure-btn">
                  Secure & Encrypt <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
