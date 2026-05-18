import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
};

const STYLES = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error:   'bg-red-50 border-red-200 text-red-700',
};

const ICON_STYLES = {
  success: 'text-green-500',
  error:   'text-red-500',
};

const ToastItem = ({ toast, onRemove }) => {
  const Icon = ICONS[toast.type] || CheckCircle;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg min-w-[240px] max-w-[320px]',
        'animate-in slide-in-from-bottom-4 duration-300',
        STYLES[toast.type] || STYLES.success
      )}
    >
      <Icon size={18} className={cn('flex-shrink-0', ICON_STYLES[toast.type] || ICON_STYLES.success)} />
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-0.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-16 left-0 right-0 flex flex-col items-center gap-2 z-[100] px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
