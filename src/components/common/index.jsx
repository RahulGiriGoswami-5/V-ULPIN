import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const iconMap = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};
const colorMap = {
  success: '#16a34a',
  error:   '#dc2626',
  warning: '#d97706',
  info:    '#1a2744',
};

export function Notification() {
  const { notifications, dispatch } = useApp();

  return (
    <div className="toast-container">
      {notifications.map(n => {
        const Icon = iconMap[n.type] || Info;
        return (
          <div key={n.id} className={`toast toast-${n.type}`}>
            <Icon size={18} color={colorMap[n.type]} style={{ flexShrink: 0, marginTop: 2 }} />
            <div className="flex-1">
              {n.title && <div className="toast-title">{n.title}</div>}
              <div className="toast-message">{n.message}</div>
            </div>
            <button className="toast-close" onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: n.id })}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function LoadingState({ message = 'Loading...', size = 'md' }) {
  return (
    <div className="loading-center">
      <div className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`} />
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="state-card">
      {Icon && (
        <div className="state-icon state-icon-navy">
          <Icon size={28} />
        </div>
      )}
      <div className="state-title">{title}</div>
      {description && <p className="state-desc">{description}</p>}
      {action}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, footer, size = '' }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={`modal ${size ? `modal-${size}` : ''}`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    verified: { label: 'Verified', cls: 'badge-green' },
    attention: { label: 'Needs Attention', cls: 'badge-amber' },
    critical: { label: 'Critical', cls: 'badge-red' },
    pending: { label: 'Pending', cls: 'badge-amber' },
    'clear title': { label: 'Clear Title', cls: 'badge-green' },
    'disputed — partial claim': { label: 'Disputed', cls: 'badge-red' },
    'leasehold — 99 years': { label: 'Leasehold', cls: 'badge-blue' },
    'government owned': { label: 'Govt. Owned', cls: 'badge-navy' },
  };
  const key = status?.toLowerCase();
  const item = map[key] || { label: status, cls: 'badge-neutral' };
  return <span className={`badge ${item.cls}`}>{item.label}</span>;
}

export function Spinner({ size = '', white = false }) {
  return <div className={`spinner ${size ? `spinner-${size}` : ''} ${white ? 'spinner-white' : ''}`} />;
}

export { WorkflowStepper } from './WorkflowStepper';
