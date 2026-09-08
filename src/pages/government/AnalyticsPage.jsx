import React from 'react';
import { GovernmentNavbar, TopGovStrip, PageHeader } from '../../components/layout';
import { analyticsService } from '../../services';
import { Doughnut, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const CHART_DEFAULTS = {
  plugins: { legend: { labels: { font: { family: 'Inter', size: 11 }, boxWidth: 12 } } },
  maintainAspectRatio: false,
};

export default function AnalyticsPage() {
  const data = analyticsService.getDashboardAnalytics();
  const { stateWise, integrityDistribution, conflictCategories, propertyTypeBreakdown, localStats } = data;

  const verifiedVsPending = {
    labels: ['Verified (≥90)', 'Needs Attention (70–89)', 'Critical (<70)'],
    datasets: [{
      data: integrityDistribution.map(d => d.count),
      backgroundColor: ['#16a34a', '#d97706', '#dc2626'],
      borderWidth: 0,
    }],
  };

  const stateBar = {
    labels: stateWise.map(s => s.state),
    datasets: [
      { label: 'Verified',  data: stateWise.map(s => s.verified),  backgroundColor: '#1a2744', borderRadius: 4 },
      { label: 'Pending',   data: stateWise.map(s => s.pending),   backgroundColor: '#d97706', borderRadius: 4 },
      { label: 'Conflicts', data: stateWise.map(s => s.conflicts), backgroundColor: '#dc2626', borderRadius: 4 },
    ],
  };

  const conflictPie = {
    labels: conflictCategories.map(c => c.category),
    datasets: [{
      data: conflictCategories.map(c => c.count),
      backgroundColor: ['#dc2626', '#d97706', '#7c3aed', '#2563eb', '#059669'],
      borderWidth: 0,
    }],
  };

  const propTypePie = {
    labels: propertyTypeBreakdown.map(p => p.type),
    datasets: [{
      data: propertyTypeBreakdown.map(p => p.count),
      backgroundColor: ['#1a2744', '#e8681a', '#2563eb', '#16a34a', '#adb5bd'],
      borderWidth: 0,
    }],
  };

  const topStats = [
    { label: 'Total Parcels', value: data.totalParcels.toLocaleString('en-IN'), sub: 'Registered land parcels', color: 'var(--navy-800)' },
    { label: 'Verified', value: data.verifiedProperties.toLocaleString('en-IN'), sub: `${Math.round(data.verifiedProperties / data.totalParcels * 100)}% of total`, color: 'var(--green-600)' },
    { label: 'Pending', value: data.pendingProperties.toLocaleString('en-IN'), sub: 'Awaiting 3D mapping', color: 'var(--amber-600)' },
    { label: 'Avg. Integrity Score', value: `${data.averageIntegrityScore}%`, sub: 'Across all records', color: 'var(--saffron-500)' },
    { label: 'Spatial Conflicts', value: data.conflictedProperties.toLocaleString('en-IN'), sub: 'Require attention', color: 'var(--red-600)' },
    { label: 'Active Sessions', value: data.activeSessions, sub: 'Live users', color: 'var(--navy-600)' },
  ];

  return (
    <div className="page">
      <TopGovStrip />
      <GovernmentNavbar />
      <PageHeader title="Analytics Dashboard" subtitle="Land registration statistics derived from the mock dataset" />

      <div className="page-content">
        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {topStats.map(s => (
            <div key={s.label} className="card" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-800)', marginTop: '0.375rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--neutral-400)', marginTop: '0.1rem' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Integrity Distribution</span></div>
            <div className="card-body">
              <div className="chart-container">
                <Doughnut data={verifiedVsPending} options={{ ...CHART_DEFAULTS, cutout: '65%' }} />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight: 600, fontSize: '0.875rem' }}>State-wise Coverage</span></div>
            <div className="card-body">
              <div className="chart-container">
                <Bar data={stateBar} options={{
                  ...CHART_DEFAULTS,
                  scales: {
                    x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11, family: 'Inter' } } },
                    y: { stacked: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11, family: 'Inter' } } },
                  },
                  plugins: { ...CHART_DEFAULTS.plugins, title: { display: false } },
                }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Conflict Categories</span></div>
            <div className="card-body">
              <div className="chart-container">
                <Pie data={conflictPie} options={CHART_DEFAULTS} />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Property Type Breakdown</span></div>
            <div className="card-body">
              <div className="chart-container">
                <Pie data={propTypePie} options={CHART_DEFAULTS} />
              </div>
            </div>
          </div>
        </div>

        {/* State table */}
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="card-header"><span style={{ fontWeight: 600, fontSize: '0.875rem' }}>State-wise Breakdown</span></div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-200)' }}>
                  {['State', 'Total', 'Verified', 'Pending', 'Conflicts', 'Coverage'].map(h => (
                    <th key={h} style={{ padding: '0.625rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--neutral-500)', fontSize: '0.75rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stateWise.map(s => (
                  <tr key={s.state} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                    <td style={{ padding: '0.625rem 1rem', fontWeight: 600, color: 'var(--neutral-800)' }}>{s.state}</td>
                    <td style={{ padding: '0.625rem 1rem' }}>{s.total.toLocaleString()}</td>
                    <td style={{ padding: '0.625rem 1rem', color: 'var(--green-600)', fontWeight: 600 }}>{s.verified.toLocaleString()}</td>
                    <td style={{ padding: '0.625rem 1rem', color: 'var(--amber-600)', fontWeight: 600 }}>{s.pending.toLocaleString()}</td>
                    <td style={{ padding: '0.625rem 1rem', color: 'var(--red-600)', fontWeight: 600 }}>{s.conflicts.toLocaleString()}</td>
                    <td style={{ padding: '0.625rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--neutral-100)', borderRadius: 100 }}>
                          <div style={{ height: '100%', width: `${Math.round(s.verified / s.total * 100)}%`, background: 'var(--green-600)', borderRadius: 100 }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--neutral-600)', minWidth: 30 }}>
                          {Math.round(s.verified / s.total * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
