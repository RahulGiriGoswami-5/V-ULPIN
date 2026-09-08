import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { vulpinService, propertyService } from '../../services';
import { Spinner } from '../common';
import { Key, CheckCircle, XCircle, Lock, Unlock } from 'lucide-react';

export function DecryptionPanel() {
  const [encryptedInput, setEncryptedInput] = useState('');
  const [decryptStatus, setDecryptStatus] = useState('idle'); // idle | decrypting | success | error
  const [decryptError, setDecryptError] = useState('');
  const [decryptResult, setDecryptResult] = useState(null);
  const { dispatch, notify } = useApp();

  const handleDecrypt = async () => {
    if (!encryptedInput.trim()) {
      notify('Please paste the encrypted V-ULPIN data.', 'warning');
      return;
    }
    setDecryptStatus('decrypting');
    setDecryptError('');
    setDecryptResult(null);

    await new Promise(r => setTimeout(r, 1100));

    const result = vulpinService.decryptVULPIN(encryptedInput.trim());
    if (result.success) {
      setDecryptResult(result.vulpin);
      setDecryptStatus('success');

      // Try to locate property
      const foundProp = propertyService.searchProperty(result.vulpin.split('-').slice(2, 4).join(''))[0]
        || propertyService.getAll().find(p =>
            vulpinService.generateVULPIN(p, p.building.floors[1], p.building.floors[1].units[0]) === result.vulpin ||
            p.oldULPIN.includes(result.vulpin.split('-')[2])
          );

      dispatch({ type: 'SET_DECRYPTED_VULPIN', payload: result.vulpin });
      if (foundProp) {
        dispatch({ type: 'SET_PROPERTY', payload: foundProp });
        notify(`Property located: ${foundProp.location}`, 'success', 'Property Found');
      } else {
        notify(`V-ULPIN decrypted: ${result.vulpin}`, 'success', 'Decryption Successful');
      }
    } else {
      setDecryptStatus('error');
      setDecryptError(result.error);
      notify(result.error, 'error', 'Decryption Failed');
    }
  };

  const handleReset = () => {
    setEncryptedInput('');
    setDecryptStatus('idle');
    setDecryptError('');
    setDecryptResult(null);
  };

  return (
    <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--neutral-100)' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--neutral-500)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <Lock size={11} /> Decrypt V-ULPIN
      </div>

      {decryptStatus === 'idle' || decryptStatus === 'error' ? (
        <>
          <textarea
            style={{
              width: '100%', border: `1px solid ${decryptStatus === 'error' ? 'var(--red-300)' : 'var(--neutral-200)'}`,
              borderRadius: 6, padding: '0.5rem 0.625rem', fontSize: '0.72rem', fontFamily: 'monospace',
              color: 'var(--neutral-900)', resize: 'vertical', minHeight: 70, outline: 'none', lineHeight: 1.5,
            }}
            value={encryptedInput}
            onChange={e => { setEncryptedInput(e.target.value); setDecryptStatus('idle'); setDecryptError(''); }}
            placeholder="Paste encrypted V-ULPIN (ENC::...)"
            id="decrypt-input"
          />
          {decryptStatus === 'error' && (
            <div style={{ fontSize: '0.72rem', color: 'var(--red-600)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <XCircle size={12} /> {decryptError}
            </div>
          )}
          <button
            className="btn btn-primary btn-sm w-full"
            style={{ marginTop: '0.5rem', justifyContent: 'center' }}
            onClick={handleDecrypt}
            disabled={!encryptedInput.trim()}
            id="decrypt-vulpin-btn"
          >
            <Unlock size={12} /> Decrypt V-ULPIN
          </button>
        </>
      ) : decryptStatus === 'decrypting' ? (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <Spinner size="sm" />
          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginTop: '0.5rem' }}>Decrypting…</div>
        </div>
      ) : (
        <>
          <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 6, padding: '0.625rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
              <CheckCircle size={12} color="var(--green-600)" />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--green-700)' }}>Decryption Successful</span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--navy-900)', wordBreak: 'break-all', lineHeight: 1.5 }}>
              {decryptResult}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm w-full" style={{ justifyContent: 'center', fontSize: '0.75rem' }} onClick={handleReset} id="decrypt-reset-btn">
            Decrypt Another
          </button>
        </>
      )}
    </div>
  );
}
