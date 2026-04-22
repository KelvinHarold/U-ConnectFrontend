// src/components/HelpSupportModal.jsx
import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  X, 
  Mail, 
  Phone, 
  MessageCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Globe,
  Headphones,
  Sparkles,
  Shield,
  Zap,
  Award,
  ChevronDown
} from 'lucide-react';

const HelpSupportModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const supportOptions = [
    {
      title: t('helpSupport.emailSupport.title'),
      description: t('helpSupport.emailSupport.description'),
      icon: Mail,
      contact: "support@uconnect.com",
      action: "mailto:support@uconnect.com",
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: t('helpSupport.phoneSupport.title'),
      description: t('helpSupport.phoneSupport.description'),
      icon: Phone,
      contact: "+255 123 456 789",
      action: "tel:+255123456789",
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: t('helpSupport.liveChat.title'),
      description: t('helpSupport.liveChat.description'),
      icon: MessageCircle,
      contact: t('helpSupport.liveChat.contact'),
      action: "#",
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50"
    }
  ];

  const faqs = [
    {
      question: t('helpSupport.faqs.placeOrder.question'),
      answer: t('helpSupport.faqs.placeOrder.answer')
    },
    {
      question: t('helpSupport.faqs.paymentMethods.question'),
      answer: t('helpSupport.faqs.paymentMethods.answer')
    },
    {
      question: t('helpSupport.faqs.trackOrder.question'),
      answer: t('helpSupport.faqs.trackOrder.answer')
    },
    {
      question: t('helpSupport.faqs.returnPolicy.question'),
      answer: t('helpSupport.faqs.returnPolicy.answer')
    },
    {
      question: t('helpSupport.faqs.becomeSeller.question'),
      answer: t('helpSupport.faqs.becomeSeller.answer')
    }
  ];

  const quickTips = [
    t('helpSupport.quickTips.checkSpam'),
    t('helpSupport.quickTips.saveNumber'),
    t('helpSupport.quickTips.haveOrderNumber'),
    t('helpSupport.quickTips.urgentIssues')
  ];

  const businessHours = [
    { day: t('helpSupport.businessHours.mondayFriday'), hours: "9:00 AM - 6:00 PM", isOpen: true },
    { day: t('helpSupport.businessHours.saturday'), hours: "10:00 AM - 4:00 PM", isOpen: true },
    { day: t('helpSupport.businessHours.sunday'), hours: t('helpSupport.businessHours.closed'), isOpen: false },
    { day: t('helpSupport.businessHours.liveChat'), hours: t('helpSupport.businessHours.alwaysAvailable'), isOpen: true }
  ];

  const handleSocialShare = (platform) => {
    const url = window.location.origin;
    const text = t('helpSupport.shareText');
    const title = t('helpSupport.shareTitle');
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden focus:outline-none animate-modal-in"
        tabIndex="-1"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 id="help-modal-title" className="text-base sm:text-lg font-bold text-white">
                  {t('helpSupport.title')}
                </h2>
                <p className="text-amber-200/80 text-[10px] sm:text-xs mt-0.5">
                  {t('helpSupport.subtitle')}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl p-1.5 sm:p-2 transition-all duration-200"
              aria-label={t('helpSupport.closeModal')}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto p-4 sm:p-6" style={{ maxHeight: 'calc(95vh - 80px)' }}>
          <div className="space-y-5 sm:space-y-6">
            
            {/* Support Options */}
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 bg-[#5C352C]/10 rounded-lg">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#5C352C]" aria-hidden="true" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  {t('helpSupport.contactSupport')}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {supportOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <a
                      key={index}
                      href={option.action}
                      target={option.action.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className={`group block p-3 sm:p-4 rounded-xl border-2 border-gray-100 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 ${option.bg}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl bg-gradient-to-r ${option.gradient} shadow-md group-hover:scale-110 transition-transform`}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{option.title}</h4>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{option.description}</p>
                          <p className="text-[10px] sm:text-xs font-semibold text-[#5C352C] mt-1.5 group-hover:underline truncate">
                            {option.contact}
                          </p>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100 p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="p-2 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] rounded-xl shadow-md w-fit">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base">{t('helpSupport.businessHours.title')}</h4>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 mt-3">
                    {businessHours.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-2 sm:p-2.5 border border-gray-100">
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-600">{item.day}</p>
                        <p className={`text-xs sm:text-sm font-bold ${item.isOpen ? 'text-gray-800' : 'text-gray-400'}`}>
                          {item.hours}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 bg-[#5C352C]/10 rounded-lg">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#5C352C]" aria-hidden="true" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  {t('helpSupport.faqs.title')}
                </h3>
              </div>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <details key={index} className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 border border-gray-100">
                      <span className="text-xs sm:text-sm font-semibold text-gray-800 pr-2">{faq.question}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform duration-200 flex-shrink-0" aria-hidden="true" />
                    </summary>
                    <div className="p-3 sm:p-4 text-xs sm:text-sm text-gray-600 border-l-2 border-[#5C352C] bg-white mt-1 rounded-r-xl shadow-sm">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-100 p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md w-fit">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-800 text-sm sm:text-base">{t('helpSupport.quickTips.title')}</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 mt-3">
                    {quickTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-amber-700">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="border-t-2 border-gray-100 pt-4 sm:pt-5">
              <p className="text-center text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4 font-medium">
                {t('helpSupport.social.followUs')}
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleSocialShare('facebook')}
                  className="px-4 sm:px-5 py-1.5 sm:py-2 bg-[#1877F2] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-xs sm:text-sm font-semibold"
                  aria-label={t('helpSupport.social.shareOnFacebook')}
                >
                  📘 Facebook
                </button>
                <button
                  onClick={() => handleSocialShare('twitter')}
                  className="px-4 sm:px-5 py-1.5 sm:py-2 bg-[#1DA1F2] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-xs sm:text-sm font-semibold"
                  aria-label={t('helpSupport.social.shareOnTwitter')}
                >
                  🐦 Twitter
                </button>
                <button
                  onClick={() => handleSocialShare('linkedin')}
                  className="px-4 sm:px-5 py-1.5 sm:py-2 bg-[#0A66C2] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-xs sm:text-sm font-semibold"
                  aria-label={t('helpSupport.social.shareOnLinkedIn')}
                >
                  🔗 LinkedIn
                </button>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="text-center pt-2">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 rounded-full">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" aria-hidden="true" />
                <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium">{t('helpSupport.trust.secureSupport')}</span>
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" aria-hidden="true" />
                <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium">{t('helpSupport.trust.fastResponse')}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t-2 border-gray-100 mt-5 sm:mt-6 pt-4 sm:pt-5 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-bold hover:-translate-y-0.5"
              aria-label={t('helpSupport.closeModal')}
            >
              {t('helpSupport.close')}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.3s ease-out forwards;
        }
        
        @media (max-width: 640px) {
          .animate-modal-in {
            animation-duration: 0.25s;
          }
        }
      `}</style>
    </div>
  );
};

export default HelpSupportModal;