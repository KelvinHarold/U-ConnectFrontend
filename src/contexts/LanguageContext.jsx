import React, { createContext, useState, useContext, useEffect } from 'react';
import { getTranslation } from '../pages/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('app-language');
    return saved === 'sw' ? 'sw' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
    document.documentElement.lang = language === 'en' ? 'en' : 'sw';
  }, [language]);

  const t = (key, params = {}) => {
    let text = getTranslation(language, key);
    if (params && typeof text === 'string') {
      Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
      });
    }
    return text;
  };

  const changeLanguage = (newLang) => {
    if (newLang === 'en' || newLang === 'sw') {
      setLanguage(newLang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};