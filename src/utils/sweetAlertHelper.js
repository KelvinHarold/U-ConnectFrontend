// src/utils/sweetAlertHelper.js
// Centralized SweetAlert2 utility for confirmation and alert dialogs
// Toast notifications remain handled by the existing ToastContext

import Swal from 'sweetalert2';

// Custom theme matching the app's brown/warm color palette
const themeColors = {
  primary: '#5C352C',
  primaryDark: '#4A2A22',
  primaryLight: '#8B5E4F',
  danger: '#ef4444',
  dangerDark: '#dc2626',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
};

/**
 * Show a styled confirmation dialog (replaces window.confirm)
 * @param {Object} options
 * @param {string} options.title - Dialog title
 * @param {string} options.text - Dialog message
 * @param {string} [options.icon='warning'] - Icon type: 'warning', 'question', 'info', 'error', 'success'
 * @param {string} [options.confirmButtonText='Yes, proceed'] - Confirm button label
 * @param {string} [options.cancelButtonText='Cancel'] - Cancel button label
 * @param {string} [options.confirmButtonColor] - Override confirm button color
 * @param {boolean} [options.dangerMode=false] - If true, uses red/danger styling
 * @returns {Promise<boolean>} - true if confirmed, false otherwise
 */
export const confirmAlert = async ({
  title = 'Are you sure?',
  text = '',
  icon = 'warning',
  confirmButtonText = 'Yes, proceed',
  cancelButtonText = 'Cancel',
  confirmButtonColor,
  dangerMode = false,
}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: confirmButtonColor || (dangerMode ? themeColors.danger : themeColors.primary),
    cancelButtonColor: '#6b7280',
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: dangerMode,
    customClass: {
      popup: 'swal-custom-popup',
      title: 'swal-custom-title',
      htmlContainer: 'swal-custom-text',
      confirmButton: 'swal-custom-confirm',
      cancelButton: 'swal-custom-cancel',
    },
    showClass: { popup: 'swal2-show swal-pop-in' },
    hideClass: { popup: 'swal2-hide swal-pop-out' },
  });

  return result.isConfirmed;
};

/**
 * Show a styled alert dialog (replaces window.alert)
 * @param {Object} options
 * @param {string} options.title - Dialog title
 * @param {string} [options.text] - Dialog message
 * @param {string} [options.icon='info'] - Icon type
 * @param {string} [options.confirmButtonText='OK'] - Button label
 * @returns {Promise<void>}
 */
export const showAlert = async ({
  title,
  text = '',
  icon = 'info',
  confirmButtonText = 'OK',
}) => {
  await Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: themeColors.primary,
    confirmButtonText,
    customClass: {
      popup: 'swal-custom-popup',
      title: 'swal-custom-title',
      htmlContainer: 'swal-custom-text',
      confirmButton: 'swal-custom-confirm',
    },
    showClass: { popup: 'swal2-show swal-pop-in' },
    hideClass: { popup: 'swal2-hide swal-pop-out' },
  });
};

/**
 * Show a success alert
 */
export const successAlert = async (title, text = '') => {
  await showAlert({ title, text, icon: 'success' });
};

/**
 * Show an error alert
 */
export const errorAlert = async (title, text = '') => {
  await showAlert({ title, text, icon: 'error' });
};

/**
 * Show a styled password reset prompt (replaces window.prompt for password reset)
 * Uses a two-step SweetAlert2 flow: enter password, then confirm password.
 * @param {string} userName - The name of the user whose password is being reset
 * @param {Object} [strings] - Localized strings for the prompt
 * @returns {Promise<{password: string, password_confirmation: string}|null>} - Passwords or null if cancelled
 */
export const passwordResetPrompt = async (userName, strings = {}) => {
  const s = {
    title: strings.title || 'Reset Password',
    text: (strings.text || 'Enter new password for {userName} (min 8 characters)').replace('{userName}', userName),
    inputPlaceholder: strings.inputPlaceholder || 'Enter new password',
    nextButton: strings.nextButton || 'Next',
    cancelButton: strings.cancelButton || 'Cancel',
    passwordRequired: strings.passwordRequired || 'Password is required',
    passwordMinLength: strings.passwordMinLength || 'Password must be at least 8 characters',
    confirmTitle: strings.confirmTitle || 'Confirm Password',
    confirmText: strings.confirmText || 'Re-enter the password to confirm',
    confirmPlaceholder: strings.confirmPlaceholder || 'Confirm new password',
    resetButton: strings.resetButton || 'Reset Password',
    passwordMismatch: strings.passwordMismatch || 'Passwords do not match',
    pleaseConfirm: strings.pleaseConfirm || 'Please confirm the password',
    ...strings
  };

  // Step 1: Enter new password
  const { value: newPassword } = await Swal.fire({
    title: s.title,
    text: s.text,
    input: 'password',
    inputPlaceholder: s.inputPlaceholder,
    inputAttributes: {
      minlength: 8,
      autocapitalize: 'off',
      autocorrect: 'off',
    },
    showCancelButton: true,
    confirmButtonColor: themeColors.primary,
    cancelButtonColor: '#6b7280',
    confirmButtonText: s.nextButton,
    cancelButtonText: s.cancelButton,
    reverseButtons: true,
    customClass: {
      popup: 'swal-custom-popup',
      title: 'swal-custom-title',
      htmlContainer: 'swal-custom-text',
      confirmButton: 'swal-custom-confirm',
      cancelButton: 'swal-custom-cancel',
      input: 'swal-custom-input',
    },
    showClass: { popup: 'swal2-show swal-pop-in' },
    hideClass: { popup: 'swal2-hide swal-pop-out' },
    inputValidator: (value) => {
      if (!value) return s.passwordRequired;
      if (value.length < 8) return s.passwordMinLength;
      return null;
    },
  });

  if (!newPassword) return null;

  // Step 2: Confirm password
  const { value: confirmPassword } = await Swal.fire({
    title: s.confirmTitle,
    text: s.confirmText,
    input: 'password',
    inputPlaceholder: s.confirmPlaceholder,
    inputAttributes: {
      minlength: 8,
      autocapitalize: 'off',
      autocorrect: 'off',
    },
    showCancelButton: true,
    confirmButtonColor: themeColors.primary,
    cancelButtonColor: '#6b7280',
    confirmButtonText: s.resetButton,
    cancelButtonText: s.cancelButton,
    reverseButtons: true,
    customClass: {
      popup: 'swal-custom-popup',
      title: 'swal-custom-title',
      htmlContainer: 'swal-custom-text',
      confirmButton: 'swal-custom-confirm',
      cancelButton: 'swal-custom-cancel',
      input: 'swal-custom-input',
    },
    showClass: { popup: 'swal2-show swal-pop-in' },
    hideClass: { popup: 'swal2-hide swal-pop-out' },
    inputValidator: (value) => {
      if (!value) return s.pleaseConfirm;
      if (value !== newPassword) return s.passwordMismatch;
      return null;
    },
  });

  if (!confirmPassword) return null;

  return { password: newPassword, password_confirmation: confirmPassword };
};

