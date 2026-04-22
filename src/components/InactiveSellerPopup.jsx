import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

const InactiveSellerPopup = ({ isOpen, onClose }) => {
  const [show, setShow] = useState(false);
  const [render, setRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
      setTimeout(() => setRender(false), 300);
    }
  }, [isOpen]);

  if (!render) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${show ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/30 dark:border-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full transform transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${
        show ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
      }`}>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/40 text-rose-500 rounded-2xl flex items-center justify-center mb-5 transform rotate-12 hover:rotate-0 transition-transform duration-500 shadow-inner group">
            <AlertCircle className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
          </div>
          
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
            Seller Unavailable
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-8 px-2">
            We're sorry, this seller's account is currently inactive. Please check back later, as their subscription might be pending renewal.
          </p>
          
          <button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white text-[15px] font-semibold py-3.5 px-6 rounded-2xl shadow-lg shadow-rose-500/25 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};

export default InactiveSellerPopup;
