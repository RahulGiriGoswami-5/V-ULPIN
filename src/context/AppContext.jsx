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

const WORKFLOW_STORAGE_KEY = 'vulpin_workflow_state';

function loadPersistedWorkflow() {
  try {
    const raw = localStorage.getItem(WORKFLOW_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveWorkflowToStorage(state) {
  try {
    const dataToSave = {
      selectedProperty: state.selectedProperty,
      selectedFloor: state.selectedFloor,
      selectedUnit: state.selectedUnit,
      generatedVULPIN: state.generatedVULPIN,
      encryptedVULPIN: state.encryptedVULPIN,
      decryptedVULPIN: state.decryptedVULPIN,
      encryptionStatus: state.encryptionStatus,
      currentStep: state.currentStep,
      completedSteps: state.completedSteps,
    };
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error('Failed to persist workflow state', e);
  }
}

const persisted = loadPersistedWorkflow();

// compute initial completed steps based on existing data
const initialCompleted = [];
if (persisted.selectedProperty) initialCompleted.push('search');
if (persisted.selectedProperty && persisted.selectedFloor && persisted.selectedUnit) initialCompleted.push('identify');
if (persisted.generatedVULPIN) initialCompleted.push('generate');
if (persisted.encryptedVULPIN) initialCompleted.push('secure');

const initialAppState = {
  // Property selection
  selectedProperty: persisted.selectedProperty || null,
  selectedFloor: persisted.selectedFloor || null,
  selectedUnit: persisted.selectedUnit || null,

  // V-ULPIN lifecycle
  generatedVULPIN: persisted.generatedVULPIN || null,
  encryptedVULPIN: persisted.encryptedVULPIN || null,
  decryptedVULPIN: persisted.decryptedVULPIN || null,
  encryptionStatus: persisted.encryptionStatus || (persisted.encryptedVULPIN ? 'encrypted' : 'idle'),

  // Workflow tracking
  currentStep: persisted.currentStep || 'search',
  completedSteps: persisted.completedSteps || initialCompleted,

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
  let nextState;
  switch (action.type) {
    case 'SET_PROPERTY': {
      const isSameProp = state.selectedProperty?.id === action.payload?.id;
      const completed = new Set(state.completedSteps || []);
      if (action.payload) {
        completed.add('search');
      } else {
        completed.delete('search');
        completed.delete('identify');
        completed.delete('generate');
        completed.delete('secure');
      }

      nextState = {
        ...state,
        selectedProperty: action.payload,
        selectedFloor: isSameProp ? state.selectedFloor : null,
        selectedUnit: isSameProp ? state.selectedUnit : null,
        generatedVULPIN: isSameProp ? state.generatedVULPIN : null,
        encryptedVULPIN: isSameProp ? state.encryptedVULPIN : null,
        encryptionStatus: isSameProp ? state.encryptionStatus : 'idle',
        integrityResult: null,
        validationResult: null,
        completedSteps: Array.from(completed),
      };
      saveWorkflowToStorage(nextState);
      return nextState;
    }

    case 'SET_FLOOR': {
      const isSameFloor = state.selectedFloor?.id === action.payload?.id;
      const completed = new Set(state.completedSteps || []);
      if (!isSameFloor) {
        completed.delete('identify');
        completed.delete('generate');
        completed.delete('secure');
      }

      nextState = { 
        ...state, 
        selectedFloor: action.payload, 
        selectedUnit: isSameFloor ? state.selectedUnit : null, 
        generatedVULPIN: isSameFloor ? state.generatedVULPIN : null,
        encryptedVULPIN: isSameFloor ? state.encryptedVULPIN : null,
        encryptionStatus: isSameFloor ? state.encryptionStatus : 'idle',
        completedSteps: Array.from(completed),
      };
      saveWorkflowToStorage(nextState);
      return nextState;
    }

    case 'SET_UNIT': {
      const isSameUnit = state.selectedUnit === action.payload;
      const completed = new Set(state.completedSteps || []);
      if (state.selectedProperty && state.selectedFloor && action.payload) {
        completed.add('identify');
      } else {
        completed.delete('identify');
        completed.delete('generate');
        completed.delete('secure');
      }

      nextState = { 
        ...state, 
        selectedUnit: action.payload, 
        generatedVULPIN: isSameUnit ? state.generatedVULPIN : null,
        encryptedVULPIN: isSameUnit ? state.encryptedVULPIN : null,
        encryptionStatus: isSameUnit ? state.encryptionStatus : 'idle',
        completedSteps: Array.from(completed),
      };
      saveWorkflowToStorage(nextState);
      return nextState;
    }

    case 'SET_VULPIN': {
      const completed = new Set(state.completedSteps || []);
      if (action.payload) {
        completed.add('generate');
      } else {
        completed.delete('generate');
        completed.delete('secure');
      }

      nextState = { 
        ...state, 
        generatedVULPIN: action.payload,
        completedSteps: Array.from(completed),
      };
      saveWorkflowToStorage(nextState);
      return nextState;
    }

    case 'SET_ENCRYPTED_VULPIN': {
      const completed = new Set(state.completedSteps || []);
      if (action.payload) {
        completed.add('secure');
      } else {
        completed.delete('secure');
      }

      nextState = { 
        ...state, 
        encryptedVULPIN: action.payload,
        encryptionStatus: action.payload ? 'encrypted' : 'idle',
        completedSteps: Array.from(completed),
      };
      saveWorkflowToStorage(nextState);
      return nextState;
    }

    case 'SET_DECRYPTED_VULPIN':
      nextState = { ...state, decryptedVULPIN: action.payload };
      saveWorkflowToStorage(nextState);
      return nextState;

    case 'SET_WORKFLOW_STEP':
      nextState = { ...state, currentStep: action.payload };
      saveWorkflowToStorage(nextState);
      return nextState;

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
    case 'RESET_PROPERTY_STATE': {
      try {
        localStorage.removeItem(WORKFLOW_STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
      return { 
        ...state, 
        selectedProperty: null, 
        selectedFloor: null, 
        selectedUnit: null, 
        generatedVULPIN: null, 
        encryptedVULPIN: null, 
        decryptedVULPIN: null,
        encryptionStatus: 'idle',
        currentStep: 'search',
        completedSteps: [],
        integrityResult: null, 
        validationResult: null 
      };
    }
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