// Inject custom CSS for SweetAlert theme
const injectStyles = () => {
  if (document.querySelector('#swal-custom-styles')) return;

  const style = document.createElement('style');
  style.id = 'swal-custom-styles';
  style.textContent = `
    .swal-custom-popup {
      border-radius: 14px !important;
      font-family: inherit !important;
      padding: 1.25rem 1.25rem 1rem !important;
      max-width: 340px !important;
      width: 90% !important;
    }
    .swal-pop-in {
      animation: swal-pop-in 0.2s ease-out !important;
    }
    .swal-pop-out {
      animation: swal-pop-out 0.15s ease-in !important;
    }
    @keyframes swal-pop-in {
      0% { transform: scale(0.9); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes swal-pop-out {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(0.9); opacity: 0; }
    }
    .swal-custom-title {
      font-size: 1.05rem !important;
      font-weight: 700 !important;
      color: #1f2937 !important;
      padding: 0 !important;
      margin-bottom: 0.15rem !important;
    }
    .swal-custom-text {
      font-size: 0.8rem !important;
      color: #6b7280 !important;
      margin: 0 !important;
      padding: 0 0.25rem !important;
    }
    .swal-custom-confirm {
      border-radius: 8px !important;
      font-weight: 600 !important;
      padding: 0.4rem 1.2rem !important;
      font-size: 0.8rem !important;
    }
    .swal-custom-cancel {
      border-radius: 8px !important;
      font-weight: 600 !important;
      padding: 0.4rem 1.2rem !important;
      font-size: 0.8rem !important;
    }
    .swal-custom-input {
      border-radius: 8px !important;
      border: 1.5px solid #d1d5db !important;
      font-size: 0.8rem !important;
      padding: 0.45rem 0.65rem !important;
    }
    .swal-custom-input:focus {
      border-color: #5C352C !important;
      box-shadow: 0 0 0 2px rgba(92, 53, 44, 0.15) !important;
    }
    .swal2-popup .swal2-icon {
      margin: 0.25rem auto 0.35rem !important;
      width: 2.5rem !important;
      height: 2.5rem !important;
      border-width: 3px !important;
    }
    .swal2-popup .swal2-icon .swal2-icon-content {
      font-size: 1.5rem !important;
    }
    .swal2-popup .swal2-icon.swal2-warning .swal2-icon-content,
    .swal2-popup .swal2-icon.swal2-info .swal2-icon-content {
      font-size: 1.6rem !important;
    }
    .swal2-popup .swal2-icon .swal2-x-mark-line-left,
    .swal2-popup .swal2-icon .swal2-x-mark-line-right {
      width: 1.5rem !important;
      top: 1.1rem !important;
    }
    .swal2-popup .swal2-icon.swal2-success [class^='swal2-success-line'] {
      height: 3px !important;
    }
    .swal2-popup .swal2-icon.swal2-success .swal2-success-line-long {
      width: 1.3rem !important;
      top: 1.35rem !important;
      right: 0.35rem !important;
    }
    .swal2-popup .swal2-icon.swal2-success .swal2-success-line-tip {
      width: 0.65rem !important;
      top: 1.5rem !important;
      left: 0.35rem !important;
    }
    .swal2-popup .swal2-icon.swal2-success .swal2-success-ring {
      width: 2.5rem !important;
      height: 2.5rem !important;
      border-width: 3px !important;
    }
    .swal2-popup .swal2-actions {
      margin-top: 0.6rem !important;
      padding: 0 !important;
      gap: 0.5rem !important;
    }
    .swal2-popup .swal2-validation-message {
      font-size: 0.75rem !important;
      margin: 0.25rem 0 0 !important;
      padding: 0.3rem 0.6rem !important;
    }
  `;
  document.head.appendChild(style);
};

// Auto-inject styles when module loads
injectStyles();

export default { confirmAlert, showAlert, successAlert, errorAlert, passwordResetPrompt };
