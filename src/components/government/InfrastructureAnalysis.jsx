import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockInfrastructureZones } from '../../data/mockProperties';
import { AlertTriangle, Zap, Info, ToggleLeft, ToggleRight } from 'lucide-react';

export function InfrastructureAnalysis() {
  const { selectedProperty, dispatch } = useApp();
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulatedConflicts, setSimulatedConflicts] = useState([]);
  const [analysisZone, setAnalysisZone] = useState('');

  const runAnalysis = () => {
    if (!selectedProperty) return;

    // Simulate infrastructure conflict analysis using mock zones
    // Logic: properties with existing conflicts get more infrastructure warnings
    const baseConflicts = selectedProperty.conflicts.filter(c =>
      c.type.includes('Road') || c.type.includes('Pipeline') || c.type.includes('Metro') || c.type.includes('Infrastructure')
    );

    const infraConflicts = mockInfrastructureZones
      .filter((zone, idx) => {
        // Deterministic based on property index so same prop → same conflicts
        const propIdx = parseInt(selectedProperty.id.replace('prop-', ''), 10);
        return (propIdx + idx) % 3 !== 0; // filter some out
      })
      .map(zone => ({
        ...zone,
        distance: `${Math.round(Math.random() * 15 + 1)}m`,
      }));

    setSimulatedConflicts(infraConflicts.length > 0 ? infraConflicts : []);
    setSimulationActive(true);

    dispatch({ type: 'SET_INFRA_ANALYSIS', payload: { active: true, conflicts: infraConflicts } });
  };

  const resetAnalysis = () => {
    setSimulationActive(false);
    setSimulatedConflicts([]);
    setAnalysisZone('');
    dispatch({ type: 'SET_INFRA_ANALYSIS', payload: { active: false, conflicts: [] } });
  };

  const severityColor = (severity) =>
    severity === 'critical' ? 'var(--red-600)' :
    severity === 'warning'  ? 'var(--amber-600)' : 'var(--blue-600)';

  return (
    <div>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--neutral-600)', display: 'block', marginBottom: '0.375rem' }}>
          Proposed Construction Zone
        </label>
        <input
          className="form-control"
          style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
          placeholder="Describe zone (e.g. North-East corner)"
          value={analysisZone}
          onChange={e => setAnalysisZone(e.target.value)}
          id="infra-zone-input"
        />
      </div>

      {!simulationActive ? (
        <button
          className="btn btn-outline btn-sm w-full"
          style={{ justifyContent: 'center', marginBottom: '0.5rem' }}
          onClick={runAnalysis}
          disabled={!selectedProperty}
          id="run-infra-analysis-btn"
        >
          <Zap size={12} /> Analyse Infrastructure Conflicts
        </button>
      ) : (
        <button
          className="btn btn-ghost btn-sm w-full"
          style={{ justifyContent: 'center', marginBottom: '0.5rem', color: 'var(--neutral-500)' }}
          onClick={resetAnalysis}
          id="reset-infra-analysis-btn"
        >
          Reset Analysis
        </button>
      )}

      {simulationActive && (
        <div>
          {simulatedConflicts.length === 0 ? (
            <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 6, padding: '0.625rem', fontSize: '0.75rem', color: 'var(--green-700)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              ✓ No infrastructure conflicts detected for proposed zone.
            </div>
          ) : (
            <>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--neutral-400)', marginBottom: '0.5rem' }}>
                {simulatedConflicts.length} Infrastructure Warning{simulatedConflicts.length !== 1 ? 's' : ''}
              </div>
              {simulatedConflicts.map(zone => (
                <div
                  key={zone.id}
                  style={{
                    border: `1px solid ${zone.severity === 'critical' ? 'var(--red-100)' : zone.severity === 'warning' ? 'var(--amber-100)' : 'var(--blue-50)'}`,
                    background: zone.severity === 'critical' ? 'var(--red-50)' : zone.severity === 'warning' ? 'var(--amber-50)' : 'var(--blue-50)',
                    borderRadius: 6, padding: '0.5rem', marginBottom: '0.375rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                    <AlertTriangle size={12} color={severityColor(zone.severity)} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: severityColor(zone.severity) }}>{zone.type}: {zone.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--neutral-600)', marginTop: '0.15rem' }}>{zone.buffer} · ~{zone.distance} from zone</div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {!selectedProperty && (
        <div style={{ fontSize: '0.72rem', color: 'var(--neutral-400)', textAlign: 'center', padding: '0.5rem 0' }}>
          Select a property to run analysis.
        </div>
      )}
    </div>
  );
}
