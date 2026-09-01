import React, { useState } from 'react';
import Layout from '../components/Layout';
import { usePos } from '../context/PosContext';
import { useUI } from '../context/UIContext';
import { sound } from '../utils/audioEffects';

export default function SettingsPage() {
    const { 
        settings, 
        updateSettings, 
        resetToFactoryData, 
        exportDataAsJson, 
        importDataFromJson 
    } = usePos();
    const { addToast } = useUI();

    const [form, setForm] = useState({ ...settings });
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        updateSettings(form);
        addToast('ڕێکخستنەکان بە سەرکەوتوویی پاشەکەوت کران', 'success');
    };

    const handleFileImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                const res = importDataFromJson(parsed);
                if (res.success) {
                    addToast('داتاکان بە سەرکەوتوویی هاوردەکران!', 'success');
                } else {
                    addToast('هەڵە لە فایلی داتادا هەیە', 'error');
                }
            } catch (err) {
                addToast('نەتوانرا فایلی JSON بخوێندرێتەوە', 'error');
            }
        };
        reader.readAsText(file);
    };

    const handleTestSound = () => {
        sound.cashRegister();
    };

    return (
        <Layout 
            title="ڕێکخستنەکانی سیستەم" 
            subtitle="زانیاری چێشتخانە، چاپکەری وەسڵ، پاشەکەوتی داتا (Backup) و ڕووکار"
        >
            <div className="max-w-4xl mx-auto space-y-6">
                
                <form onSubmit={handleSave} className="space-y-6">
                    
                    {/* 1. Restaurant Profile */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-lg">
                                <i className="fas fa-store"></i>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">ناسنامەی چێشتخانە و چاپ</h3>
                                <p className="text-xs text-slate-400">ئەم زانیارییانە لە سەرەوەی وەسڵە چاپکراوەکان دەردەکەون</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">ناوی چێشتخانە (کوردی)</label>
                                <input
                                    type="text"
                                    required
                                    value={form.restaurantName}
                                    onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">ناوی چێشتخانە (ئینگلیزی)</label>
                                <input
                                    type="text"
                                    value={form.restaurantNameEn}
                                    onChange={(e) => setForm({ ...form, restaurantNameEn: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">ژمارەی تەلەفۆن بۆ گەیاندن</label>
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">دراوی سەرەکی</label>
                                <select
                                    value={form.currency}
                                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="د.ع">دیناری عێراقی (د.ع)</option>
                                    <option value="$">دۆلاری ئەمریکی ($)</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">ناونیشانی تەواوی شوێن</label>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Hardware & Print Settings */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center text-lg">
                                <i className="fas fa-print"></i>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">ڕێکخستنی چاپکەر و دەنگ</h3>
                                <p className="text-xs text-slate-400">تایبەتمەندییەکانی پرینتەری گەرمی (POS Thermal Printer)</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">قەبارەی کاغەزی چاپکەر</label>
                                <select
                                    value={form.printerWidth}
                                    onChange={(e) => setForm({ ...form, printerWidth: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="80mm">80mm (ستانداردی چێشتخانە)</option>
                                    <option value="58mm">58mm (بچووک / گەیاندن)</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                <div>
                                    <span className="font-bold text-slate-900 dark:text-white block">دەنگی سیستەم (Sound Effects)</span>
                                    <span className="text-[11px] text-slate-400">دەنگی کلیک و سندوقی کاشێر</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleTestSound}
                                        className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200"
                                    >
                                        تاقیکردنەوە 🔊
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, soundEnabled: !form.soundEnabled })}
                                        className={`w-12 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                                            form.soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                                        }`}
                                    >
                                        <div className="w-5 h-5 rounded-full bg-white shadow-md"></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-sm transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-floppy-disk"></i>
                        <span>پاشەکەوتکردنی هەموو ڕێکخستنەکان</span>
                    </button>
                </form>

                {/* 3. Database Backup & Restore */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-lg">
                            <i className="fas fa-database"></i>
                        </div>
                        <div>
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">پاشەکەوت و گەڕاندنەوەی داتا (Backup & Restore)</h3>
                            <p className="text-xs text-slate-400">داگرتنی هەموو فرۆش، کۆگا و کڕیاران وەک فایلی پارێزراوی JSON</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
                            <div>
                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">داگرتنی نسخیەی یەدەگ (Backup)</h4>
                                <p className="text-slate-500 text-[11px] mt-1">
                                    هەموو فرۆش، کڕیاران، کۆگا و ڕێکخستنەکان لە یەک فایلی JSON پاشەکەوت بکە.
                                </p>
                            </div>
                            <button
                                onClick={exportDataAsJson}
                                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center justify-center gap-2 shadow"
                            >
                                <i className="fas fa-download"></i>
                                <span>داگرتنی فایلی Backup</span>
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
                            <div>
                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">هاوردەکردنی داتا (Restore)</h4>
                                <p className="text-slate-500 text-[11px] mt-1">
                                    گەڕاندنەوەی داتا لە فایلی پێشووی پاشەکەوتکراو.
                                </p>
                            </div>
                            <label className="w-full py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow">
                                <i className="fas fa-upload"></i>
                                <span>هەڵبژاردنی فایل بۆ هاوردەکردن</span>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileImport}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* 4. Reset & Clear All Data */}
                <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-3xl space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-black text-rose-600 dark:text-rose-400 text-sm">سڕینەوە و سفرکردنەوەی هەموو داتاکان (Clear All Data)</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                سڕینەوەی هەموو خواردنەکان، کۆگا، قەرزەکان، فرۆش و مەسرەفەکان بۆ دەستپێکردن لە سفرەوە.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                        >
                            <i className="fas fa-trash-can"></i>
                            <span>سڕینەوەی هەموو داتاکان</span>
                        </button>
                    </div>
                </div>

            </div>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-pop-in text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-2xl mx-auto">
                            <i className="fas fa-triangle-exclamation"></i>
                        </div>
                        <h3 className="font-black text-base text-slate-900 dark:text-white">دڵنیایت لە سڕینەوەی هەموو داتاکان؟</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            ئەم کردارە هەموو مینوو، کۆگا، کڕیاران و فرۆشەکان دەسڕێتەوە و دەیکاتەوە بە سفر.
                        </p>
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs"
                            >
                                پاشگەزبوونەوە
                            </button>
                            <button
                                onClick={() => {
                                    resetToFactoryData();
                                    setShowResetConfirm(false);
                                    window.location.reload();
                                }}
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow"
                            >
                                بەڵێ، هەمووی بسڕەوە
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
