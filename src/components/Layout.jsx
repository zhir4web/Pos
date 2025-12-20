import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Layout({ children, title }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'POS (کاشێر)', path: '/pos', icon: 'fa-cash-register' },
        { name: 'داشبۆرد', path: '/dashboard', icon: 'fa-chart-pie' },
        { name: 'ڕاپۆرتەکان', path: '/reports', icon: 'fa-file-invoice-dollar' },
        { name: 'ڕێکخستنەکان', path: '/settings', icon: 'fa-cog' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-serif transition-colors duration-300" dir="rtl">
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Desktop always visible, Mobile slideover */}
            <aside className={`
                fixed md:static inset-y-0 right-0 z-50 w-64 
                bg-slate-900 dark:bg-black text-white flex-col border-l border-slate-800 dark:border-gray-800
                transform transition-transform duration-300 md:translate-x-0
                ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
                md:flex
            `}>
                <div className="p-6 border-b border-slate-800 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl shadow-lg shadow-blue-900/50">
                            <i className="fas fa-utensils"></i>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-wide text-white">شەهلا خان</h1>
                            <p className="text-xs text-slate-400">خواردمەنی</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white"
                    >
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20 translate-x-1'
                                    : 'text-slate-300 hover:bg-slate-800 dark:hover:bg-gray-800 hover:text-white'
                                }`
                            }
                        >
                            <i className={`fas ${item.icon} w-6 text-center text-lg`}></i>
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 flex-shrink-0 h-16 flex items-center justify-between px-6 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                        >
                            <i className="fas fa-bars text-xl"></i>
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
                    </div>

                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
}
