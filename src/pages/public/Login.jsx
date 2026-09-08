import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AppContext';
import { TopGovStrip } from '../../components/layout';
import { Spinner } from '../../components/common';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

function LoginForm({ role, title, subtitle, credentials }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) { setError('Please enter username and password.'); return; }
    setLoading(true);
    // Simulate network delay for realism
    await new Promise(r => setTimeout(r, 800));
    const result = login(username, password);
    setLoading(false);
    if (result.success) {
      navigate(role === 'citizen' ? '/citizen/dashboard' : '/government/dashboard');
    } else {
      setError(result.error);
    }
  };

  const fillDemo = () => {
    setUsername(credentials.username);
    setPassword(credentials.password);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem', fontWeight: 800, fontSize: '1rem', color: 'var(--saffron-400)' }}>
            VU
          </div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className="login-body">
          <div className="login-demo-hint">
            <strong>Demo Access</strong><br />
            Username: <strong>{credentials.username}</strong> &nbsp;|&nbsp; Password: <strong>{credentials.password}</strong><br />
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: '0.5rem', width: '100%' }}
              onClick={fillDemo}
              id="fill-demo-btn"
              type="button"
            >
              Auto-fill Demo Credentials
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-control form-control-lg"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={`Enter username`}
                autoComplete="username"
                id={`${role}-username`}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-control form-control-lg"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  id={`${role}-password`}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)', padding: 0 }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div style={{ color: 'var(--red-600)', fontSize: '0.875rem', background: 'var(--red-50)', border: '1px solid var(--red-100)', borderRadius: 6, padding: '0.625rem 0.875rem' }}>{error}</div>}

            <button
              className={`btn btn-xl w-full ${role === 'citizen' ? 'btn-saffron' : 'btn-primary'}`}
              type="submit"
              disabled={loading}
              id={`${role}-login-btn`}
            >
              {loading ? <><Spinner white size="sm" /> Verifying...</> : 'Sign In'}
            </button>
          </form>

          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export function CitizenLogin() {
  return (
    <LoginForm
      role="citizen"
      title="Citizen Portal Login"
      subtitle="V-ULPIN · Bhu-Aadhaar 3D System"
      credentials={{ username: 'demo.citizen', password: 'citizen123' }}
    />
  );
}

export function GovernmentLogin() {
  return (
    <LoginForm
      role="government"
      title="Government Portal Login"
      subtitle="Authorised Personnel Only"
      credentials={{ username: 'demo.gov', password: 'gov123' }}
    />
  );
}
