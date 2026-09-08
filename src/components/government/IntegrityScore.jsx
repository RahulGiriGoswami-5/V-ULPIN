import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export function IntegrityScore({ result, compact = false }) {
  if (!result) return null;

  const { overall, status, breakdown } = result;

  const color = status === 'verified' ? 'var(--green-600)'
    : status === 'attention' ? 'var(--amber-600)'
    : 'var(--red-600)';

  const label = status === 'verified' ? 'Verified'
    : status === 'attention' ? 'Needs Attention'
    : 'Critical';

  const Icon = status === 'verified' ? CheckCircle
    : status === 'attention' ? AlertTriangle
    : Shield;

  // SVG ring
  const r = 45;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (overall / 100) * circumference;

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Ring */}
      <div className="integrity-score-ring">
        <svg width="120" height="120" viewBox="0 0 100 100" className="score-ring-svg">
          <circle className="score-ring-bg" cx="50" cy="50" r={r} />
          <circle
            className={`score-ring-fill score-ring-${status}`}
            cx="50" cy="50" r={r}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ stroke: color }}
          />
        </svg>
        <div className="score-number" style={{ color }}>{overall}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginBottom: '0.875rem' }}>
        <Icon size={14} color={color} />
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color }}>{label}</span>
      </div>

      {/* Breakdown */}
      <div style={{ textAlign: 'left' }}>
        {[
          ['Spatial Accuracy', breakdown.spatialAccuracy],
          ['Ownership Match', breakdown.ownershipMatch],
          ['Record Completeness', breakdown.recordCompleteness],
          ['Cross Validation', breakdown.crossValidation],
        ].map(([name, val]) => {
          const barColor = val >= 90 ? 'var(--green-600)' : val >= 70 ? 'var(--amber-600)' : 'var(--red-600)';
          return (
            <div key={name} style={{ marginBottom: compact ? '0.5rem' : '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--neutral-600)' }}>{name}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: barColor }}>{val}%</span>
              </div>
              <div className="integrity-bar">
                <div className="integrity-bar-fill" style={{ width: `${val}%`, background: barColor }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: '0.65rem', color: 'var(--neutral-400)', marginTop: '0.5rem', textAlign: 'left' }}>
        Last tested: {new Date(result.timestamp).toLocaleString('en-IN')}
      </div>
    </div>
  );
}
