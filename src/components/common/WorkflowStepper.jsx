import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CheckCircle, MapPin } from 'lucide-react';

export const WORKFLOW_STEPS = [
  { id: 'identify', num: 1, label: '3D Identification', path: '/citizen/property' },
  { id: 'generate', num: 2, label: 'Generate V-ULPIN',  path: '/citizen/generate' },
  { id: 'secure',   num: 3, label: 'Secure & Encrypt',   path: '/citizen/secure' },
];

export function WorkflowStepper({ currentStepId }) {
  const { selectedProperty, selectedFloor, selectedUnit, generatedVULPIN, encryptedVULPIN, notify } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active step from prop or location
  const activeId = currentStepId || (
    location.pathname === '/citizen/property' ? 'identify' :
    location.pathname === '/citizen/generate' ? 'generate' :
    location.pathname === '/citizen/secure'   ? 'secure' :
    null
  );

  const isStepComplete = (stepId) => {
    if (stepId === 'identify') return !!(selectedProperty && selectedFloor && selectedUnit);
    if (stepId === 'generate') return !!generatedVULPIN;
    if (stepId === 'secure')   return !!encryptedVULPIN;
    return false;
  };

  const isStepUnlocked = (stepId) => {
    if (stepId === 'identify') return true; // Always unlocked as entry point
    if (stepId === 'generate') return !!(selectedProperty && selectedFloor && selectedUnit);
    if (stepId === 'secure')   return !!generatedVULPIN;
    return false;
  };

  const handleStepClick = (step) => {
    if (step.id === activeId) return;

    if (isStepComplete(step.id) || isStepUnlocked(step.id)) {
      navigate(step.path);
      return;
    }

    // Friendly validation feedback
    if (step.id === 'generate') {
      notify('Please select your property, floor, and unit in 3D first.', 'warning', 'Step Locked');
      navigate('/citizen/property');
    } else if (step.id === 'secure') {
      notify('Please generate your V-ULPIN first.', 'warning', 'Step Locked');
      if (selectedProperty && selectedFloor && selectedUnit) {
        navigate('/citizen/generate');
      } else {
        navigate('/citizen/property');
      }
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--neutral-200)',
      padding: '0.625rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      zIndex: 15,
    }}>
      {/* Property Context Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: 'var(--navy-900)',
          fontWeight: 600,
          background: 'var(--neutral-100)',
          padding: '0.25rem 0.65rem',
          borderRadius: 6,
        }}>
          <MapPin size={13} color="var(--saffron-500)" />
          <span>{selectedProperty ? selectedProperty.location.split(',')[0] : 'No Property Selected'}</span>
        </div>
        {selectedProperty && (
          <button
            onClick={() => navigate('/citizen/search')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--navy-600)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0 0.25rem',
            }}
            title="Change property in search"
          >
            Change
          </button>
        )}
      </div>

      {/* Workflow Stepper Indicator */}
      <div className="workflow-steps" style={{ margin: 0, gap: '0.75rem' }}>
        {WORKFLOW_STEPS.map((step, idx) => {
          const isComplete = isStepComplete(step.id);
          const isActive = activeId === step.id;
          const status = isComplete ? 'complete' : isActive ? 'active' : 'pending';
          const isUnlocked = isStepUnlocked(step.id) || isComplete;

          return (
            <React.Fragment key={step.id}>
              <div
                className="workflow-step"
                onClick={() => handleStepClick(step)}
                style={{
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  opacity: isUnlocked || isActive ? 1 : 0.6,
                  transition: 'opacity 0.2s',
                }}
                title={isUnlocked ? `Go to ${step.label}` : `${step.label} (locked until prior steps complete)`}
                id={`stepper-step-${step.id}`}
              >
                <div className={`workflow-step-dot ${status}`}>
                  {isComplete ? <CheckCircle size={13} /> : step.num}
                </div>
                <span className={`workflow-step-label ${status}`}>
                  {step.label}
                </span>
              </div>
              {idx < WORKFLOW_STEPS.length - 1 && (
                <div className="workflow-arrow" style={{ opacity: 0.4 }}>›</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default WorkflowStepper;
