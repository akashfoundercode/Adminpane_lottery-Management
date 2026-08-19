import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'success' | 'info';
  children?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  children
}) => {
  if (!isOpen) return null;

  let btnColor = 'bg-brand-emerald hover:bg-brand-emerald-hover text-white';
  if (type === 'danger') {
    btnColor = 'bg-danger-main hover:bg-red-700 text-white';
  } else if (type === 'warning') {
    btnColor = 'bg-warning-main hover:bg-amber-600 text-white';
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md overflow-hidden rounded-xl border border-border-light bg-white p-6 shadow-xl z-10"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {type === 'warning' || type === 'danger' ? (
                <div className={`p-2 rounded-lg ${type === 'danger' ? 'bg-red-50 text-danger-main' : 'bg-amber-50 text-warning-main'}`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
              ) : null}
              <h3 className="text-lg font-semibold text-text-primary leading-none">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-3 text-sm text-text-secondary">{description}</p>

          {children && <div className="mt-4">{children}</div>}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary bg-white border border-border-light rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${btnColor}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default ConfirmationModal;
