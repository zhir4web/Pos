import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { usePos } from '../context/PosContext';
import { sound } from '../utils/audioEffects';

export default function Layout({ children, title, subtitle, extraHeaderAction }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [showShortcutsModal, setShowShortcutsModal] = useState(false);
    
    const { 
        settings, 
        updateSettings, 
        currentShift, 
        closeShift, 
        openShift, 
        heldOrders, 
        lowStockCount,
        totalGrossSales
    } = usePos();

    const location = useLocation();

    // Clock
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('ku-IQ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { name: 'کاشێر (POS)', path: '/pos', icon: 'fa-cash-register', badge: heldOrders.length > 0 ? heldOrders.length : null },
        { name: 'داشبۆرد', path: '/dashboard', icon: 'fa-chart-pie' },
        { name: 'کۆگا و کەرەستە', path: '/inventory', icon: 'fa-boxes-stacked', alert: lowStockCount > 0 ? lowStockCount : null },
        { name: 'کڕیاران و قەرز', path: '/customers', icon: 'fa-users' },
        { name: 'مەسرەف و خەرجی', path: '/expenses', icon: 'fa-wallet' },
        { name: 'ڕاپۆرتە داراییەکان', path: '/reports', icon: 'fa-file-invoice-dollar' },
        { name: 'یاریدەدەری AI', path: '/ai-assistant', icon: 'fa-robot', highlight: true },
        { name: 'ڕێکخستنەکان', path: '/settings', icon: 'fa-sliders' },
    ];

    const toggleTheme = () => {
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        updateSettings({ theme: newTheme });
    };

    const toggleSound = () => {
        updateSettings({ soundEnabled: !settings.soundEnabled });
    };

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300" dir="rtl">
            {/* Mobile Menu Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 right-0 z-50 w-64 md:w-60 lg:w-64
                bg-slate-900 dark:bg-slate-900/95 border-l border-slate-800 text-white flex flex-col
                transform transition-all duration-300 ease-in-out md:translate-x-0
                ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full md:translate-x-0'}
            `}>
                {/* Brand Header */}
                <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-xl text-white shadow-lg shadow-orange-600/30">
                            <i className="fas fa-utensils"></i>
                        </div>
                        <div className="overflow-hidden">
                            <h1 className="font-extrabold text-lg tracking-tight text-white truncate">{settings.restaurantName}</h1>
                            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span>سیستەمی پێشکەوتوو</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white p-1"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Shift Quick Status */}
                <div className="px-4 pt-3 pb-1">
                    <button 
                        onClick={() => setShowShiftModal(true)}
                        className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-2.5 flex items-center justify-between text-right transition-all group"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${currentShift.isOpen ? 'bg-emerald-400 ring-4 ring-emerald-400/20' : 'bg-red-400'}`}></div>
                            <div>
                                <p className="text-[11px] text-slate-400">{currentShift.cashierName || 'کاشێر'}</p>
                                <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                                    {currentShift.isOpen ? 'وەجبە کراوەیە' : 'وەجبە داخراوە'}
                                </p>
                            </div>
                        </div>
                        <i className="fas fa-clock-rotate-left text-xs text-slate-400 group-hover:text-white"></i>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    sound.click();
                                }}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-600/25 translate-x-[-2px]'
                                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                                } ${item.highlight && !isActive ? 'border border-amber-500/30 bg-amber-500/10 text-amber-300' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <i className={`fas ${item.icon} w-5 text-center text-base ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`}></i>
                                    <span>{item.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {item.badge && (
                                        <span className="bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full shadow">
                                            {item.badge}
                                        </span>
                                    )}
                                    {item.alert && (
                                        <span className="bg-rose-600 text-white font-bold text-xs px-2 py-0.5 rounded-full animate-bounce">
                                            {item.alert}
                                        </span>
                                    )}
                                </div>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Sidebar Bottom Controls */}
                <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
                    <button
                        onClick={toggleSound}
                        title={settings.soundEnabled ? 'دەنگ کارایە' : 'دەنگ ناچالاکە'}
                        className={`p-2 rounded-lg transition-colors ${settings.soundEnabled ? 'text-amber-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-800'}`}
                    >
                        <i className={`fas ${settings.soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'} text-base`}></i>
                    </button>
                    
                    <button
                        onClick={() => setShowShortcutsModal(true)}
                        title="کورتەبڕەکانی کیبۆرد"
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <i className="fas fa-keyboard text-base"></i>
                    </button>

                    <button
                        onClick={toggleTheme}
                        title="گۆڕینی ڕەنگ (تاریک / ڕووناک)"
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <i className={`fas ${settings.theme === 'dark' ? 'fa-sun text-yellow-400' : 'fa-moon text-blue-300'} text-base`}></i>
                    </button>
                </div>
            </aside>

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Top Header Bar */}
                <header className="h-16 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0 z-10 transition-colors shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                            <i className="fas fa-bars text-lg"></i>
                        </button>
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                {title}
                            </h2>
                            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{subtitle}</p>}
                        </div>
                    </div>

                    {/* Header Right Actions */}
                    <div className="flex items-center gap-3">
                        {extraHeaderAction}

                        {/* Clock Display */}
                        <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <i className="fas fa-clock text-amber-500"></i>
                            <span dir="ltr">{currentTime}</span>
                        </div>

                        {/* Total Sales Counter Pill */}
                        <div className="hidden lg:flex items-center gap-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs font-extrabold">
                            <i className="fas fa-coins"></i>
                            <span>کۆی فرۆش: {totalGrossSales.toLocaleString()} {settings.currency}</span>
                        </div>

                        {/* Quick Shift status button */}
                        <button
                            onClick={() => setShowShiftModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
                        >
                            <i className="fas fa-user-tie text-amber-500"></i>
                            <span className="hidden md:inline">{currentShift.cashierName}</span>
                        </button>
                    </div>
                </header>

                {/* Page Content Container */}
                <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-3 sm:p-4 md:p-6">
                    {children}
                </main>
            </div>

            {/* Shift Modal */}
            {showShiftModal && (
                <ShiftModal
                    isOpen={showShiftModal}
                    onClose={() => setShowShiftModal(false)}
                    currentShift={currentShift}
                    onOpenShift={openShift}
                    onCloseShift={closeShift}
                    settings={settings}
                />
            )}

            {/* Keyboard Shortcuts Modal */}
            {showShortcutsModal && (
                <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />
            )}
        </div>
    );
}

