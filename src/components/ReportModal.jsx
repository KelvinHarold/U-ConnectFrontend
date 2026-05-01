import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Upload, Eye, Trash2, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { useLanguage } from '../contexts/LanguageContext';
import { errorAlert } from '../utils/sweetAlertHelper';

const ReportModal = ({ 
  isOpen, 
  onClose, 
  initialType = 'other', 
  initialData = null, // { orderId, productId, userId }
  onSuccess 
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    type: initialType,
    subject: '',
    description: '',
    order_id: initialData?.orderId || '',
    product_id: initialData?.productId || '',
    reported_user_id: initialData?.userId || '',
  });

  const [evidenceImage, setEvidenceImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Success
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: initialType,
        subject: '',
        description: '',
        order_id: initialData?.orderId || '',
        product_id: initialData?.productId || '',
        reported_user_id: initialData?.userId || '',
      });
      setEvidenceImage(null);
      setImagePreview(null);
      setStep(1);
      setErrors({});
    }
  }, [isOpen, initialType, initialData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, evidence_image: 'File size must be less than 5MB' });
        return;
      }
      setEvidenceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setEvidenceImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) submitData.append(key, formData[key]);
    });
    if (evidenceImage) {
      submitData.append('evidence_image', evidenceImage);
    }

    try {
      const role = localStorage.getItem('role');
      const endpoint = `/${role}/reports`;
      await api.post(endpoint, submitData);
      setStep(2);
      if (onSuccess) onSuccess();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        errorAlert(t('alerts.submissionFailed'), t('alerts.reportSubmitError'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Report Case / Issue</h3>
              <p className="text-xs text-orange-200/70">Help us keep U-Connect safe</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Report Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5C352C] focus:border-transparent transition-all outline-none"
                    required
                  >
                    <option value="order">Order Issue</option>
                    <option value="product">Product Issue</option>
                    <option value="user">User Behavior</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Subject</label>
                  <input 
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Brief summary of the issue"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5C352C] focus:border-transparent transition-all outline-none"
                    required
                  />
                  {errors.subject && <p className="text-[10px] text-red-500">{errors.subject[0]}</p>}
                </div>
              </div>

              {/* Dynamic Context Fields */}
              {formData.type === 'order' && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-semibold text-gray-700">Order ID (Internal)</label>
                  <input 
                    type="text"
                    value={formData.order_id}
                    onChange={(e) => setFormData({...formData, order_id: e.target.value})}
                    placeholder="Enter order ID related to this issue"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50"
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Detailed Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  placeholder="Tell us what happened in detail..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5C352C] focus:border-transparent transition-all outline-none resize-none"
                  required
                />
                {errors.description && <p className="text-[10px] text-red-500">{errors.description[0]}</p>}
              </div>

              {/* Evidence Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Evidence (Optional)</label>
                
                {imagePreview ? (
                  <div className="relative group w-32 h-32 rounded-xl overflow-hidden border-2 border-dashed border-gray-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 px-4 py-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs font-medium text-gray-500">Upload screenshot or photo (Max 5MB)</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
                {errors.evidence_image && <p className="text-[10px] text-red-500">{errors.evidence_image[0]}</p>}
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-gradient-to-r from-[#2A1713] to-[#5C352C] text-white py-3 rounded-xl font-bold shadow-lg shadow-[#5C352C]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Report
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="py-10 text-center animate-in zoom-in-95 duration-500">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h4>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Thank you for your report. Our administration team has been notified and will review your case shortly.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-[#2A1713] to-[#5C352C] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in-95 { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slide-in-from-top-2 { from { transform: translateY(-0.5rem); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-in { animation: var(--tw-animate-in); }
        .fade-in { --tw-animate-in: fade-in; }
        .zoom-in-95 { --tw-animate-in: zoom-in-95; }
        .slide-in-from-top-2 { --tw-animate-in: slide-in-from-top-2; }
      `}</style>
    </div>
  );
};

export default ReportModal;
