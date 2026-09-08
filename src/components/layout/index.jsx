import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, FileText, Search, CheckSquare,
  HelpCircle, LogOut, User, Menu, X, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AppContext';

// ── Top Government Strip ─────────────────────────────────────
export function TopGovStrip() {
  const [fontSize, setFontSize] = useState(16);
  const applyFontSize = (size) => {
    setFontSize(size);
    document.documentElement.style.fontSize = `${size}px`;
  };

  return (
    <div className="gov-strip">
      <div className="gov-strip-inner">
        <div className="gov-strip-left">
          <div>
            <span className="gov-name">भारत सरकार | Government of India</span>
            <span className="gov-strip-divider"> &nbsp;|&nbsp; </span>
            <span className="gov-dept">Department of Land Resources, Ministry of Rural Development</span>
          </div>
        </div>
        <div className="gov-strip-right">
          <a href="#" onClick={(e) => e.preventDefault()}>हिंदी</a>
          <span className="gov-strip-divider">|</span>
          <a href="#" onClick={(e) => e.preventDefault()}>English</a>
          <span className="gov-strip-divider">|</span>
          <a href="#" onClick={(e) => e.preventDefault()}>Accessibility</a>
          <span className="gov-strip-divider">|</span>
          <div className="font-size-controls">
            <button className="font-size-btn" onClick={() => applyFontSize(14)}>A−</button>
            <button className="font-size-btn" onClick={() => applyFontSize(16)}>A</button>
            <button className="font-size-btn" onClick={() => applyFontSize(18)}>A+</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Government Main Navbar ────────────────────────────────────
const govNavItems = [
  { label: 'Dashboard',   icon: LayoutDashboard, path: '/government/dashboard' },
  { label: '3D GIS',      icon: Map,             path: '/government/gis' },
  { label: 'Land Records',icon: FileText,         path: '/government/records' },
  { label: 'ULPIN Search',icon: Search,           path: '/government/search' },
  { label: 'Validation',  icon: CheckSquare,      path: '/government/validation' },
  { label: 'Help',        icon: HelpCircle,       path: '/government/help' },
];

export function GovernmentNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="main-navbar">
      <div className="main-navbar-inner">
        {/* Brand */}
        <div className="navbar-brand" onClick={() => navigate('/government/dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-logo">VU</div>
          <div className="brand-text">
            <div className="brand-name">V-ULPIN</div>
            <div className="brand-sub">Bhu-Aadhaar 3D</div>
          </div>
        </div>

        {/* Desktop nav links */}
        <nav className="nav-links">
          {govNavItems.map(item => (
            <button
              key={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <div className="user-chip">
            <div className="user-avatar">{user?.name?.charAt(0) || 'G'}</div>
            <span className="text-sm" style={{ color: 'var(--neutral-700)' }}>{user?.name || 'Govt. User'}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout">
            <LogOut size={15} /> Logout
          </button>
          {/* Mobile menu toggle */}
          <button className="btn btn-ghost btn-icon" style={{ display: 'none' }} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Citizen Navbar ────────────────────────────────────────────
const citizenNavItems = [
  { label: 'Dashboard',        path: '/citizen/dashboard' },
  { label: 'Find Property',    path: '/citizen/search' },
  { label: '3D Identification',path: '/citizen/property' },
  { label: 'Generate V-ULPIN', path: '/citizen/generate' },
  { label: 'Secure & Encrypt', path: '/citizen/secure' },
];

export function CitizenNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="citizen-navbar main-navbar" style={{ background: 'var(--navy-800)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="main-navbar-inner">
        <div className="navbar-brand" onClick={() => navigate('/citizen/dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-logo" style={{ background: 'var(--saffron-500)' }}>VU</div>
          <div className="brand-text">
            <div className="brand-name" style={{ color: '#fff' }}>V-ULPIN</div>
            <div className="brand-sub" style={{ color: 'rgba(255,255,255,0.4)' }}>Citizen Portal</div>
          </div>
        </div>

        <nav className="nav-links">
          {citizenNavItems.map(item => (
            <button
              key={item.path}
              className={`citizen-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <div className="user-chip" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="user-avatar" style={{ background: 'var(--saffron-500)' }}>{user?.name?.charAt(0) || 'C'}</div>
            <span className="text-sm text-white">{user?.name || 'Citizen'}</span>
          </div>
          <button className="btn btn-outline-white btn-sm" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page Header component ─────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div className="page-header-inner">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-3 items-center">{actions}</div>}
      </div>
    </div>
  );
}
