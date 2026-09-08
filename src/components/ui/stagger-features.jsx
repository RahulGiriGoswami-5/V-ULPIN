import React, { useState, useEffect } from 'react';
import {
  Layers,
  Map,
  Lock,
  CheckCircle,
  FileSearch,
  Building2,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const FEATURES = [
  {
    id: 1,
    num: '01',
    title: '3D Vertical Identity',
    description:
      'Extends the existing ULPIN/Bhu-Aadhaar to capture building, floor, and unit — enabling precise sub-parcel identification in multi-storey properties.',
    icon: Layers,
    badge: 'Volumetric Cadastre',
  },
  {
    id: 2,
    num: '02',
    title: 'AI-Powered GIS Mapping',
    description:
      'Spatial validation, conflict detection, and infrastructure analysis integrated directly into the 3D GIS workflow for government officials.',
    icon: Map,
    badge: 'Spatial Intelligence',
  },
  {
    id: 3,
    num: '03',
    title: 'Encrypted V-ULPIN Transfer',
    description:
      'V-ULPIN data is encrypted before citizen-to-government transfer, ensuring tamper-proof identity with a verifiable chain of custody.',
    icon: Lock,
    badge: 'Cryptographic Security',
  },
  {
    id: 4,
    num: '04',
    title: 'Data Integrity Scoring',
    description:
      'Every property gets an automated integrity score based on spatial accuracy, ownership match, record completeness and cross-validation.',
    icon: CheckCircle,
    badge: 'Automated Scoring',
  },
  {
    id: 5,
    num: '05',
    title: 'Spatial Conflict Detection',
    description:
      'Automatically detects parcel overlaps, boundary mismatches, infrastructure corridor conflicts and elevation inconsistencies.',
    icon: FileSearch,
    badge: 'Conflict Resolution',
  },
  {
    id: 6,
    num: '06',
    title: 'Urban Planning Integration',
    description:
      'Simulate proposed construction against existing infrastructure, road clearances, metro corridors and utility networks in the GIS environment.',
    icon: Building2,
    badge: 'Infrastructure Simulation',
  },
];

export function StaggerFeatures({ className }) {
  const [featuresList, setFeaturesList] = useState(FEATURES);
  const [cardSize, setCardSize] = useState(365);

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia('(min-width: 640px)');
      setCardSize(matches ? 365 : 290);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleMove = (steps) => {
    const newList = [...featuresList];

    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({
          ...item,
          tempId: Math.random(),
        });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({
          ...item,
          tempId: Math.random(),
        });
      }
    }

    setFeaturesList(newList);
  };

  const cornerChamfer = cardSize > 320 ? 50 : 38;
  const clipPathValue = `polygon(
    ${cornerChamfer}px 0%,
    calc(100% - ${cornerChamfer}px) 0%,
    100% ${cornerChamfer}px,
    100% 100%,
    calc(100% - ${cornerChamfer}px) 100%,
    ${cornerChamfer}px 100%,
    0 100%,
    0 0
  )`;

  return (
    <section
      className={cn('home-features-stagger', className)}
      style={{
        padding: '5rem 1.5rem',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderTop: '1px solid var(--neutral-200)',
        borderBottom: '1px solid var(--neutral-200)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Preserved Section Heading & Subtitle */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--saffron-100)',
              color: 'var(--saffron-600)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.3rem 0.85rem',
              borderRadius: 20,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '0.75rem',
            }}
          >
            <Shield size={13} />
            Core Capabilities
          </div>
          <h2
            style={{
              fontSize: '2.1rem',
              fontWeight: 700,
              color: 'var(--navy-900)',
              lineHeight: 1.25,
              marginBottom: '0.75rem',
            }}
          >
            Built for India's Land Administration
          </h2>
          <p
            style={{
              color: 'var(--neutral-600)',
              fontSize: '1rem',
              maxWidth: 680,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            A unified platform connecting citizens and government for accurate, tamper-proof 3D property registration
          </p>
        </div>

        {/* Staggered Layered Stack Stage */}
        <div
          style={{
            position: 'relative',
            height: cardSize + 95,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
            margin: '0 auto',
          }}
        >
          {featuresList.map((item, index) => {
            const total = featuresList.length;
            // Symmetric index relative to center (index 0)
            const position = index <= Math.floor(total / 2) ? index : index - total;
            const isCenter = position === 0;
            const isVisible = Math.abs(position) <= 2;

            if (!isVisible) return null;

            const Icon = item.icon;

            return (
              <div
                key={item.id || item.tempId || index}
                onClick={() => !isCenter && handleMove(position)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (!isCenter) handleMove(position);
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: cardSize,
                  height: cardSize,
                  maxWidth: '92vw',
                  maxHeight: '92vw',
                  padding: cardSize > 320 ? '2rem 1.75rem 1.75rem' : '1.5rem 1.25rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: isCenter ? 'default' : 'pointer',
                  userSelect: 'none',
                  zIndex: isCenter ? 10 : 8 - Math.abs(position),
                  opacity: Math.abs(position) > 2 ? 0 : 1 - Math.abs(position) * 0.22,
                  transform: `
                    translate(-50%, -50%)
                    translateX(${(cardSize / 1.5) * position}px)
                    translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
                    rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
                  `,
                  transition: 'all 500ms ease-in-out',
                  clipPath: clipPathValue,
                  background: isCenter ? 'var(--navy-900)' : '#ffffff',
                  color: isCenter ? '#ffffff' : 'var(--navy-900)',
                  border: isCenter
                    ? '2px solid var(--saffron-500)'
                    : '1px solid var(--neutral-300)',
                  boxShadow: isCenter
                    ? '0 25px 50px -12px rgba(15, 23, 42, 0.45), 0 0 24px rgba(232, 104, 26, 0.2)'
                    : '0 8px 20px rgba(0, 0, 0, 0.07)',
                }}
              >
                {/* Top: Orange Icon & Feature Number Badge */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem',
                    }}
                  >
                    {/* Orange Icon */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: isCenter ? 'rgba(232, 104, 26, 0.18)' : 'var(--saffron-100)',
                        border: isCenter ? '1px solid rgba(232, 104, 26, 0.35)' : '1px solid rgba(232, 104, 26, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--saffron-500)',
                      }}
                    >
                      <Icon size={24} color="var(--saffron-500)" />
                    </div>

                    {/* Numeric & Badge indicator */}
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: isCenter ? 'var(--saffron-400)' : 'var(--saffron-600)',
                        background: isCenter ? 'rgba(255, 255, 255, 0.08)' : 'var(--neutral-100)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 6,
                      }}
                    >
                      {item.num}
                    </span>
                  </div>

                  {/* Feature Title */}
                  <h3
                    style={{
                      fontSize: cardSize > 320 ? '1.25rem' : '1.1rem',
                      fontWeight: 700,
                      color: isCenter ? '#ffffff' : 'var(--navy-900)',
                      lineHeight: 1.3,
                      marginBottom: '0.75rem',
                    }}
                  >
                    {item.title}
                  </h3>

                  {/* Feature Description */}
                  <p
                    style={{
                      fontSize: cardSize > 320 ? '0.875rem' : '0.775rem',
                      lineHeight: 1.6,
                      color: isCenter ? 'rgba(255, 255, 255, 0.82)' : 'var(--neutral-600)',
                      fontWeight: 400,
                      margin: 0,
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Bottom: Feature Tag / Status Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: `1px solid ${isCenter ? 'rgba(255, 255, 255, 0.12)' : 'var(--neutral-200)'}`,
                    paddingTop: '0.85rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: isCenter ? 'var(--saffron-400)' : 'var(--saffron-600)',
                    }}
                  >
                    {item.badge}
                  </span>

                  {isCenter && (
                    <span
                      style={{
                        fontSize: '0.675rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        background: 'var(--saffron-500)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 12,
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Previous and Next Navigation Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            marginTop: '2rem',
          }}
        >
          <button
            onClick={() => handleMove(-1)}
            aria-label="Previous feature"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid var(--neutral-300)',
              color: 'var(--navy-900)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--navy-900)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = 'var(--navy-900)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.color = 'var(--navy-900)';
              e.currentTarget.style.borderColor = 'var(--neutral-300)';
            }}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Position Indicator Dots */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {featuresList.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const pos = i <= Math.floor(featuresList.length / 2) ? i : i - featuresList.length;
                  handleMove(pos);
                }}
                aria-label={`Go to feature ${i + 1}`}
                style={{
                  width: i === 0 ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === 0 ? 'var(--saffron-500)' : 'var(--neutral-300)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => handleMove(1)}
            aria-label="Next feature"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid var(--neutral-300)',
              color: 'var(--navy-900)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--navy-900)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = 'var(--navy-900)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.color = 'var(--navy-900)';
              e.currentTarget.style.borderColor = 'var(--neutral-300)';
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default StaggerFeatures;
