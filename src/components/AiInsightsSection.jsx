import React, { useMemo } from 'react';
import { useSales } from '../context/SalesContext';
import { calculateWeeklyInsights } from '../utils/aiAnalytics';

const InsightCard = ({ title, icon, color, children, delay }) => (
    <div
        className={`bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 animate-fade-in-up`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-xl shadow-lg`}>
                <i className={`fas ${icon}`}></i>
            </div>
            <h3 className="font-bold text-gray-800 dark:text-white text-lg">{title}</h3>
        </div>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

export default function AiInsightsSection() {
    const { transactions, products } = useSales();

    const insights = useMemo(() => {
        return calculateWeeklyInsights(transactions, products);
    }, [transactions, products]);

    if (!insights) return (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="animate-spin text-blue-500 text-3xl mb-3"><i className="fas fa-circle-notch"></i></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">جارکردنی شیکاری AI...</p>
        </div>
    );

    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] p-6 lg:p-8 mb-8 border border-white dark:border-gray-800 shadow-sm relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
                <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                            <i className="fas fa-sparkles text-yellow-500 animate-pulse"></i>
                            شیکاری ژیرانەی AI
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">پوختەی هەفتانە و پێشنیارەکان بۆ باشترکردنی فرۆش</p>
                    </div>
                    {/* Badge */}
                    <div className="hidden md:flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">نوێکراوەتەوە</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* 1. Best Selling */}
                    <InsightCard title="پڕفرۆشترینەکان" icon="fa-trophy" color="bg-gradient-to-br from-yellow-400 to-orange-500 text-white" delay={0}>
                        {insights.bestSellers.length > 0 ? (
                            insights.bestSellers.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700/50 last:border-0 pb-2 last:pb-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {idx + 1}
                                        </span>
                                        <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-black text-gray-800 dark:text-white">{item.count}</span>
                                        <span className="text-[10px] text-gray-400">{item.percentage}%</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-400 dark:text-gray-500">
                                <i className="fas fa-chart-bar text-3xl mb-2 opacity-50"></i>
                                <p className="text-xs">هیچ داتایەک نییە</p>
                            </div>
                        )}
                    </InsightCard>

                    {/* 3. Peak Hours - Only show if enough data exists */}
                    <InsightCard title="کاتە قەرەباڵغەکان" icon="fa-clock" color="bg-gradient-to-br from-purple-400 to-pink-500 text-white" delay={100}>
                        {insights.peakHours.hasEnoughData ? (
                            <>
                                <div className="text-center py-2">
                                    <span className="block text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-1">
                                        {insights.peakHours.range}
                                    </span>
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">کاتژمێر</span>
                                </div>
                                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                                    <strong className="text-purple-600 dark:text-purple-400">{insights.peakHours.percentage}%</strong> لە داواکارییەکان لەم کاتەدان
                                </p>
                            </>
                        ) : (
                            <div className="text-center py-4 text-gray-400 dark:text-gray-500">
                                <i className="fas fa-hourglass-half text-3xl mb-2 opacity-50"></i>
                                <p className="text-xs">پێویستی بە ٣ ڕۆژ داتایە...</p>
                            </div>
                        )}
                    </InsightCard>

                    {/* 5. Product Combo */}
                    {insights.combo ? (
                        <InsightCard title="جوتە بەهێزەکان" icon="fa-handshake" color="bg-gradient-to-br from-red-400 to-pink-500 text-white" delay={200}>
                            <div className="flex items-center justify-center gap-3 py-2">
                                <div className="text-center">
                                    <div className="w-10 h-10 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg mb-1 shadow-sm">🍔</div>
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 block truncate w-16">{insights.combo.p1}</span>
                                </div>
                                <i className="fas fa-plus text-gray-300"></i>
                                <div className="text-center">
                                    <div className="w-10 h-10 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg mb-1 shadow-sm">🥤</div>
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 block truncate w-16">{insights.combo.p2}</span>
                                </div>
                            </div>
                            <div className="text-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs py-1 rounded-lg font-bold">
                                {insights.combo.count} جار پێکەوە کڕدراون
                            </div>
                        </InsightCard>
                    ) : (
                        <InsightCard title="جوتە بەهێزەکان" icon="fa-handshake" color="bg-gradient-to-br from-gray-400 to-gray-500 text-white" delay={200}>
                            <div className="text-center py-4 text-gray-400 dark:text-gray-500">
                                <i className="fas fa-link text-3xl mb-2 opacity-50"></i>
                                <p className="text-xs">هیچ جوتێک نەدۆزرایەوە</p>
                            </div>
                        </InsightCard>
                    )}

                    {/* 6. Day Stats */}
                    <InsightCard title="باشترین ڕۆژ" icon="fa-calendar-check" color="bg-gradient-to-br from-indigo-400 to-blue-500 text-white" delay={300}>
                        {insights.dayStats.bestTotal > 0 ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="block text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-1">{insights.dayStats.bestDay}</span>
                                    <span className="text-xs text-gray-500 font-medium">پڕداهاتترین ڕۆژ</span>
                                </div>
                                {/* Only show worst day if we have multiple days of data, otherwise it's redundant/confusing */}
                                {insights.dayStats.hasMultipleDays && (
                                    <div className="text-right">
                                        <span className="block text-xs text-red-500 font-bold mb-1">خراپترین</span>
                                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{insights.dayStats.worstDay}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-400 dark:text-gray-500">
                                <i className="fas fa-calendar-day text-3xl mb-2 opacity-50"></i>
                                <p className="text-xs">چاوەڕوانی فرۆشتنە...</p>
                            </div>
                        )}
                    </InsightCard>

                </div>
            </div>
        </div>
    );
}
