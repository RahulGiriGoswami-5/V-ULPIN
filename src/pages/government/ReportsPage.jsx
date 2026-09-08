import React, { useState, useRef } from 'react';
import { GovernmentNavbar, TopGovStrip, PageHeader } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { propertyService, reportService, integrityService, vulpinService } from '../../services';
import { Spinner } from '../../components/common';
import { FileText, Download, Printer, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function ReportView({ report, onPrint, onDownload }) {
  const { property, floor, unit, vULPIN, integrityResult, validationResult, generatedAt, reportId } = report;

  return (
    <div className="report-container" id="report-content">
      {/* Header */}
      <div className="report-header-block">
        <div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>GOVERNMENT OF INDIA · DEPARTMENT OF LAND RESOURCES</div>
          <div className="report-header-title">V-ULPIN Property Intelligence Report</div>
          <div className="report-header-sub">Report ID: {reportId}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="report-stamp">OFFICIAL</div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.375rem' }}>
            {new Date(generatedAt).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="report-body">
        {/* Property Identity */}
        <div className="report-section">
          <div className="report-section-title">Property Identity</div>
          <div className="report-grid">
            {[
              ['V-ULPIN', vULPIN],
              ['Old ULPIN', property.oldULPIN],
              ['Parcel ID', property.parcelId],
              ['Survey Number', property.surveyNumber],
              ['Property Type', property.propertyType],
              ['Land Area', property.landArea],
            ].map(([label, val]) => (
              <div className="report-field" key={label}>
                <div className="report-field-label">{label}</div>
                <div className="report-field-value" style={{ fontFamily: label.includes('ULPIN') || label.includes('ID') ? 'monospace' : 'inherit', fontSize: '0.8rem' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Location & Building */}
        <div className="report-section">
          <div className="report-section-title">Location & Building Details</div>
          <div className="report-grid">
            {[
              ['Location', property.location],
              ['State', property.state],
              ['District', property.district],
              ['Building', property.building?.name],
              ['Floor', floor?.name || 'N/A'],
              ['Unit', unit || 'N/A'],
              ['Elevation', `${property.coordinates?.elevation}m ASL`],
              ['Owner', property.ownerName],
            ].map(([label, val]) => (
              <div className="report-field" key={label}>
                <div className="report-field-label">{label}</div>
                <div className="report-field-value" style={{ fontSize: '0.8rem' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Integrity */}
        {integrityResult && (
          <div className="report-section">
            <div className="report-section-title">Data Integrity</div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: integrityResult.status === 'verified' ? 'var(--green-600)' : integrityResult.status === 'attention' ? 'var(--amber-600)' : 'var(--red-600)' }}>
                  {integrityResult.overall}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Overall Score (/ 100)</div>
              </div>
              <div style={{ flex: 1 }}>
                {Object.entries(integrityResult.breakdown).map(([key, val]) => {
                  const labels = { spatialAccuracy: 'Spatial Accuracy', ownershipMatch: 'Ownership Match', recordCompleteness: 'Record Completeness', crossValidation: 'Cross Validation' };
                  const barColor = val >= 90 ? 'var(--green-600)' : val >= 70 ? 'var(--amber-600)' : 'var(--red-600)';
                  return (
                    <div key={key} style={{ marginBottom: '0.375rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.15rem' }}>
                        <span style={{ color: 'var(--neutral-600)' }}>{labels[key]}</span>
                        <span style={{ fontWeight: 700, color: barColor }}>{val}%</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--neutral-100)', borderRadius: 100 }}>
                        <div style={{ height: '100%', width: `${val}%`, background: barColor, borderRadius: 100 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Validation */}
        {validationResult && (
          <div className="report-section">
            <div className="report-section-title">Spatial Validation</div>
            <div style={{ marginBottom: '0.625rem' }}>
              {validationResult.hasConflicts ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'var(--red-100)', color: 'var(--red-700)', padding: '0.3rem 0.75rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}>
                  <AlertTriangle size={12} /> {validationResult.conflicts.length} Conflict(s) Detected
                </div>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'var(--green-100)', color: 'var(--green-700)', padding: '0.3rem 0.75rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}>
                  <CheckCircle size={12} /> No Spatial Conflicts Found
                </div>
              )}
            </div>
            {validationResult.hasConflicts && validationResult.conflicts.map((c, i) => (
              <div key={i} style={{ padding: '0.5rem 0.75rem', background: c.severity === 'critical' ? 'var(--red-50)' : 'var(--amber-50)', borderLeft: `3px solid ${c.severity === 'critical' ? 'var(--red-600)' : 'var(--amber-600)'}`, marginBottom: '0.375rem', borderRadius: '0 4px 4px 0', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 700, color: c.severity === 'critical' ? 'var(--red-700)' : 'var(--amber-700)', marginBottom: '0.15rem' }}>{c.type} <span className={`badge ${c.severity === 'critical' ? 'badge-red' : 'badge-amber'}`}>{c.severity}</span></div>
                <div style={{ color: 'var(--neutral-600)' }}>{c.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* Infrastructure */}
        <div className="report-section">
          <div className="report-section-title">Infrastructure</div>
          <div className="report-grid">
            {Object.entries(property.infrastructure || {}).map(([key, val]) => (
              <div className="report-field" key={key}>
                <div className="report-field-label" style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className="report-field-value" style={{ fontSize: '0.8rem' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification status */}
        <div style={{ marginTop: '1.5rem', padding: '0.875rem 1rem', background: 'var(--neutral-50)', border: '1px solid var(--neutral-200)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--neutral-500)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Report generated by V-ULPIN System · Department of Land Resources, GoI</span>
          <span style={{ fontFamily: 'monospace' }}>{reportId}</span>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { selectedProperty, selectedFloor, selectedUnit, integrityResult, validationResult, dispatch, notify } = useApp();
  const [selectedPropId, setSelectedPropId] = useState(selectedProperty?.id || '');
  const [reportStatus, setReportStatus] = useState('idle'); // idle | generating | done
  const [report, setReport] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  const allProps = propertyService.getAll();
  const currentProp = selectedProperty || allProps.find(p => p.id === selectedPropId);

  const handlePropChange = (e) => {
    const prop = allProps.find(p => p.id === e.target.value);
    setSelectedPropId(e.target.value);
    if (prop) dispatch({ type: 'SET_PROPERTY', payload: prop });
    setReport(null);
    setReportStatus('idle');
  };

  const handleGenerate = async () => {
    if (!currentProp) { notify('Select a property first.', 'warning'); return; }
    setReportStatus('generating');
    await new Promise(r => setTimeout(r, 1200));

    // Auto-run integrity test if not done
    let intResult = integrityResult;
    if (!intResult) intResult = integrityService.runIntegrityTest(currentProp);

    const vulpin = selectedFloor && selectedUnit
      ? vulpinService.generateVULPIN(currentProp, selectedFloor, selectedUnit)
      : vulpinService.generateVULPIN(currentProp, currentProp.building.floors[1], currentProp.building.floors[1].units[0]);

    const rep = reportService.generateReport(currentProp, selectedFloor || currentProp.building.floors[1], selectedUnit || currentProp.building.floors[1].units[0], intResult, validationResult);
    rep.vULPIN = vulpin;
    setReport(rep);
    setReportStatus('done');
    notify('Report generated successfully.', 'success', 'Report Ready');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById('report-content');
    if (!element) { notify('Report not available.', 'error'); return; }
    setDownloading(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`VULPIN-Report-${report?.reportId || 'export'}.pdf`);
      notify('Report downloaded successfully.', 'success', 'Download Complete');
    } catch (err) {
      notify('PDF generation failed. Use Print instead.', 'error');
    }
    setDownloading(false);
  };

  return (
    <div className="page">
      <TopGovStrip />
      <GovernmentNavbar />
      <PageHeader
        title="Government Reports"
        subtitle="Generate and download property intelligence reports"
        actions={
          <select className="form-control" style={{ minWidth: 260, fontSize: '0.875rem' }} value={selectedPropId} onChange={handlePropChange} id="report-prop-select">
            <option value="">Select Property…</option>
            {allProps.map(p => <option key={p.id} value={p.id}>{p.oldULPIN} — {p.location.split(',')[0]}</option>)}
          </select>
        }
      />

      <div className="page-content">
        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
          <button
            className="btn btn-saffron"
            onClick={handleGenerate}
            disabled={reportStatus === 'generating' || !currentProp}
            id="generate-report-btn"
          >
            {reportStatus === 'generating' ? <><Spinner white size="sm" /> Generating…</> : <><FileText size={15} /> Generate Report</>}
          </button>
          {report && (
            <>
              <button className="btn btn-outline" onClick={handlePrint} id="print-report-btn">
                <Printer size={15} /> Print Report
              </button>
              <button className="btn btn-primary" onClick={handleDownload} disabled={downloading} id="download-report-btn">
                {downloading ? <><Spinner white size="sm" /> Downloading…</> : <><Download size={15} /> Download PDF</>}
              </button>
            </>
          )}
        </div>

        {reportStatus === 'idle' && !report && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 12, border: '1px solid var(--neutral-200)' }}>
            <FileText size={40} color="var(--neutral-300)" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <div style={{ fontWeight: 600, color: 'var(--neutral-700)' }}>
              {currentProp ? 'Click "Generate Report" to create a property report' : 'Select a property to generate a report'}
            </div>
            <p style={{ color: 'var(--neutral-400)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Reports include property details, integrity score, spatial validation results and infrastructure data.
            </p>
          </div>
        )}

        {report && (
          <div ref={reportRef} className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
            <ReportView report={report} onPrint={handlePrint} onDownload={handleDownload} />
          </div>
        )}
      </div>
    </div>
  );
}
