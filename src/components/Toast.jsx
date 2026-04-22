// src/components/Toast.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`fixed top-20 right-4 z-50 animate-slide-in ${isVisible ? 'animate-slide-in' : 'animate-slide-out'}`}>
      <div className={`${colors[type]} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}>
        {icons[type]}
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }} className="hover:text-white/80 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;