import React, { useEffect } from 'react';

// Toast Notification
export const Toast = ({ type = 'info', message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const types = {
        success: { icon: 'fa-check-circle', color: 'bg-green-500', border: 'border-green-600' },
        error: { icon: 'fa-times-circle', color: 'bg-red-500', border: 'border-red-600' },
        warning: { icon: 'fa-exclamation-circle', color: 'bg-yellow-500', border: 'border-yellow-600' },
        info: { icon: 'fa-info-circle', color: 'bg-blue-500', border: 'border-blue-600' }
    };

    const style = types[type] || types.info;

    return (
        <div className={`flex items-center gap-3 w-80 p-4 mb-3 text-white rounded-xl shadow-lg transform transition-all animate-slide-in pointer-events-auto ${style.color} ${style.border} border-l-4`}>
            <i className={`fas ${style.icon} text-lg`}></i>
            <p className="text-sm font-semibold flex-1">{message}</p>
            <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
};

// Empty State
export const EmptyState = ({ icon = "fa-box-open", title, message, action }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px] text-gray-400 dark:text-gray-500">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                <i className={`fas ${icon} text-4xl`}></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{title}</h3>
            <p className="max-w-xs mx-auto mb-6">{message}</p>
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
};

// Inline Error Message
export const InlineError = ({ message }) => {
    if (!message) return null;
    return (
        <div className="flex items-center gap-2 mt-1 text-red-500 text-xs font-bold animate-shake">
            <i className="fas fa-exclamation-circle"></i>
            <span>{message}</span>
        </div>
    );
};

// Error Boundary Fallback
export const ErrorFallback = ({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-4">
            <i className="fas fa-frown text-6xl text-gray-400 mb-6"></i>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">هەڵەیەک ڕوویدا!</h1>
            <p className="text-gray-500 mb-6">Something went wrong</p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-left text-xs text-red-500 mb-6 max-w-lg overflow-auto">
                {error.message}
            </pre>
            <button
                onClick={resetErrorBoundary}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
            >
                <i className="fas fa-redo mr-2"></i>
                دووبارە هەوڵبدەرەوە
            </button>
        </div>
    );
};
