import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopGovStrip } from '../../components/layout';
import { Shield, ArrowRight, Building2 } from 'lucide-react';
import StaggerFeatures from '../../components/ui/stagger-features';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <TopGovStrip />

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-eyebrow">
            <Shield size={12} />
            ULPIN / Bhu-Aadhaar 3D — National Land Identity System
          </div>
          <h1>
            India's First<br />
            <span>3D Vertical Property</span><br />
            Identity System
          </h1>
          <p>
            V-ULPIN converts your traditional 2D land record into a secure,
            spatially accurate 3D vertical property identity — from parcel
            to building to floor to unit.
          </p>
          <div className="portal-cards">
            <div className="portal-card" onClick={() => navigate('/citizen/login')} id="citizen-portal-btn">
              <div className="portal-card-icon portal-card-icon-citizen">
                <Building2 size={24} />
              </div>
              <h3>Citizen Portal</h3>
              <p>Find your property, identify your floor & unit, generate your V-ULPIN</p>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: 'var(--saffron-400)', fontSize: '0.8rem', fontWeight: 500 }}>
                Enter Portal <ArrowRight size={12} />
              </div>
            </div>
            <div className="portal-card" onClick={() => navigate('/government/login')} id="govt-portal-btn">
              <div className="portal-card-icon portal-card-icon-gov">
                <Shield size={24} />
              </div>
              <h3>Government Portal</h3>
              <p>Land intelligence dashboard, GIS validation & property analysis</p>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 500 }}>
                Official Access <ArrowRight size={12} />
              </div>
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
