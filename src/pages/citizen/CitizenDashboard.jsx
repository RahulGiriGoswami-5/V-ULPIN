import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CitizenNavbar, TopGovStrip } from '../../components/layout';
import { useAuth, useApp } from '../../context/AppContext';
import { ArrowRight, Building2, Search, Layers, Shield, Lock, CheckCircle } from 'lucide-react';

const WORKFLOW_STEPS = [
  { label: 'Find Property',    path: '/citizen/search' },
  { label: '3D Identification',path: '/citizen/property' },
  { label: 'Generate V-ULPIN', path: '/citizen/generate' },
  { label: 'Secure & Encrypt', path: '/citizen/secure' },
];

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { selectedProperty, selectedFloor, selectedUnit, generatedVULPIN, encryptedVULPIN } = useApp();
  const navigate = useNavigate();

  const getStepStatus = (idx) => {
    if (idx === 0) return selectedProperty ? 'complete' : 'active';
    if (idx === 1) return selectedProperty && selectedFloor && selectedUnit ? 'complete' : selectedProperty ? 'active' : 'pending';
    if (idx === 2) return generatedVULPIN ? 'complete' : (selectedProperty && selectedUnit) ? 'active' : 'pending';
    if (idx === 3) return encryptedVULPIN ? 'complete' : generatedVULPIN ? 'active' : 'pending';
    return 'pending';
  };

  const getNextAction = () => {
    if (!selectedProperty) return { label: 'Find My Property', path: '/citizen/search', color: 'btn-saffron' };
    if (!selectedFloor || !selectedUnit) return { label: '3D Property Identification', path: '/citizen/property', color: 'btn-saffron' };
    if (!generatedVULPIN) return { label: 'Generate V-ULPIN', path: '/citizen/generate', color: 'btn-saffron' };
    if (!encryptedVULPIN) return { label: 'Secure & Encrypt V-ULPIN', path: '/citizen/secure', color: 'btn-saffron' };
    return { label: 'V-ULPIN Transfer Ready', path: '/citizen/secure', color: 'btn-success' };
  };

  const nextAction = getNextAction();

  return (
    <div className="page">
      <TopGovStrip />
      <CitizenNavbar />

      <div style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        {/* Welcome */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy-900)' }}>
            Welcome, {user?.name || 'Citizen'}
          </h1>
          <p style={{ color: 'var(--neutral-500)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Complete the steps below to generate your V-ULPIN — India's 3D Vertical Property Identity.
          </p>
        </div>

        {/* Workflow progress */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--neutral-700)' }}>Your Progress</h3>
          </div>
          <div className="card-body">
            <div className="workflow-steps">
              {WORKFLOW_STEPS.map((step, idx) => {
                const status = getStepStatus(idx);
                return (
                  <React.Fragment key={step.path}>
                    <div className="workflow-step" onClick={() => navigate(step.path)} style={{ cursor: 'pointer' }}>
                      <div className={`workflow-step-dot ${status}`}>
                        {status === 'complete' ? <CheckCircle size={14} /> : idx + 1}
                      </div>
                      <span className={`workflow-step-label ${status}`}>{step.label}</span>
                    </div>
                    {idx < WORKFLOW_STEPS.length - 1 && <div className="workflow-arrow">›</div>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current state summary */}
        <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <div className="stat-icon" style={{ background: 'var(--neutral-100)', color: 'var(--navy-700)' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '0.25rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected Property</div>
                  {selectedProperty ? (
                    <>
                      <div style={{ fontWeight: 600, color: 'var(--navy-900)', fontSize: '0.875rem' }}>{selectedProperty.location}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginTop: '0.2rem' }}>{selectedProperty.oldULPIN}</div>
                      {selectedFloor && selectedUnit && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--green-600)', fontWeight: 500, marginTop: '0.2rem' }}>
                          {selectedFloor.name} · Unit {selectedUnit}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ color: 'var(--neutral-400)', fontSize: '0.875rem' }}>No property selected</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <div className="stat-icon" style={{ background: generatedVULPIN ? 'var(--green-100)' : 'var(--neutral-100)', color: generatedVULPIN ? 'var(--green-600)' : 'var(--neutral-500)' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '0.25rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>V-ULPIN Status</div>
                  {generatedVULPIN ? (
                    <>
                      <div style={{ fontWeight: 600, color: 'var(--green-700)', fontSize: '0.875rem' }}>Generated</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--neutral-500)', fontFamily: 'monospace', marginTop: '0.2rem', wordBreak: 'break-all' }}>{generatedVULPIN.slice(0, 28)}…</div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--neutral-400)', fontSize: '0.875rem' }}>Not yet generated</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next action CTA */}
        <div style={{
          background: encryptedVULPIN ? 'var(--green-50)' : 'var(--navy-900)',
          border: `1px solid ${encryptedVULPIN ? 'var(--green-200)' : 'transparent'}`,
          borderRadius: 12, padding: '1.75rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: encryptedVULPIN ? 'var(--green-700)' : 'rgba(255,255,255,0.5)', marginBottom: '0.375rem' }}>
              {encryptedVULPIN ? 'Completed' : 'Next Action'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: encryptedVULPIN ? 'var(--green-800)' : '#fff' }}>
              {nextAction.label}
            </div>
            {encryptedVULPIN && (
              <div style={{ fontSize: '0.8rem', color: 'var(--green-700)', marginTop: '0.25rem' }}>
                Your V-ULPIN is encrypted and ready for transfer to the Government portal.
              </div>
            )}
          </div>
          <button
            className={`btn btn-lg ${nextAction.color}`}
            onClick={() => navigate(nextAction.path)}
            id="dashboard-next-action-btn"
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {nextAction.label} <ArrowRight size={16} />
          </button>
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginTop: '1.5rem' }}>
          {[
            { icon: Search, label: 'Find Property', path: '/citizen/search' },
            { icon: Layers, label: '3D Identify', path: '/citizen/property' },
            { icon: Shield, label: 'Generate V-ULPIN', path: '/citizen/generate' },
            { icon: Lock, label: 'Secure & Encrypt', path: '/citizen/secure' },
          ].map(item => (
            <button
              key={item.path}
              className="card"
              style={{ padding: '1rem', cursor: 'pointer', border: '1px solid var(--neutral-200)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: '#fff', transition: 'all 0.2s' }}
              onClick={() => navigate(item.path)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--navy-600)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--neutral-200)'; e.currentTarget.style.boxShadow = ''; }}
            >
              <item.icon size={20} color="var(--navy-700)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--neutral-700)' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
