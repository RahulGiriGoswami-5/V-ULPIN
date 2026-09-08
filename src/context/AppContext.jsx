import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { authService } from '../services';

// ── Auth Context ─────────────────────────────────────────────
const AuthContext = createContext(null);

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':  return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT': return { user: null, isAuthenticated: false };
    default: return state;
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: authService.getCurrentUser(),
    isAuthenticated: !!authService.getCurrentUser(),
  });

  const login = useCallback((username, password) => {
    const result = authService.login(username, password);
    if (result.success) dispatch({ type: 'LOGIN', payload: result.user });
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ── App Context (global state) ───────────────────────────────
const AppContext = createContext(null);

const initialAppState = {
  // Property selection
  selectedProperty: null,
  selectedFloor: null,
  selectedUnit: null,

  // V-ULPIN lifecycle
  generatedVULPIN: null,
  encryptedVULPIN: null,
  decryptedVULPIN: null,

  // GIS layers
  activeLayers: ['Buildings', 'Parcels', 'Roads'],

  // Integrity
  integrityResult: null,
  integrityLoading: false,

  // Validation
  validationResult: null,
  validationLoading: false,

  // Report
  reportData: null,
  reportLoading: false,

  // Infrastructure analysis
  infraAnalysisActive: false,
  infraConflicts: [],

  // Selected conflict
  selectedConflict: null,

  // Notifications
  notifications: [],
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROPERTY':
      return {
        ...state,
        selectedProperty: action.payload,
        selectedFloor: null,
        selectedUnit: null,
        generatedVULPIN: null,
        encryptedVULPIN: null,
        integrityResult: null,
        validationResult: null,
      };
    case 'SET_FLOOR':
      return { ...state, selectedFloor: action.payload, selectedUnit: null, generatedVULPIN: null };
    case 'SET_UNIT':
      return { ...state, selectedUnit: action.payload, generatedVULPIN: null };
    case 'SET_VULPIN':
      return { ...state, generatedVULPIN: action.payload };
    case 'SET_ENCRYPTED_VULPIN':
      return { ...state, encryptedVULPIN: action.payload };
    case 'SET_DECRYPTED_VULPIN':
      return { ...state, decryptedVULPIN: action.payload };
    case 'TOGGLE_LAYER': {
      const layer = action.payload;
      const active = state.activeLayers.includes(layer)
        ? state.activeLayers.filter(l => l !== layer)
        : [...state.activeLayers, layer];
      return { ...state, activeLayers: active };
    }
    case 'SET_ACTIVE_LAYERS':
      return { ...state, activeLayers: action.payload };
    case 'SET_INTEGRITY_LOADING':
      return { ...state, integrityLoading: action.payload };
    case 'SET_INTEGRITY_RESULT':
      return { ...state, integrityResult: action.payload, integrityLoading: false };
    case 'SET_VALIDATION_LOADING':
      return { ...state, validationLoading: action.payload };
    case 'SET_VALIDATION_RESULT':
      return { ...state, validationResult: action.payload, validationLoading: false };
    case 'SET_REPORT_LOADING':
      return { ...state, reportLoading: action.payload };
    case 'SET_REPORT_DATA':
      return { ...state, reportData: action.payload, reportLoading: false };
    case 'SET_INFRA_ANALYSIS':
      return { ...state, infraAnalysisActive: action.payload.active, infraConflicts: action.payload.conflicts || [] };
    case 'SET_SELECTED_CONFLICT':
      return { ...state, selectedConflict: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, { ...action.payload, id: Date.now() }] };
    case 'REMOVE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case 'RESET_PROPERTY_STATE':
      return { ...state, selectedProperty: null, selectedFloor: null, selectedUnit: null, generatedVULPIN: null, encryptedVULPIN: null, integrityResult: null, validationResult: null };
    default:
      return state;
  }
};

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  const notify = useCallback((message, type = 'info', title = '') => {
    const id = Date.now();
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message, type, title, id } });
    setTimeout(() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }), 4500);
  }, []);

  return (
    <AppContext.Provider value={{ ...state, dispatch, notify }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
