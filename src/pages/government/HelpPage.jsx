import React from 'react';
import { GovernmentNavbar, TopGovStrip, PageHeader } from '../../components/layout';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Shield, CheckSquare, FileText, Building2, Map, HelpCircle, ChevronRight } from 'lucide-react';

const FAQ = [
  { q: 'What is V-ULPIN?', a: 'V-ULPIN (Vertical Unique Land Parcel Identification Number) is an extension of the existing ULPIN / Bhu-Aadhaar system. It adds a 3D vertical dimension — capturing building, floor, and unit — to uniquely identify sub-parcel entities in multi-storey properties.' },
  { q: 'How is a V-ULPIN different from an Old ULPIN?', a: 'The Old ULPIN identifies a land parcel at the ground level (2D). A V-ULPIN identifies a specific floor and unit within that parcel, making it suitable for apartments, commercial complexes, and mixed-use buildings.' },
  { q: 'What is the Data Integrity Score?', a: 'The Data Integrity Score (0–100) measures the quality of a property\'s land record. It is calculated from four components: Spatial Accuracy (30%), Ownership Match (25%), Record Completeness (20%), and Cross Validation (25%). A score above 90 means Verified; 70–89 is Needs Attention; below 70 is Critical.' },
  { q: 'What is Spatial Validation?', a: 'Spatial Validation checks for geographic conflicts in a property\'s data: parcel boundary mismatches, overlap with adjacent parcels, building footprint violations, elevation inconsistencies, and infrastructure corridor conflicts.' },
  { q: 'Is the encryption production-grade?', a: 'The current encryption in this prototype is a demonstration placeholder (Base64 encoding). The production encryption algorithm (AES-256 / RSA) will be integrated by the cryptography team before deployment.' },
  { q: 'How do I decrypt a V-ULPIN received from a citizen?', a: 'In the Government Portal, use the "Decrypt V-ULPIN" panel (available in the GIS dashboard and ULPIN Search page). Paste the encrypted data (beginning with "ENC::") and click Decrypt. The system will extract the V-ULPIN and attempt to locate the property.' },
];

const SHORTCUTS = [
  { label: 'GIS Dashboard', path: '/government/gis', icon: Map },
  { label: 'ULPIN Search', path: '/government/search', icon: Search },
  { label: 'Validation', path: '/government/validation', icon: CheckSquare },
  { label: 'Land Records', path: '/government/records', icon: Building2 },
];

export default function HelpPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = React.useState(null);

  return (
    <div className="page">
      <TopGovStrip />
      <GovernmentNavbar />
      <PageHeader title="Help & Documentation" subtitle="User guide for the V-ULPIN Government Portal" />

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          {/* Main help */}
          <div>
            {/* Quick start */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={16} color="var(--navy-700)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Government Portal Workflow</span>
                </div>
              </div>
              <div className="card-body">
                {[
                  { step: 1, title: 'Receive Encrypted V-ULPIN', desc: 'A citizen submits an encrypted V-ULPIN (ENC:: format) via the citizen portal.' },
                  { step: 2, title: 'Decrypt V-ULPIN', desc: 'Paste the encrypted data into the "Decrypt V-ULPIN" panel in the GIS dashboard or ULPIN Search page.' },
                  { step: 3, title: 'Locate Property on 3D GIS', desc: 'The decryption result automatically locates and selects the property on the 3D GIS map.' },
                  { step: 4, title: 'Run Data Integrity Test', desc: 'Click "Run Data Integrity Test" to calculate the integrity score (spatial accuracy, ownership, completeness, cross-validation).' },
                  { step: 5, title: 'Run Spatial Validation', desc: 'Click "Run Spatial Validation" to detect parcel overlaps, boundary mismatches, and infrastructure conflicts.' },
                  { step: 6, title: 'Perform Infrastructure Analysis', desc: 'Use the Urban Planning section to simulate proposed construction and check against infrastructure corridors.' },
                ].map(item => (
                  <div key={item.step} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, background: 'var(--navy-900)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--saffron-400)', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
                      {item.step}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '0.875rem' }}>{item.title}</div>
                      <div style={{ color: 'var(--neutral-500)', fontSize: '0.8rem', marginTop: '0.2rem', lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HelpCircle size={16} color="var(--navy-700)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Frequently Asked Questions</span>
                </div>
              </div>
              <div className="card-body" style={{ padding: '0' }}>
                {FAQ.map((item, i) => (
                  <div key={i} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{ width: '100%', padding: '1rem 1.25rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      id={`faq-${i}-btn`}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--neutral-800)', fontSize: '0.875rem' }}>{item.q}</span>
                      <ChevronRight size={14} color="var(--neutral-400)" style={{ transform: openFaq === i ? 'rotate(90deg)' : '', transition: '0.2s' }} />
                    </button>
                    {openFaq === i && (
                      <div style={{ padding: '0 1.25rem 1rem', fontSize: '0.875rem', color: 'var(--neutral-600)', lineHeight: 1.65, borderTop: '1px solid var(--neutral-100)', background: 'var(--neutral-50)' }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="card-header"><span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Quick Navigation</span></div>
              <div className="card-body" style={{ padding: '0.75rem' }}>
                {SHORTCUTS.map(s => (
                  <button
                    key={s.path}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.25rem', fontSize: '0.8rem' }}
                    onClick={() => navigate(s.path)}
                    id={`help-nav-${s.label.toLowerCase().replace(/\s/g, '-')}-btn`}
                  >
                    <s.icon size={14} color="var(--navy-700)" /> {s.label}
                    <ChevronRight size={12} style={{ marginLeft: 'auto' }} color="var(--neutral-300)" />
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Demo Credentials</span></div>
              <div className="card-body">
                <div style={{ background: 'var(--neutral-50)', border: '1px solid var(--neutral-200)', borderRadius: 6, padding: '0.75rem', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.375rem' }}>Citizen Portal</div>
                  <div>Username: <code>demo.citizen</code></div>
                  <div>Password: <code>citizen123</code></div>
                </div>
                <div style={{ background: 'var(--neutral-50)', border: '1px solid var(--neutral-200)', borderRadius: 6, padding: '0.75rem', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.375rem' }}>Government Portal</div>
                  <div>Username: <code>demo.gov</code></div>
                  <div>Password: <code>gov123</code></div>
                </div>
                <div style={{ marginTop: '0.875rem', fontSize: '0.75rem', color: 'var(--neutral-400)', background: 'var(--amber-50)', border: '1px solid var(--amber-100)', borderRadius: 6, padding: '0.625rem' }}>
                  This is an SIH prototype. No real land records or PII are used.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
