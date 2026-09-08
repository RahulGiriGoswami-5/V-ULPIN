import React, { useState } from 'react';
import { GovernmentNavbar, TopGovStrip, PageHeader } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { propertyService } from '../../services';
import { StatusBadge } from '../../components/common';
import { Search, Building2, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';

export default function ULPINSearch() {
  const [tab, setTab] = useState('vulpin');
  const [inputs, setInputs] = useState({ vulpin: '', ulpin: '', parcel: '', survey: '' });
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const { dispatch, notify } = useApp();

  const doSearch = async (fn) => {
    setStatus('searching');
    setResults([]);
    await new Promise(r => setTimeout(r, 750));
    const found = fn();
    if (found) {
      setResults(Array.isArray(found) ? found : [found]);
      setStatus('found');
    } else {
      setStatus('not-found');
    }
  };

  const SEARCHES = {
    vulpin:  () => propertyService.searchProperty(inputs.vulpin)[0],
    ulpin:   () => propertyService.getPropertyByULPIN(inputs.ulpin),
    parcel:  () => propertyService.searchByParcelId(inputs.parcel),
    survey:  () => propertyService.searchBySurveyNumber(inputs.survey),
  };

  const currentInput = inputs[tab];

  const handleSelect = (prop) => {
    dispatch({ type: 'SET_PROPERTY', payload: prop });
    notify(`Property selected: ${prop.location}`, 'success', 'Property Selected');
  };

  return (
    <div className="page">
      <TopGovStrip />
      <GovernmentNavbar />
      <PageHeader title="ULPIN / V-ULPIN Search" subtitle="Search the land records database by any identifier" />

      <div className="page-content">
        {/* Search tabs */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="tab-list" style={{ padding: '0 1rem', borderBottom: '1px solid var(--neutral-100)' }}>
            {[
              { id: 'vulpin', label: 'V-ULPIN' },
              { id: 'ulpin',  label: 'Old ULPIN' },
              { id: 'parcel', label: 'Parcel ID' },
              { id: 'survey', label: 'Survey No.' },
            ].map(t => (
              <button key={t.id} className={`tab-item ${tab === t.id ? 'active' : ''}`} onClick={() => { setTab(t.id); setStatus('idle'); setResults([]); }}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="card-body">
            <div className="search-box">
              <input
                id="ulpin-search-gov-input"
                value={currentInput}
                onChange={e => setInputs(prev => ({ ...prev, [tab]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && doSearch(SEARCHES[tab])}
                placeholder={
                  tab === 'vulpin' ? 'Enter V-ULPIN (VULPIN-KA-…)' :
                  tab === 'ulpin' ? 'Enter Old ULPIN (e.g. UP-2024-001-KA-BNG)' :
                  tab === 'parcel' ? 'Enter Parcel ID (e.g. KA-BNG-PRC-4421)' :
                  'Enter Survey Number (e.g. Survey 142/A)'
                }
              />
              <button className="search-box-btn" onClick={() => doSearch(SEARCHES[tab])} id="ulpin-search-gov-btn">
                <Search size={15} /> Search
              </button>
            </div>
            {/* Quick samples */}
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
              {tab === 'ulpin' && (
                <span>Try: {['UP-2024-001-KA-BNG', 'MH-2023-042-PUN-PMC', 'TS-2024-063-HYD-GHMC'].map((u, i, a) => (
                  <React.Fragment key={u}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--navy-600)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.75rem', padding: 0 }} onClick={() => setInputs(p => ({ ...p, ulpin: u }))}>{u}</button>
                    {i < a.length - 1 && ', '}
                  </React.Fragment>
                ))}</span>
              )}
            </div>
          </div>
        </div>

        {/* States */}
        {status === 'searching' && (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }} />
            <div style={{ fontWeight: 500, color: 'var(--neutral-600)' }}>Querying land records database…</div>
          </div>
        )}

        {status === 'not-found' && (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <AlertTriangle size={32} color="var(--amber-500)" style={{ margin: '0 auto 0.875rem', display: 'block' }} />
            <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--neutral-900)' }}>Property Not Found</div>
            <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem', marginTop: '0.5rem' }}>No records matched your search. Verify the identifier and try again.</p>
          </div>
        )}

        {status === 'found' && results.length > 0 && (
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginBottom: '0.75rem' }}>{results.length} result(s) found</div>
            {results.map(prop => (
              <div key={prop.id} className="card" style={{ marginBottom: '0.875rem' }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={16} color="var(--navy-700)" />
                    <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{prop.building?.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>·</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>{prop.location}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <StatusBadge status={prop.ownershipStatus} />
                    {prop.conflicts.length > 0 && <span className="badge badge-red"><AlertTriangle size={9} /> {prop.conflicts.length} Conflict</span>}
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {[
                      ['Old ULPIN', prop.oldULPIN],
                      ['Parcel ID', prop.parcelId],
                      ['Survey No.', prop.surveyNumber],
                      ['Type', prop.propertyType],
                      ['Area', prop.landArea],
                      ['Integrity', `${prop.integrityScore}/100`],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--neutral-400)' }}>{label}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--neutral-900)' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => handleSelect(prop)} id={`select-prop-${prop.id}-btn`}>
                    <MapPin size={12} /> Select in GIS
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All properties table */}
        {status === 'idle' && (
          <div className="card">
            <div className="card-header">
              <span style={{ fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.875rem' }}>All Land Records</span>
              <span className="badge badge-neutral">{propertyService.getAll().length} records</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-200)' }}>
                    {['Old ULPIN', 'Location', 'Type', 'Integrity', 'Ownership', 'Conflicts', ''].map(h => (
                      <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontWeight: 600, color: 'var(--neutral-500)', fontSize: '0.75rem', letterSpacing: '0.03em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {propertyService.getAll().map(prop => (
                    <tr key={prop.id} style={{ borderBottom: '1px solid var(--neutral-100)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--neutral-50)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '0.625rem 0.875rem', fontFamily: 'monospace', color: 'var(--navy-800)', fontWeight: 600 }}>{prop.oldULPIN}</td>
                      <td style={{ padding: '0.625rem 0.875rem', color: 'var(--neutral-700)' }}>{prop.location.split(',').slice(0, 2).join(',')}</td>
                      <td style={{ padding: '0.625rem 0.875rem' }}><span className="badge badge-neutral">{prop.propertyType}</span></td>
                      <td style={{ padding: '0.625rem 0.875rem' }}>
                        <span style={{ fontWeight: 700, color: prop.integrityScore >= 90 ? 'var(--green-600)' : prop.integrityScore >= 70 ? 'var(--amber-600)' : 'var(--red-600)' }}>{prop.integrityScore}</span>
                      </td>
                      <td style={{ padding: '0.625rem 0.875rem' }}><StatusBadge status={prop.ownershipStatus} /></td>
                      <td style={{ padding: '0.625rem 0.875rem' }}>
                        {prop.conflicts.length > 0
                          ? <span className="badge badge-red"><AlertTriangle size={9} /> {prop.conflicts.length}</span>
                          : <span className="badge badge-green"><CheckCircle size={9} /> None</span>}
                      </td>
                      <td style={{ padding: '0.625rem 0.875rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleSelect(prop)} id={`table-select-${prop.id}-btn`} style={{ fontSize: '0.75rem' }}>Select</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
