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
  Headphones,
  ChevronDown,
  MapPin,
  ThumbsUp
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
    },
    {
      title: t('helpSupport.phoneSupport.title'),
      description: t('helpSupport.phoneSupport.description'),
      icon: Phone,
      contact: "+255 123 456 789",
      action: "tel:+255123456789",
    },
    {
      title: t('helpSupport.liveChat.title'),
      description: t('helpSupport.liveChat.description'),
      icon: MessageCircle,
      contact: t('helpSupport.liveChat.contact'),
      action: "#",
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden focus:outline-none"
        tabIndex="-1"
      >
        {/* Header - Matching Dashboard */}
        <div className="bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] px-6 py-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 id="help-modal-title" className="text-lg font-semibold text-white">
                  {t('helpSupport.title')}
                </h2>
                <p className="text-white/60 text-xs mt-0.5">
                  {t('helpSupport.subtitle')}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all"
              aria-label={t('helpSupport.closeModal')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <div className="space-y-6">
            
            {/* Support Options - Clean Cards */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {t('helpSupport.contactSupport')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {supportOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <a
                      key={index}
                      href={option.action}
                      target={option.action.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="group block p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md hover:border-gray-200 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-[#5C352C]/10 transition-colors">
                          <Icon className="w-4 h-4 text-gray-500 group-hover:text-[#5C352C] transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm">{option.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                          <p className="text-xs font-medium text-[#5C352C] mt-2 group-hover:underline truncate">
                            {option.contact}
                          </p>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

      

            {/* FAQ Section - Clean Accordion */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {t('helpSupport.faqs.title')}
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <details key={index} className="group border border-gray-100 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between cursor-pointer p-4 bg-white hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-medium text-gray-800 pr-2">{faq.question}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform duration-200 flex-shrink-0" />
                    </summary>
                    <div className="p-4 text-sm text-gray-600 border-t border-gray-100 bg-gray-50">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Quick Tips - Minimalist */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <ThumbsUp className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{t('helpSupport.quickTips.title')}</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {quickTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-[#5C352C] mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Social Media Links - Minimal */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-center text-xs text-gray-400 mb-3">
                {t('helpSupport.social.followUs')}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handleSocialShare('facebook')}
                  className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
                  aria-label={t('helpSupport.social.shareOnFacebook')}
                >
                  Facebook
                </button>
                <button
                  onClick={() => handleSocialShare('twitter')}
                  className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
                  aria-label={t('helpSupport.social.shareOnTwitter')}
                >
                  Twitter
                </button>
                <button
                  onClick={() => handleSocialShare('linkedin')}
                  className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
                  aria-label={t('helpSupport.social.shareOnLinkedIn')}
                >
                  LinkedIn
                </button>
              </div>
            </div>

            {/* Trust Badge - Minimal */}
            <div className="flex justify-center items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="text-xs text-gray-400">{t('helpSupport.trust.secureSupport')}</span>
              </div>
              <div className="w-px h-3 bg-gray-200"></div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                <span className="text-xs text-gray-400">{t('helpSupport.trust.fastResponse')}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-100 mt-6 pt-5 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] text-white rounded-lg hover:shadow-md transition-all text-sm font-medium"
              aria-label={t('helpSupport.closeModal')}
            >
              {t('helpSupport.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportModal;