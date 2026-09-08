import React, { useState } from 'react';
import { GovernmentNavbar, TopGovStrip, PageHeader } from '../../components/layout';
import { propertyService } from '../../services';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common';
import { Search, AlertTriangle, CheckCircle, MapPin, Filter, X } from 'lucide-react';

export default function LandRecordsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterIntegrity, setFilterIntegrity] = useState('');
  const { dispatch, notify } = useApp();

  const allProps = propertyService.getAll();

  const filtered = allProps.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      p.oldULPIN.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.parcelId.toLowerCase().includes(q) ||
      p.ownerName.toLowerCase().includes(q);
    const matchesType = !filterType || p.propertyType === filterType;
    const matchesStatus = !filterStatus || p.ownershipStatus.toLowerCase().includes(filterStatus.toLowerCase());
    const matchesIntegrity = !filterIntegrity ||
      (filterIntegrity === 'high' && p.integrityScore >= 90) ||
      (filterIntegrity === 'medium' && p.integrityScore >= 70 && p.integrityScore < 90) ||
      (filterIntegrity === 'low' && p.integrityScore < 70);
    return matchesSearch && matchesType && matchesStatus && matchesIntegrity;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('');
    setFilterStatus('');
    setFilterIntegrity('');
  };

  const handleSelect = (prop) => {
    dispatch({ type: 'SET_PROPERTY', payload: prop });
    notify(`Property selected: ${prop.location}`, 'success', 'Selected');
  };

  const hasFilters = searchQuery || filterType || filterStatus || filterIntegrity;

  return (
    <div className="page">
      <TopGovStrip />
      <GovernmentNavbar />
      <PageHeader
        title="Land Records"
        subtitle={`${filtered.length} of ${allProps.length} records displayed`}
      />

      <div className="page-content">
        {/* Filters */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-body" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1 1 240px' }}>
              <label className="form-label">Search</label>
              <div className="search-box">
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ULPIN, Location, Parcel, Owner…" id="records-search" />
                <button className="search-box-btn" onClick={() => {}} style={{ cursor: 'default' }}><Search size={14} /></button>
              </div>
            </div>
            <div className="form-group" style={{ flex: '0 0 160px' }}>
              <label className="form-label">Property Type</label>
              <select className="form-control" value={filterType} onChange={e => setFilterType(e.target.value)} id="filter-type">
                <option value="">All Types</option>
                {['Residential', 'Commercial', 'Industrial', 'Mixed-Use'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: '0 0 160px' }}>
              <label className="form-label">Integrity</label>
              <select className="form-control" value={filterIntegrity} onChange={e => setFilterIntegrity(e.target.value)} id="filter-integrity">
                <option value="">All</option>
                <option value="high">High (≥90)</option>
                <option value="medium">Medium (70–89)</option>
                <option value="low">Low (&lt;70)</option>
              </select>
            </div>
            {hasFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters} id="clear-filters-btn" style={{ marginBottom: '0.1rem' }}>
                <X size={13} /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="card">
          {filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <Search size={32} color="var(--neutral-300)" style={{ margin: '0 auto 0.875rem', display: 'block' }} />
              <div style={{ fontWeight: 600, color: 'var(--neutral-600)' }}>No Records Match Your Filters</div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.875rem' }} onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--neutral-50)', borderBottom: '2px solid var(--neutral-200)' }}>
                    {['Old ULPIN', 'Location / State', 'Type', 'Owner', 'Integrity', 'Ownership', 'Mapping', 'Conflicts', ''].map(h => (
                      <th key={h} style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontWeight: 600, color: 'var(--neutral-500)', fontSize: '0.72rem', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(prop => (
                    <tr key={prop.id} style={{ borderBottom: '1px solid var(--neutral-100)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--neutral-50)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--navy-800)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{prop.oldULPIN}</td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <div style={{ fontWeight: 500, color: 'var(--neutral-800)' }}>{prop.location.split(',').slice(0, 2).join(',')}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--neutral-400)' }}>{prop.state}</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}><span className="badge badge-neutral">{prop.propertyType}</span></td>
                      <td style={{ padding: '0.75rem 0.875rem', color: 'var(--neutral-700)', whiteSpace: 'nowrap' }}>{prop.ownerName}</td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <span style={{ fontWeight: 700, color: prop.integrityScore >= 90 ? 'var(--green-600)' : prop.integrityScore >= 70 ? 'var(--amber-600)' : 'var(--red-600)', fontSize: '0.875rem' }}>
                          {prop.integrityScore}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--neutral-400)' }}>/100</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}><StatusBadge status={prop.ownershipStatus} /></td>
                      <td style={{ padding: '0.75rem 0.875rem' }}><StatusBadge status={prop.mappingStatus} /></td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        {prop.conflicts.length > 0
                          ? <span className="badge badge-red"><AlertTriangle size={9} /> {prop.conflicts.length}</span>
                          : <span className="badge badge-green"><CheckCircle size={9} /> None</span>}
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', whiteSpace: 'nowrap' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleSelect(prop)} id={`records-select-${prop.id}-btn`}>
                          <MapPin size={12} /> Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
