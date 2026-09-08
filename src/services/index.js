// ============================================================
// Frontend Service Layer — V-ULPIN System
// All functions work entirely with local mock data.
// Replace function bodies with real API calls in production.
// ============================================================

import { mockProperties, mockAnalytics } from '../data/mockProperties';

// ── Auth Service ─────────────────────────────────────────────
const MOCK_CREDENTIALS = {
  citizen: { username: 'demo.citizen', password: 'citizen123', role: 'citizen', name: 'Ramesh Kumar' },
  government: { username: 'demo.gov', password: 'gov123', role: 'government', name: 'Arjun Mehta (IAS)' },
};

export const authService = {
  login(username, password) {
    const cred = Object.values(MOCK_CREDENTIALS).find(
      c => c.username === username && c.password === password
    );
    if (!cred) return { success: false, error: 'Invalid username or password.' };
    const user = { username: cred.username, role: cred.role, name: cred.name };
    localStorage.setItem('vulpin_user', JSON.stringify(user));
    return { success: true, user };
  },
  logout() {
    localStorage.removeItem('vulpin_user');
  },
  getCurrentUser() {
    try {
      const raw = localStorage.getItem('vulpin_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
};

// ── Property Service ─────────────────────────────────────────
export const propertyService = {
  getAll() {
    return [...mockProperties];
  },

  getById(id) {
    return mockProperties.find(p => p.id === id) || null;
  },

  getPropertyByULPIN(ulpin) {
    if (!ulpin) return null;
    const q = ulpin.trim().toUpperCase();
    return mockProperties.find(p => p.oldULPIN.toUpperCase() === q) || null;
  },

  getPropertyByVULPIN(vulpin) {
    if (!vulpin) return null;
    // Match by generated V-ULPIN pattern embedded in oldULPIN hash
    const q = vulpin.trim().toUpperCase();
    return mockProperties.find(p => {
      const generated = vulpinService.generateVULPIN(p, p.building.floors[1], p.building.floors[1].units[0]);
      return generated.toUpperCase() === q;
    }) || null;
  },

  searchProperty(query) {
    if (!query || query.trim().length < 3) return [];
    const q = query.trim().toLowerCase();
    return mockProperties.filter(p =>
      p.oldULPIN.toLowerCase().includes(q) ||
      p.parcelId.toLowerCase().includes(q) ||
      p.surveyNumber.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.ownerName.toLowerCase().includes(q)
    );
  },

  searchByParcelId(parcelId) {
    if (!parcelId) return null;
    const q = parcelId.trim().toUpperCase();
    return mockProperties.find(p => p.parcelId.toUpperCase() === q) || null;
  },

  searchBySurveyNumber(surveyNumber) {
    if (!surveyNumber) return null;
    const q = surveyNumber.trim().toLowerCase();
    return mockProperties.find(p => p.surveyNumber.toLowerCase().includes(q)) || null;
  },

  /** Smart search: tries all fields */
  smartSearch(query) {
    if (!query || query.trim().length < 2) return null;
    const q = query.trim();
    return (
      this.getPropertyByULPIN(q) ||
      this.searchByParcelId(q) ||
      this.searchBySurveyNumber(q) ||
      this.searchProperty(q)[0] ||
      null
    );
  },
};

// ── V-ULPIN Service ──────────────────────────────────────────
export const vulpinService = {
  /**
   * generateVULPIN — deterministic frontend placeholder
   * Format: VULPIN-<StateCode>-<DistrictHash>-<ParcelHash>-<FloorCode>-<UnitCode>
   * TODO: Replace with actual cryptographic algorithm from team.
   */
  generateVULPIN(property, floor, unit) {
    if (!property || !floor || !unit) return null;

    const stateMap = {
      'Karnataka': 'KA', 'Maharashtra': 'MH', 'Delhi': 'DL',
      'Tamil Nadu': 'TN', 'Rajasthan': 'RJ', 'Gujarat': 'GJ',
      'West Bengal': 'WB', 'Uttar Pradesh': 'UP', 'Telangana': 'TS',
    };
    const stateCode = stateMap[property.state] || 'IN';

    // Simple deterministic hash from parcelId
    const parcelHash = simpleHash(property.parcelId).toString(16).toUpperCase().padStart(6, '0').slice(0, 6);
    const distHash   = simpleHash(property.district || 'DL').toString(16).toUpperCase().padStart(4, '0').slice(0, 4);
    const floorCode  = (floor.id || 'G').replace(/\//g, '-');
    const unitCode   = (unit || 'U01').toString().replace(/\//g, '-');

    return `VULPIN-${stateCode}-${distHash}-${parcelHash}-${floorCode}-${unitCode}`;
  },

  /**
   * encryptVULPIN — frontend demo placeholder
   * TODO: Replace with actual encryption algorithm (AES-256 / RSA etc.) from team.
   */
  encryptVULPIN(data) {
    if (!data) return null;
    const timestamp  = Date.now().toString(36).toUpperCase();
    const encoded    = btoa(unescape(encodeURIComponent(data + '::' + timestamp)));
    return `ENC::${encoded}`;
  },

  /**
   * decryptVULPIN — frontend demo placeholder
   * TODO: Replace with actual decryption algorithm from team.
   */
  decryptVULPIN(encryptedData) {
    if (!encryptedData) return { success: false, error: 'No data provided.' };
    try {
      if (!encryptedData.startsWith('ENC::')) {
        return { success: false, error: 'Invalid encrypted format. Data must begin with ENC:: prefix.' };
      }
      const base64Part = encryptedData.slice(5);
      const decoded    = decodeURIComponent(escape(atob(base64Part)));
      const parts      = decoded.split('::');
      if (parts.length < 2) return { success: false, error: 'Malformed encrypted payload.' };
      return { success: true, vulpin: parts[0] };
    } catch (err) {
      return { success: false, error: 'Decryption failed. Invalid or corrupted data.' };
    }
  },
};

// ── Integrity Service ────────────────────────────────────────
export const integrityService = {
  /**
   * runIntegrityTest — returns a score object from mock property data.
   * Adds small random variance per run to simulate live recalculation.
   */
  runIntegrityTest(property) {
    if (!property) return null;
    const jitter = () => Math.round((Math.random() * 3 - 1.5) * 10) / 10;

    const spatialAccuracy     = Math.min(100, Math.max(0, property.spatialAccuracy + jitter()));
    const ownershipMatch      = Math.min(100, Math.max(0, property.ownershipMatch + jitter()));
    const recordCompleteness  = Math.min(100, Math.max(0, property.recordCompleteness + jitter()));
    const crossValidation     = Math.min(100, Math.max(0, property.crossValidation + jitter()));
    const overall = Math.round(
      ((spatialAccuracy * 0.3) + (ownershipMatch * 0.25) + (recordCompleteness * 0.2) + (crossValidation * 0.25)) * 10
    ) / 10;

    let status = 'critical';
    if (overall >= 90) status = 'verified';
    else if (overall >= 70) status = 'attention';

    const issues = [];
    if (spatialAccuracy < 80)    issues.push({ field: 'Spatial Accuracy', value: spatialAccuracy, note: 'LiDAR resurvey recommended.' });
    if (ownershipMatch < 80)     issues.push({ field: 'Ownership Match', value: ownershipMatch, note: 'Ownership documents need verification.' });
    if (recordCompleteness < 80) issues.push({ field: 'Record Completeness', value: recordCompleteness, note: 'Missing digitised records.' });
    if (crossValidation < 80)    issues.push({ field: 'Cross Validation', value: crossValidation, note: 'Data cross-reference inconsistency.' });

    return {
      overall,
      status,
      breakdown: { spatialAccuracy, ownershipMatch, recordCompleteness, crossValidation },
      issues,
      timestamp: new Date().toISOString(),
      propertyId: property.id,
    };
  },

  /**
   * runSpatialValidation — analyzes conflicts from mock data.
   */
  runSpatialValidation(property) {
    if (!property) return null;
    const hasConflicts = property.conflicts && property.conflicts.length > 0;

    const checks = [
      { name: 'Property Boundary', status: !hasConflicts || !property.conflicts.find(c => c.type.includes('Boundary')) ? 'pass' : 'fail', detail: 'Parcel boundary coordinates verified against cadastral records.' },
      { name: 'Parcel Overlap Detection', status: !property.conflicts.find(c => c.type.includes('Overlap')) ? 'pass' : 'fail', detail: 'Adjacent parcel boundary intersection analysis.' },
      { name: 'Building Footprint', status: !property.conflicts.find(c => c.type.includes('Footprint')) ? 'pass' : 'fail', detail: 'Built area vs. approved plan comparison.' },
      { name: 'Elevation Consistency', status: !property.conflicts.find(c => c.type.includes('Elevation')) ? 'pass' : 'fail', detail: 'LiDAR elevation vs. recorded elevation.' },
      { name: 'Road Clearance', status: !property.conflicts.find(c => c.type.includes('Road')) ? 'pass' : 'warning', detail: 'Setback distance from nearest road.' },
      { name: 'Infrastructure Corridor', status: !property.conflicts.find(c => c.type.includes('Pipeline') || c.type.includes('Corridor') || c.type.includes('Metro')) ? 'pass' : 'warning', detail: 'Distance from critical infrastructure.' },
    ];

    return {
      hasConflicts,
      conflicts: property.conflicts || [],
      checks,
      timestamp: new Date().toISOString(),
      propertyId: property.id,
    };
  },
};

// ── Report Service ───────────────────────────────────────────
export const reportService = {
  generateReport(property, floor, unit, integrityResult, validationResult) {
    if (!property) return null;
    const generatedVULPIN = floor && unit
      ? vulpinService.generateVULPIN(property, floor, unit)
      : 'Not generated';

    return {
      reportId: `RPT-${Date.now().toString(36).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      property,
      floor,
      unit,
      vULPIN: generatedVULPIN,
      integrityResult,
      validationResult,
    };
  },
};

// ── Analytics Service ────────────────────────────────────────
export const analyticsService = {
  getDashboardAnalytics() {
    const props = mockProperties;
    const verified = props.filter(p => p.integrityScore >= 90).length;
    const attention = props.filter(p => p.integrityScore >= 70 && p.integrityScore < 90).length;
    const critical = props.filter(p => p.integrityScore < 70).length;
    const avgScore = Math.round((props.reduce((s, p) => s + p.integrityScore, 0) / props.length) * 10) / 10;
    const totalConflicts = props.reduce((s, p) => s + p.conflicts.length, 0);

    return {
      ...mockAnalytics,
      localStats: { total: props.length, verified, attention, critical, avgScore, totalConflicts },
    };
  },
};

// ── Utility ──────────────────────────────────────────────────
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
