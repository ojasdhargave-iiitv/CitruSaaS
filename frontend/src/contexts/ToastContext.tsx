import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastIcon = ({ type }: { type: ToastType }) => {
  const getIconColor = () => {
    switch (type) {
      case 'success': return '#1b753cff'; 
      case 'error': return '#ef4444'; 
      case 'info': return '#3b82f6';
      case 'warning': return '#f59e0b';
    }
  };

  return (
    <div style={{
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      {type === 'success' && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={getIconColor()} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      )}
      {type === 'error' && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={getIconColor()} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      )}
      {(type === 'info' || type === 'warning') && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={getIconColor()} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" opacity="0"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      )}
    </div>
  );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getStyleVars = (type: ToastType) => {
    switch (type) {
      case 'success': return { bg: '#26904dff', progress: '#86efac', title: 'Success!' };
      case 'error': return { bg: '#ef4444', progress: '#fca5a5', title: 'Error!' };
      case 'info': return { bg: '#3b82f6', progress: '#93c5fd', title: 'Info!' };
      case 'warning': return { bg: '#f59e0b', progress: '#fcd34d', title: 'Warning!' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '400px',
          maxWidth: '90vw'
        }}
      >
        {toasts.map((toast) => {
          const styleVars = getStyleVars(toast.type);
          
          return (
            <div
              key={toast.id}
              style={{
                position: 'relative',
                backgroundColor: styleVars.bg,
                color: '#fff',
                borderRadius: '6px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                animation: 'toastSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', padding: '16px', paddingRight: '40px', gap: '16px', alignItems: 'flex-start' }}>
                <ToastIcon type={toast.type} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '0.3px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    {styleVars.title}
                  </span>
                  <span style={{ fontSize: '15px', lineHeight: '1.4', opacity: 0.95, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    {toast.message}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => removeToast(toast.id)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  opacity: 0.7,
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.2s',
                  outline: 'none'
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseOut={(e) => (e.currentTarget.style.opacity = '0.7')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              {/* Progress bar */}
              <div 
                style={{
                  height: '6px',
                  backgroundColor: styleVars.progress,
                  width: '100%',
                  animation: 'progressBar 4s linear forwards',
                  transformOrigin: 'left'
                }}
              />
            </div>
          );
        })}
        <style>
          {`
            @keyframes toastSlideIn {
              from { transform: translateX(120%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes progressBar {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}
        </style>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
