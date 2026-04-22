// src/components/Footer.jsx
import React from "react";
import { Heart } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-gray-100 py-4">
      <div className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
          <p className="text-xs text-gray-400">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            {t('footer.madeBy')}
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" aria-hidden="true" />
            {t('footer.forBetterCommerce')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;