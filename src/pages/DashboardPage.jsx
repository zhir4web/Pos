import React, { useState } from 'react';
import Layout from '../components/Layout';
import { usePos } from '../context/PosContext';
import AiInsightsSection from '../components/AiInsightsSection';
import ReceiptModal from '../components/ReceiptModal';

export default function DashboardPage() {
    const { 
        transactions, 
        todaySales, 
        todayOrdersCount, 
        totalGrossSales, 
        totalTransactionsCount,
        totalExpensesAmount,
        netProfit,
        totalOutstandingDebt,
        lowStockCount,
        settings 
    } = usePos();

    const [selectedTx, setSelectedTx] = useState(null);
    const [chartPeriod, setChartPeriod] = useState('weekly'); // 'weekly' | 'hourly'

    const recentOrders = transactions.slice(0, 6);

    const stats = [
        { 
            title: 'فرۆشی ئەمڕۆ', 
            value: `${todaySales.toLocaleString()} ${settings.currency}`, 
            sub: `${todayOrdersCount} داواکاری`,
            icon: 'fa-coins', 
            color: 'from-emerald-500 to-teal-600',
            textColor: 'text-emerald-500'
        },
        { 
            title: 'کۆی فرۆشی گشتی', 
            value: `${totalGrossSales.toLocaleString()} ${settings.currency}`, 
            sub: `${totalTransactionsCount} داواکاری تەواو`,
            icon: 'fa-chart-line', 
            color: 'from-blue-500 to-indigo-600',
            textColor: 'text-blue-500'
        },
        { 
            title: 'قازانجی پوخت (Net Profit)', 
            value: `${netProfit.toLocaleString()} ${settings.currency}`, 
            sub: `دوای لێدەرکردنی تێچوو و مەسرەف`,
            icon: 'fa-sack-dollar', 
            color: 'from-amber-500 to-orange-600',
            textColor: 'text-amber-500'
        },
        { 
            title: 'کۆی قەرز لە بازاڕ', 
            value: `${totalOutstandingDebt.toLocaleString()} ${settings.currency}`, 
            sub: 'قەرزی کۆکراوەی کڕیاران',
            icon: 'fa-hand-holding-dollar', 
            color: 'from-rose-500 to-red-600',
            textColor: 'text-rose-500'
        },
    ];

    // Weekly sales mock heights for smooth visualization
    const days = ['شەممە', 'یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی'];
    const barHeights = [45, 60, 55, 80, 75, 95, 88];

    return (
        <Layout 
            title="داشبۆردی سەرەکی" 
            subtitle="پوختەی دارایی، ئاماری فرۆش، چارتەکان و دواین داواکارییەکان"
        >
            <div className="space-y-6">
                
                {/* Stats Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 flex items-center justify-between"
                        >
                            <div>
                                <p className="text-xs font-bold text-slate-400">{stat.title}</p>
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                                    {stat.value}
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-1 font-medium">{stat.sub}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${stat.color} text-white flex items-center justify-center text-xl shadow-lg flex-shrink-0`}>
                                <i className={`fas ${stat.icon}`}></i>
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Insights Bar */}
                <AiInsightsSection />

                {/* Charts & Recent Orders Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Weekly Sales Chart (8 Cols) */}
                    <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center text-base">
                                    <i className="fas fa-chart-simple"></i>
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">ڕەوتی فرۆشی حەفتانە</h3>
                                    <p className="text-xs text-slate-400">بەراوردی فرۆشی ٧ ڕۆژی ڕابردوو</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                                <button
                                    onClick={() => setChartPeriod('weekly')}
                                    className={`px-3 py-1 rounded-lg transition-colors ${chartPeriod === 'weekly' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow' : 'text-slate-500'}`}
                                >
                                    حەفتانە
                                </button>
                                <button
                                    onClick={() => setChartPeriod('hourly')}
                                    className={`px-3 py-1 rounded-lg transition-colors ${chartPeriod === 'hourly' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow' : 'text-slate-500'}`}
                                >
                                    مانگانە
                                </button>
                            </div>
                        </div>

                        {/* Bar Chart Visualization */}
                        <div className="h-64 flex items-end justify-between gap-3 px-2 pt-6">
                            {days.map((day, idx) => {
                                const height = barHeights[idx];
                                const isPeak = height === Math.max(...barHeights);
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-amber-500 mb-1">
                                            {height * 1500} {settings.currency}
                                        </span>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-2xl h-full flex items-end p-1">
                                            <div
                                                style={{ height: `${height}%` }}
                                                className={`w-full rounded-xl transition-all duration-700 ${
                                                    isPeak 
                                                        ? 'bg-gradient-to-t from-amber-500 to-orange-500 shadow-lg shadow-orange-500/30' 
                                                        : 'bg-gradient-to-t from-blue-500 to-indigo-500 group-hover:from-amber-400 group-hover:to-orange-500'
                                                }`}
                                            ></div>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-full text-center">
                                            {day}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Orders List (4 Cols) */}
                    <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <i className="fas fa-clock-rotate-left text-amber-500"></i>
                                <span>دواین داواکارییەکان</span>
                            </h3>
                            <a href="#/reports" className="text-xs font-bold text-amber-500 hover:underline">
                                هەمووی
                            </a>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2.5">
                            {recentOrders.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <i className="fas fa-receipt text-3xl mb-2 opacity-30"></i>
                                    <p className="text-xs font-bold">هیچ فرۆشتنێک تۆمار نەکراوە</p>
                                </div>
                            ) : (
                                recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        onClick={() => setSelectedTx(order)}
                                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 font-mono font-bold text-xs flex items-center justify-center">
                                                {String(order.id).slice(-2)}
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-[120px]">
                                                    {order.items.split(',')[0]}
                                                </h4>
                                                <p className="text-[10px] text-slate-400 font-mono" dir="ltr">{order.time}</p>
                                            </div>
                                        </div>

                                        <div className="text-left">
                                            <span className="block font-black font-mono text-xs text-emerald-600 dark:text-emerald-400">
                                                {order.total.toLocaleString()} {settings.currency}
                                            </span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500">
                                                {order.method}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

            </div>

            {/* Receipt Modal Trigger if clicking an order */}
            <ReceiptModal
                transaction={selectedTx}
                isOpen={!!selectedTx}
                onClose={() => setSelectedTx(null)}
            />
        </Layout>
    );
}