// Shift Modal Component
function ShiftModal({ isOpen, onClose, currentShift, onOpenShift, onCloseShift, settings }) {
    const [cashierName, setCashierName] = useState(currentShift.cashierName || 'کاشێری سەرەکی');
    const [startingCash, setStartingCash] = useState(String(currentShift.startingCash || 50000));
    const [actualCash, setActualCash] = useState('');
    const [showSummary, setShowSummary] = useState(false);
    const [closedSummary, setClosedSummary] = useState(null);

    const handleOpen = (e) => {
        e.preventDefault();
        onOpenShift(cashierName, startingCash);
        onClose();
    };

    const handleClose = (e) => {
        e.preventDefault();
        const summary = onCloseShift(actualCash);
        setClosedSummary(summary);
        setShowSummary(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-pop-in">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-lg">
                            <i className="fas fa-clock-rotate-left"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">بەڕێوەبردنی وەجبەی دەوام</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">سندوق و کاشێری بەرپرسیار</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {showSummary ? (
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                            <i className="fas fa-circle-check text-3xl text-emerald-500 mb-2"></i>
                            <h4 className="font-bold text-emerald-600 dark:text-emerald-400">وەجبەی دەوام بە سەرکەوتوویی داخرا</h4>
                            <p className="text-xs text-slate-500 mt-1">کاتی داخستن: {new Date().toLocaleTimeString('ku-IQ')}</p>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500">کاشێری وەجبە:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{closedSummary?.cashierName}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500">پارەی سەرەتایی سندوق:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{Number(closedSummary?.startingCash).toLocaleString()} {settings.currency}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500">پارەی فیعلی ژمێردراو:</span>
                                <span className="font-bold text-amber-500">{Number(closedSummary?.actualCashCount).toLocaleString()} {settings.currency}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
                        >
                            تەواو
                        </button>
                    </div>
                ) : currentShift.isOpen ? (
                    <form onSubmit={handleClose} className="space-y-4">
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">کاشێری چالاک:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{currentShift.cashierName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">پارەی سەرەتا:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{Number(currentShift.startingCash).toLocaleString()} {settings.currency}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">کاتی دەستپێک:</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300" dir="ltr">{new Date(currentShift.openedAt).toLocaleTimeString('ku-IQ')}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                کۆی پارەی کاشی ناو سندوق (بۆ داخستن)
                            </label>
                            <input
                                type="number"
                                required
                                value={actualCash}
                                onChange={(e) => setActualCash(e.target.value)}
                                placeholder="بڕی پارەی ژمێردراو بنووسە..."
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
                            >
                                پاشگەزبوونەوە
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-rose-600/30"
                            >
                                داخستنی دەوام
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleOpen} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                ناوی کاشێر
                            </label>
                            <input
                                type="text"
                                required
                                value={cashierName}
                                onChange={(e) => setCashierName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                پارەی دەستپێکی سندوق (Float Cash)
                            </label>
                            <input
                                type="number"
                                required
                                value={startingCash}
                                onChange={(e) => setStartingCash(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-600/30"
                        >
                            دەستپێکردنی وەجبەی نوێ
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

// Keyboard Shortcuts Modal
function ShortcutsModal({ onClose }) {
    const shortcuts = [
        { key: 'F1', desc: 'گەڕانی خێرا لە نێو خواردنەکان' },
        { key: 'F2', desc: 'ڕاگرتنی داواکاری لە سەبەتە (Hold Cart)' },
        { key: 'F4', desc: 'سڕینەوە و خاوێنکردنەوەی سەبەتە' },
        { key: 'Enter', desc: 'پارەدانی خێرا و دەرکردنی وەسڵ' },
        { key: 'Esc', desc: 'داخستنی هەموو پەنجەرە و مۆداڵەکان' },
        { key: '1 - 9', desc: 'هەڵبژاردنی بەشەکانی خواردن' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-pop-in">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center text-lg">
                            <i className="fas fa-keyboard"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">کورتەبڕەکانی کیبۆرد</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">بۆ خێرایی زیاتر لە کاتی کارکردندا</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                <div className="space-y-2.5 mb-6">
                    {shortcuts.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{s.desc}</span>
                            <kbd className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-black text-amber-500 shadow-sm">
                                {s.key}
                            </kbd>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
                >
                    داخستن
                </button>
            </div>
        </div>
    );
}
