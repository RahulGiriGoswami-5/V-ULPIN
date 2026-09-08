import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CitizenNavbar, TopGovStrip } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { vulpinService } from '../../services';
import { EmptyState, Spinner, WorkflowStepper } from '../../components/common';
import { Lock, Copy, CheckCircle, ArrowRight, Shield, AlertCircle, Eye, EyeOff, Send, Key, LayoutDashboard } from 'lucide-react';

export default function SecureVULPIN() {
  const { selectedProperty, selectedFloor, selectedUnit, generatedVULPIN, encryptedVULPIN, dispatch, notify } = useApp();
  const navigate = useNavigate();
  const [encryptStatus, setEncryptStatus] = useState(encryptedVULPIN ? 'done' : 'idle'); // idle | encrypting | done
  const [activeTab, setActiveTab] = useState(encryptedVULPIN ? 'encrypt' : 'view');
  const [showRaw, setShowRaw] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  if (!generatedVULPIN) {
    return (
      <div className="page">
        <TopGovStrip />
        <CitizenNavbar />
        <WorkflowStepper currentStepId="secure" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <EmptyState
            icon={AlertCircle}
            title="V-ULPIN Not Generated"
            description="Please identify your property and generate your V-ULPIN first."
            action={<button className="btn btn-saffron" onClick={() => navigate('/citizen/generate')}>Generate V-ULPIN</button>}
          />
        </div>
      </div>
    );
  }

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      notify(`${field} copied to clipboard.`, 'success', 'Copied');
      setTimeout(() => setCopiedField(''), 2000);
    } catch {
      notify('Copy failed — please copy manually.', 'error');
    }
  };

  const handleEncrypt = async () => {
    setEncryptStatus('encrypting');
    await new Promise(r => setTimeout(r, 900));
    const encrypted = vulpinService.encryptVULPIN(generatedVULPIN);
    dispatch({ type: 'SET_ENCRYPTED_VULPIN', payload: encrypted });
    setEncryptStatus('done');
    setActiveTab('encrypt');
    notify('V-ULPIN secured and encrypted successfully.', 'success', 'Secured & Encrypted');
  };

  return (
    <div className="page">
      <TopGovStrip />
      <CitizenNavbar />
      <WorkflowStepper currentStepId="secure" />

      <div style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy-900)' }}>Secure V-ULPIN</h1>
          <p style={{ color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
            View, copy, encrypt and prepare your V-ULPIN for secure transfer to the Government portal.
          </p>
        </div>

        {/* Tabs */}
        <div className="tab-list card" style={{ borderRadius: '8px 8px 0 0', paddingLeft: '0.75rem', borderBottom: 'none' }}>
          {[
            { id: 'view', label: 'View V-ULPIN', icon: Eye },
            { id: 'encrypt', label: 'Encrypt', icon: Lock },
            { id: 'transfer', label: 'Prepare Transfer', icon: Send },
          ].map(t => (
            <button key={t.id} className={`tab-item ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        <div className="card" style={{ borderRadius: '0 8px 8px 8px', marginTop: 0 }}>
          {/* VIEW TAB */}
          {activeTab === 'view' && (
            <div className="card-body">
              <div className="vulpin-display" style={{ marginBottom: '1.25rem' }}>
                <div className="vulpin-label">Your V-ULPIN</div>
                <div className="vulpin-code" id="secure-vulpin-display">{generatedVULPIN}</div>
                <div className="vulpin-meta">
                  {selectedProperty?.location} · {selectedFloor?.name} · Unit {selectedUnit}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-outline flex-1" onClick={() => copyToClipboard(generatedVULPIN, 'V-ULPIN')} id="copy-vulpin-view-btn">
                  {copiedField === 'V-ULPIN' ? <CheckCircle size={14} color="var(--green-600)" /> : <Copy size={14} />}
                  {copiedField === 'V-ULPIN' ? 'Copied!' : 'Copy V-ULPIN'}
                </button>
                <button className="btn btn-saffron flex-1" onClick={() => setActiveTab('encrypt')} id="go-encrypt-btn">
                  <Lock size={14} /> Encrypt V-ULPIN
                </button>
              </div>

              {/* Property summary */}
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--neutral-50)', borderRadius: 8, border: '1px solid var(--neutral-200)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Property Summary</div>
                {[
                  ['Old ULPIN', selectedProperty.oldULPIN],
                  ['Parcel ID', selectedProperty.parcelId],
                  ['Location', selectedProperty.location],
                  ['Building', selectedProperty.building?.name],
                  ['Floor', selectedFloor?.name],
                  ['Unit', selectedUnit],
                ].map(([label, val]) => (
                  <div className="info-row" key={label} style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--neutral-100)' }}>
                    <span className="info-label">{label}</span>
                    <span className="info-value" style={{ fontSize: '0.8rem' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ENCRYPT TAB */}
          {activeTab === 'encrypt' && (
            <div className="card-body">
              {/* Disclaimer */}
              <div style={{ background: 'var(--amber-50)', border: '1px solid var(--amber-100)', borderRadius: 8, padding: '0.875rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--amber-700)' }}>
                <strong>Note:</strong> This is a frontend demonstration of the encryption flow. The production encryption algorithm (AES-256 / RSA) will be integrated by the cryptography team. The current implementation simulates the encryption process for prototype purposes.
              </div>

              {/* Original */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Original V-ULPIN</div>
                <div style={{ fontFamily: 'monospace', background: 'var(--neutral-50)', border: '1px solid var(--neutral-200)', borderRadius: 6, padding: '0.75rem 1rem', fontSize: '0.875rem', wordBreak: 'break-all', color: 'var(--navy-900)' }}>
                  {generatedVULPIN}
                </div>
              </div>

              {/* Encrypt button */}
              {encryptStatus === 'idle' && !encryptedVULPIN && (
                <button className="btn btn-primary btn-lg w-full" onClick={handleEncrypt} id="encrypt-vulpin-btn">
                  <Key size={16} /> Encrypt V-ULPIN
                </button>
              )}

              {encryptStatus === 'encrypting' && (
                <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <Spinner size="lg" />
                  <div style={{ marginTop: '0.875rem', fontWeight: 500, color: 'var(--neutral-700)' }}>Encrypting V-ULPIN…</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', marginTop: '0.25rem' }}>Applying encryption layer</div>
                </div>
              )}

              {(encryptStatus === 'done' || encryptedVULPIN) && encryptedVULPIN && (
                <>
                  <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} color="var(--green-600)" />
                    <span style={{ fontWeight: 600, color: 'var(--green-700)', fontSize: '0.875rem' }}>V-ULPIN Encrypted Successfully</span>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Encrypted V-ULPIN</div>
                      <button className="btn btn-ghost btn-sm" onClick={() => setShowRaw(v => !v)}>
                        {showRaw ? <EyeOff size={12} /> : <Eye size={12} />} {showRaw ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="encrypted-display" id="encrypted-vulpin-display">
                      {showRaw ? (
                        <div className="encrypted-code">{encryptedVULPIN}</div>
                      ) : (
                        <div className="encrypted-code">{'•'.repeat(Math.min(encryptedVULPIN.length, 60))}…</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-outline flex-1" onClick={() => copyToClipboard(encryptedVULPIN, 'Encrypted V-ULPIN')} id="copy-encrypted-btn">
                      {copiedField === 'Encrypted V-ULPIN' ? <CheckCircle size={14} color="var(--green-600)" /> : <Copy size={14} />}
                      {copiedField === 'Encrypted V-ULPIN' ? 'Copied!' : 'Copy Encrypted Data'}
                    </button>
                    <button className="btn btn-saffron flex-1" onClick={() => setActiveTab('transfer')} id="go-transfer-btn">
                      <Send size={14} /> Prepare Transfer
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TRANSFER TAB */}
          {activeTab === 'transfer' && (
            <div className="card-body">
              {!encryptedVULPIN ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <AlertCircle size={32} color="var(--amber-600)" style={{ margin: '0 auto 1rem' }} />
                  <div style={{ fontWeight: 600, color: 'var(--neutral-700)' }}>Encrypt First</div>
                  <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem', margin: '0.5rem 0 1rem' }}>
                    Please encrypt your V-ULPIN before preparing it for transfer.
                  </p>
                  <button className="btn btn-primary" onClick={() => setActiveTab('encrypt')}>Go to Encrypt</button>
                </div>
              ) : (
                <>
                  <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 10, padding: '1.25rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                    <CheckCircle size={32} color="var(--green-600)" style={{ margin: '0 auto 0.75rem' }} />
                    <div style={{ fontWeight: 700, color: 'var(--green-800)', fontSize: '1.05rem' }}>Transfer Ready</div>
                    <p style={{ color: 'var(--green-700)', fontSize: '0.8rem', marginTop: '0.375rem' }}>
                      Your encrypted V-ULPIN is ready to be submitted to the Government portal.
                    </p>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Transfer Packet</div>
                    {[
                      ['V-ULPIN (Encrypted)', encryptedVULPIN.slice(0, 30) + '…'],
                      ['Transfer Format', 'ENC::Base64 (V-ULPIN Envelope v1)'],
                      ['Source', selectedProperty.oldULPIN],
                      ['Timestamp', new Date().toLocaleString('en-IN')],
                      ['Status', 'Ready for Government Submission'],
                    ].map(([label, val]) => (
                      <div className="info-row" key={label} style={{ padding: '0.4rem 0', borderBottom: '1px solid var(--neutral-100)' }}>
                        <span className="info-label">{label}</span>
                        <span className="info-value" style={{ fontSize: '0.8rem', fontFamily: label.includes('Encrypted') ? 'monospace' : 'inherit' }}>{val}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-outline flex-1" onClick={() => copyToClipboard(encryptedVULPIN, 'Transfer Data')} id="copy-transfer-btn">
                      <Copy size={14} /> Copy Transfer Data
                    </button>
                    <button 
                      className="btn btn-success flex-1" 
                      id="transfer-complete-btn" 
                      onClick={() => {
                        dispatch({ type: 'SET_ENCRYPTED_VULPIN', payload: encryptedVULPIN });
                        notify('Transfer packet verified and submitted successfully.', 'success', 'Submitted');
                        navigate('/citizen/dashboard');
                      }}
                    >
                      <CheckCircle size={14} /> Mark as Submitted & Finish
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
