import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';

const LanguageSelector = () => {
  const { language, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' },
  ];

  const currentLanguage = languages.find(l => l.code === language);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-stone-600 hover:text-[#5C352C] hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
        aria-label="Language"
      >
        <FiGlobe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLanguage?.flag} {currentLanguage?.name}</span>
        <span className="sm:hidden">{currentLanguage?.flag}</span>
        <FiChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden z-50 animate-fade-in">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2 ${
                language === lang.code
                  ? 'bg-[#5C352C]/5 text-[#5C352C] font-semibold'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#5C352C]"></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;