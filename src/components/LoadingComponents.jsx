import React from 'react';

// Spinner Component
export const Spinner = ({ size = 'md', className = '', light = false }) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-10 h-10 border-4',
        xl: 'w-16 h-16 border-4'
    };

    const colorClass = light ? 'border-white/30 border-t-white' : 'border-blue-200 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-500';

    return (
        <div className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClass} ${className}`}></div>
    );
};

// Skeleton Loader for Products
export const ProductSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse h-[280px] flex flex-col">
            <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-auto"></div>
            <div className="flex justify-between items-center mt-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
        </div>
    );
};

// Full Page Loader
export const PageLoader = ({ text = "چاوەڕوانبە...", subtext = "داتاکان دەخوێنرێنەوە" }) => {
    return (
        <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center">
            <Spinner size="xl" />
            <h3 className="mt-6 text-xl font-bold text-gray-800 dark:text-white animate-pulse">{text}</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{subtext}</p>
        </div>
    );
};

// Button Loading State
export const ButtonLoader = ({ isLoading, children, className = '', disabled, ...props }) => {
    return (
        <button
            disabled={isLoading || disabled}
            className={`relative transition-all active:scale-95 disabled:active:scale-100 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            <div className={`flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                {children}
            </div>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner size="sm" light={true} />
                </div>
            )}
        </button>
    );
};
