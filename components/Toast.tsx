import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto dismiss after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600 text-white shadow-emerald-200';
      case 'error':
        return 'bg-red-600 text-white shadow-red-200';
      default:
        return 'bg-slate-800 text-white shadow-slate-300';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-xl animate-fade-in-down transition-all ${getStyles()}`}>
      <span className="text-lg">{getIcon()}</span>
      <span className="text-sm font-bold tracking-wide">{message}</span>
      <button 
        onClick={onClose} 
        className="ml-2 text-white/70 hover:text-white transition-colors font-bold"
      >
        &times;
      </button>
    </div>
  );
};

export default Toast;