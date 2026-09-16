import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}
export const ToastMessage = {};

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#34C759] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#FF3B30] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#007AFF] shrink-0" />,
  };

  return (
    <div className="pointer-events-auto bg-white rounded-xl shadow-lg border border-[#E5E5EA] p-3.5 flex items-start gap-3 transform transition-all duration-200 animate-in slide-in-from-bottom-2">
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-[#1D1D1F] tracking-tight">{toast.title}</h4>
        {toast.message && <p className="text-xs text-[#86868B] mt-0.5">{toast.message}</p>}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-[#AEAEB2] hover:text-[#1D1D1F] p-0.5 rounded transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
