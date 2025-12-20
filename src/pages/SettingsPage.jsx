import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function SettingsPage() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Check local storage or preference
        const isDark = localStorage.getItem('theme') === 'dark';
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <Layout title="ڕێکخستنەکان">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Appearance Section */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <i className="fas fa-paint-brush text-blue-500"></i>
                        رووکار و دیزاین
                    </h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800">دۆخی تاریک (Dark Mode)</h3>
                            <p className="text-sm text-gray-500">گۆڕینی ڕەنگی سیستەم بۆ دۆخی شەو</p>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`w-14 h-8 rounded-full flex items-center padding-1 transition-colors duration-300 ${darkMode ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'}`}
                        >
                            <div className="w-6 h-6 bg-white rounded-full mx-1 shadow-md"></div>
                        </button>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <i className="fas fa-headset text-green-500"></i>
                        پەیوەندی و پشتیوانی
                    </h2>
                    <p className="text-gray-600 mb-4">لە کاتی بوونی هەر کێشەیەک، تکایە پەیوەندی بکەن بە:</p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <i className="fas fa-phone text-blue-500"></i>
                            <span className="font-bold text-gray-700" dir="ltr">+964 770 123 4567</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <i className="fas fa-envelope text-red-500"></i>
                            <span className="font-bold text-gray-700">support@myxelvo.com</span>
                        </div>
                    </div>
                </div>

                {/* Team Info */}
                <div className="text-center pt-8 border-t border-gray-200">
                    <div className="inline-block bg-slate-900 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-2">
                        MYXELVO TEAM
                    </div>
                    <p className="text-gray-500 text-sm">
                        پەرەپێدراوە لەلایەن تیمی مایکسێڤلۆ <br />
                        © 2025 هەموو مافێکی پارێزراوە
                    </p>
                </div>

            </div>
        </Layout>
    );
}
