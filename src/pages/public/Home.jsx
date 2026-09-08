import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopGovStrip } from '../../components/layout';
import { 
  Shield, 
  ArrowRight, 
  Building2, 
  Layers, 
  Target, 
  ShieldCheck, 
  MapPin 
} from 'lucide-react';
import StaggerFeatures from '../../components/ui/stagger-features';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <TopGovStrip />

      {/* Redesigned Hero Section */}
      <section className="home-hero-v2">
        {/* Top Hero Navigation - Brand & Login Access Only */}
        <header className="hero-navbar">
          <div className="hero-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <svg width="34" height="28" viewBox="0 0 38 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 2L16 28L21 28L9 2H4Z" fill="#F97316" />
              <path d="M34 2L22 28L17 28L29 2H34Z" fill="#FDBA74" />
              <path d="M16 28L19 21L22 28H16Z" fill="#EA580C" />
            </svg>
            <span className="hero-logo-text">V-ULPIN</span>
          </div>

          <div className="hero-nav-actions">
            <button 
              className="hero-nav-btn hero-nav-btn-citizen" 
              onClick={() => navigate('/citizen/login')}
              id="hero-nav-citizen-login-btn"
            >
              <Building2 size={15} />
              Citizen Login
            </button>
            <button 
              className="hero-nav-btn hero-nav-btn-gov" 
              onClick={() => navigate('/government/login')}
              id="hero-nav-gov-login-btn"
            >
              <Shield size={15} />
              Government Login
            </button>
          </div>
        </header>

        {/* Hero Main Body Grid */}
        <div className="hero-main-container">
          {/* Left Vertical Features */}
          <div className="hero-left-features">
            <div className="hero-feature-item">
              <div className="hero-feature-icon-box">
                <Layers size={22} strokeWidth={2.2} />
              </div>
              <div className="hero-feature-text">
                <span className="hero-feature-heading">2D → 3D</span>
                <span className="hero-feature-sub">Mapping</span>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="hero-feature-icon-box">
                <Target size={22} strokeWidth={2.2} />
              </div>
              <div className="hero-feature-text">
                <span className="hero-feature-heading">Precise</span>
                <span className="hero-feature-sub">Identification</span>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="hero-feature-icon-box">
                <ShieldCheck size={22} strokeWidth={2.2} />
              </div>
              <div className="hero-feature-text">
                <span className="hero-feature-heading">Secure</span>
                <span className="hero-feature-sub">& Transparent</span>
              </div>
            </div>
          </div>

          {/* Center Content: Eyebrow, Title, Subtitle, Portal Cards */}
          <div className="hero-center-content">
            <div className="hero-eyebrow-pill">
              <MapPin size={13} className="hero-eyebrow-pill-icon" />
              <span>ULPIN / Bhu-Aadhaar 3D — National Land Identity System</span>
            </div>

            <h1 className="hero-title">
              India's First<br />
              <span className="hero-title-highlight">3D Vertical Property</span><br />
              Identity System
            </h1>

            <p className="hero-description">
              V-ULPIN converts your traditional 2D land record into a secure,
              spatially accurate 3D vertical property identity — from parcel
              to building to floor to unit.
            </p>

            <div className="hero-portal-cards">
              <div 
                className="hero-portal-card hero-portal-card-citizen" 
                onClick={() => navigate('/citizen/login')} 
                id="citizen-portal-btn"
              >
                <div className="hero-portal-card-icon hero-portal-card-icon-citizen">
                  <Building2 size={24} />
                </div>
                <h3>Citizen Portal</h3>
                <p>Find your property, identify your floor & unit, generate your V-ULPIN</p>
                <div className="hero-portal-card-action action-citizen">
                  Enter Portal <ArrowRight size={13} />
                </div>
              </div>

              <div 
                className="hero-portal-card hero-portal-card-gov" 
                onClick={() => navigate('/government/login')} 
                id="govt-portal-btn"
              >
                <div className="hero-portal-card-icon hero-portal-card-icon-gov">
                  <Shield size={24} />
                </div>
                <h3>Government Portal</h3>
                <p>Land intelligence dashboard, GIS validation & property analysis</p>
                <div className="hero-portal-card-action action-gov">
                  Official Access <ArrowRight size={13} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Floating Building Marker */}
          <div className="hero-building-pin-wrapper">
            <div className="hero-building-badge">
              <div className="hero-building-badge-box">
                <div className="hero-badge-icon">
                  <Building2 size={20} />
                </div>
                <div className="hero-badge-content">
                  <span className="hero-badge-title">V-ULPIN</span>
                  <span className="hero-badge-code">UK-HLD-001234</span>
                </div>
              </div>
              <div className="hero-badge-pin-stem"></div>
              <div className="hero-badge-pin-dot"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Staggered Features Section */}
      <StaggerFeatures />

      {/* Workflow strip */}
      <section style={{ background: 'var(--navy-900)', padding: '2.5rem 1.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.25rem' }}>Citizen Workflow</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['Old ULPIN', 'Find Property', '3D Identification', 'Select Floor & Unit', 'Generate V-ULPIN', 'Encrypt', 'Transfer'].map((step, i, arr) => (
              <React.Fragment key={step}>
                <div style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 6, padding: '0.4rem 0.875rem', color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.8rem', fontWeight: 500,
                }}>{step}</div>
                {i < arr.length - 1 && <ArrowRight size={14} color="rgba(255,255,255,0.3)" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--neutral-900)', color: 'var(--neutral-400)', padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
        <div>
          © 2024 Government of India · Department of Land Resources · V-ULPIN System (SIH Prototype)
        </div>
        <div style={{ marginTop: '0.375rem', color: 'var(--neutral-600)' }}>
          This is a demonstration prototype. Not for production use.
        </div>
      </footer>
    </div>
  );
}
