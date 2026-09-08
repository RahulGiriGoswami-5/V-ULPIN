import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CitizenNavbar, TopGovStrip } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { propertyService } from '../../services';
import { Spinner, StatusBadge, WorkflowStepper } from '../../components/common';
import { Search, MapPin, ChevronRight, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

export default function PropertySearch() {
  const [query, setQuery] = useState('');
  const [parcelId, setParcelId] = useState('');
  const [surveyNum, setSurveyNum] = useState('');
  const [status, setStatus] = useState('idle'); // idle | searching | found | not-found | error
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('ulpin');

  const { selectedProperty, dispatch, notify } = useApp();
  const navigate = useNavigate();

  const doSearch = async (searchFn, label) => {
    setStatus('searching');
    setResult(null);
    await new Promise(r => setTimeout(r, 600));
    const found = searchFn();
    if (found) {
      setResult(found);
      setStatus('found');
    } else {
      setStatus('not-found');
    }
  };

  const handleULPINSearch = () => {
    if (!query.trim()) { notify('Please enter an Old ULPIN.', 'warning'); return; }
    doSearch(() => propertyService.getPropertyByULPIN(query), 'ULPIN');
  };

  const handleParcelSearch = () => {
    if (!parcelId.trim()) { notify('Please enter a Parcel ID.', 'warning'); return; }
    doSearch(() => propertyService.searchByParcelId(parcelId), 'Parcel');
  };

  const handleSurveySearch = () => {
    if (!surveyNum.trim()) { notify('Please enter a Survey Number.', 'warning'); return; }
    doSearch(() => propertyService.searchBySurveyNumber(surveyNum), 'Survey');
  };

  const handleSelectProperty = () => {
    dispatch({ type: 'SET_PROPERTY', payload: result });
    notify(`Property found: ${result.location}`, 'success', 'Property Selected');
    navigate('/citizen/property');
  };

  const handleKeyDown = (e, fn) => {
    if (e.key === 'Enter') fn();
  };

  const SAMPLE_ULPINS = ['UP-2024-001-KA-BNG', 'MH-2023-042-PUN-PMC', 'DL-2024-017-NDZ-DDA', 'TN-2022-088-CHN-CMC', 'RJ-2023-055-JPR-JDA'];

  return (
    <div className="page">
      <TopGovStrip />
      <CitizenNavbar />
      <WorkflowStepper />

      <div style={{ flex: 1, maxWidth: 760, margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy-900)' }}>Find My Property</h1>
          <p style={{ color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
            Enter your Old ULPIN, Parcel ID or Survey Number to locate your property.
          </p>
        </div>

        {/* Currently Selected Property Resume Card (if exists) */}
        {selectedProperty && (
          <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--saffron-200)', background: 'var(--saffron-50)' }}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, background: 'var(--saffron-500)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--saffron-800)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Currently Active Property
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.95rem' }}>
                    {selectedProperty.location}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--neutral-600)', marginTop: '0.15rem' }}>
                    {selectedProperty.oldULPIN} · {selectedProperty.parcelId} · {selectedProperty.building?.name}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-saffron"
                onClick={() => navigate('/citizen/property')}
                id="resume-property-btn"
              >
                Continue to 3D Identification <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Search Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          {/* Tabs */}
          <div className="tab-list" style={{ padding: '0 1.25rem', borderBottom: '1px solid var(--neutral-200)' }}>
            {[
              { id: 'ulpin', label: 'Old ULPIN' },
              { id: 'parcel', label: 'Parcel ID' },
              { id: 'survey', label: 'Survey Number' },
            ].map(t => (
              <button key={t.id} className={`tab-item ${activeTab === t.id ? 'active' : ''}`} onClick={() => { setActiveTab(t.id); setStatus('idle'); setResult(null); }}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="card-body">
            {activeTab === 'ulpin' && (
              <div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label">Old ULPIN (Bhu-Aadhaar / Traditional ULPIN)</label>
                  <div className="search-box">
                    <input
                      id="ulpin-search-input"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => handleKeyDown(e, handleULPINSearch)}
                      placeholder="e.g. UP-2024-001-KA-BNG"
                    />
                    <button className="search-box-btn" onClick={handleULPINSearch} id="ulpin-search-btn" disabled={status === 'searching'}>
                      {status === 'searching' ? <Spinner white size="sm" /> : <Search size={15} />}
                      {status === 'searching' ? 'Searching…' : 'Search'}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                  <strong>Try these demo ULPINs:</strong>{' '}
                  {SAMPLE_ULPINS.map((u, i) => (
                    <React.Fragment key={u}>
                      <button
                        style={{ background: 'none', border: 'none', color: 'var(--navy-600)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.75rem', padding: 0 }}
                        onClick={() => setQuery(u)}
                      >{u}</button>
                      {i < SAMPLE_ULPINS.length - 1 && ', '}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'parcel' && (
              <div className="form-group">
                <label className="form-label">Parcel ID</label>
                <div className="search-box">
                  <input
                    id="parcel-search-input"
                    value={parcelId}
                    onChange={e => setParcelId(e.target.value)}
                    onKeyDown={e => handleKeyDown(e, handleParcelSearch)}
                    placeholder="e.g. KA-BNG-PRC-4421"
                  />
                  <button className="search-box-btn" onClick={handleParcelSearch} disabled={status === 'searching'}>
                    {status === 'searching' ? <Spinner white size="sm" /> : <Search size={15} />}
                    {status === 'searching' ? 'Searching…' : 'Search'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'survey' && (
              <div className="form-group">
                <label className="form-label">Survey Number</label>
                <div className="search-box">
                  <input
                    id="survey-search-input"
                    value={surveyNum}
                    onChange={e => setSurveyNum(e.target.value)}
                    onKeyDown={e => handleKeyDown(e, handleSurveySearch)}
                    placeholder="e.g. Survey 142/A"
                  />
                  <button className="search-box-btn" onClick={handleSurveySearch} disabled={status === 'searching'}>
                    {status === 'searching' ? <Spinner white size="sm" /> : <Search size={15} />}
                    {status === 'searching' ? 'Searching…' : 'Search'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Searching state */}
        {status === 'searching' && (
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontWeight: 500, color: 'var(--neutral-700)' }}>Searching land records…</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', marginTop: '0.25rem' }}>Querying cadastral database</div>
            </div>
          </div>
        )}

        {/* Not found */}
        {status === 'not-found' && (
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <div className="state-icon state-icon-amber" style={{ margin: '0 auto 1rem' }}><AlertCircle size={28} /></div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--neutral-900)' }}>Property Not Found</div>
              <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                No land record matched your query. Please verify your ULPIN/Parcel ID and try again.
              </p>
            </div>
          </div>
        )}

        {/* Property Found */}
        {status === 'found' && result && (
          <div className="card" style={{ border: '1px solid var(--green-200)' }}>
            <div className="card-header" style={{ background: 'var(--green-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} color="var(--green-600)" />
                <span style={{ fontWeight: 600, color: 'var(--green-700)' }}>Property Found</span>
              </div>
              <StatusBadge status={result.mappingStatus} />
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 40, height: 40, background: 'var(--navy-900)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={18} color="var(--saffron-400)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy-900)' }}>{result.location}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginTop: '0.2rem' }}>{result.parcelId} · {result.surveyNumber}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  ['Old ULPIN', result.oldULPIN],
                  ['Parcel ID', result.parcelId],
                  ['Survey Number', result.surveyNumber],
                  ['Property Type', result.propertyType],
                  ['Land Area', result.landArea],
                  ['Building', result.building?.name],
                  ['Total Floors', result.building?.floors?.length],
                  ['Total Units', result.building?.totalUnits],
                  ['Elevation', `${result.coordinates?.elevation}m ASL`],
                  ['State / District', `${result.state}, ${result.district}`],
                ].map(([label, val]) => (
                  <div className="info-row" key={label} style={{ padding: '0.4rem 0', borderBottom: '1px solid var(--neutral-100)' }}>
                    <span className="info-label">{label}</span>
                    <span className="info-value" style={{ fontFamily: label === 'Old ULPIN' || label === 'Parcel ID' ? 'monospace' : 'inherit', fontSize: '0.8rem' }}>{val}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <StatusBadge status={result.ownershipStatus} />
              </div>
            </div>
            <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-saffron btn-lg" onClick={handleSelectProperty} id="select-property-btn">
                Select Property & Identify in 3D <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
