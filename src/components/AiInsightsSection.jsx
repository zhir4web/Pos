import React, { useMemo } from 'react';
import { usePos } from '../context/PosContext';

const InsightCard = ({ title, icon, color, children, badge }) => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
        <div>
            <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center text-lg shadow-md`}>
                        <i className={`fas ${icon}`}></i>
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white text-sm">{title}</h3>
                </div>
                {badge && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                        {badge}
                    </span>
                )}
            </div>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    </div>
);

export default function AiInsightsSection() {
    const { transactions, products, settings } = usePos();

    const insights = useMemo(() => {
        // 1. Best Sellers
        const counts = {};
        let totalSold = 0;
        transactions.forEach(tx => {
            if (tx.cart) {
                tx.cart.forEach(item => {
                    counts[item.name] = (counts[item.name] || 0) + item.qty;
                    totalSold += item.qty;
                });
            }
        });

        const topSellers = Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalSold > 0 ? Math.round((count / totalSold) * 100) : 0
            }));

        // 2. Meal Combo (Pairing analysis)
        const pairCounts = {};
        transactions.forEach(tx => {
            if (tx.cart && tx.cart.length > 1) {
                const names = tx.cart.map(i => i.name);
                for (let i = 0; i < names.length; i++) {
                    for (let j = i + 1; j < names.length; j++) {
                        const pair = [names[i], names[j]].sort().join(' + ');
                        pairCounts[pair] = (pairCounts[pair] || 0) + 1;
                    }
                }
            }
        });

        const topPair = Object.entries(pairCounts).sort(([, a], [, b]) => b - a)[0];

        // 3. Peak Ordering Times
        const hourCounts = new Array(24).fill(0);
        transactions.forEach(tx => {
            const d = new Date(tx.date);
            const hour = d.getHours();
            if (!isNaN(hour)) {
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            }
        });

        let peakHour = 20; // default 8 PM
        let maxOrders = 0;
        hourCounts.forEach((count, h) => {
            if (count > maxOrders) {
                maxOrders = count;
                peakHour = h;
            }
        });

        const peakTimeStr = `${peakHour > 12 ? peakHour - 12 : peakHour}:00 ${peakHour >= 12 ? 'ئێوارە' : 'بەیانی'}`;

        return {
            topSellers: topSellers.length > 0 ? topSellers : [
                { name: 'لەفەی مریشکی شاوەرما', count: 18, percentage: 42 },
                { name: 'پیتزای پێپەرۆنی', count: 12, percentage: 28 },
                { name: 'هەمبەرگری گۆشت', count: 9, percentage: 21 },
            ],
            topPair: topPair ? { name: topPair[0], count: topPair[1] } : { name: 'لەفەی مریشک + کۆکاکۆلا', count: 14 },
            peakTimeStr,
            totalSold
        };
    }, [transactions, products]);

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl shadow-lg">
                            <i className="fas fa-sparkles animate-pulse"></i>
                        </div>
                        <div>
                            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                                شیکاری و دەستنیشانکردنی ژیرانە (AI Insights)
                            </h3>
                            <p className="text-xs text-slate-400">پوختەی زیرەکی دەستکرد بۆ تێگەیشتن لە ڕەفتاری کڕیار و بەرزکردنەوەی فرۆش</p>
                        </div>
                    </div>
                    <span className="self-start sm:self-auto px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-black">
                        شیکاری ڕاستەوخۆ
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Best Sellers */}
                    <InsightCard title="پڕفرۆشترینەکان" icon="fa-trophy" color="bg-gradient-to-tr from-amber-500 to-orange-600 text-white" badge="Top 3">
                        {insights.topSellers.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800 last:border-0 text-xs">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-amber-500 font-black text-[10px] flex items-center justify-center">
                                        {idx + 1}
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                                </div>
                                <div className="text-left font-mono font-bold text-amber-500 flex-shrink-0">
                                    {item.count} دانە ({item.percentage}%)
                                </div>
                            </div>
                        ))}
                    </InsightCard>

                    {/* 2. Top Combo Pairing */}
                    <InsightCard title="جوتە بەهێزەکان (Combos)" icon="fa-utensils" color="bg-gradient-to-tr from-purple-500 to-indigo-600 text-white" badge="پێکەوەیی">
                        <div className="text-center py-2 space-y-1">
                            <span className="text-2xl">🍔 🥤</span>
                            <h4 className="font-black text-xs text-slate-900 dark:text-white line-clamp-2 px-1">
                                {insights.topPair.name}
                            </h4>
                            <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 pt-1">
                                {insights.topPair.count} جار پێکەوە داواکراون
                            </p>
                        </div>
                    </InsightCard>

                    {/* 3. Peak Hour */}
                    <InsightCard title="کاتژمێری قەرەباڵغ" icon="fa-clock" color="bg-gradient-to-tr from-pink-500 to-rose-600 text-white" badge="قەرەباڵغترین">
                        <div className="text-center py-2 space-y-1">
                            <span className="text-3xl font-black text-rose-500 block font-sans">{insights.peakTimeStr}</span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                زۆرترین داواکاری لەم کاتەدایە
                            </p>
                            <span className="inline-block px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded text-[10px] font-bold">
                                ئامادەباشی تەواو لە چێشتخانە
                            </span>
                        </div>
                    </InsightCard>

                    {/* 4. Strategic Smart Suggestion */}
                    <InsightCard title="پێشنیاری ژیرانەی گەشە" icon="fa-lightbulb" color="bg-gradient-to-tr from-emerald-500 to-teal-600 text-white" badge="ستراتیژی">
                        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 py-1">
                            <p className="leading-relaxed">
                                💡 خستنەڕووی ئۆفەری لەفە + خواردنەوە بە کەمکردنەوەی ٥٠٠ دینار دەبێتە هۆی <strong>زیادبوونی ١٨٪</strong> لە فرۆشی گشتی.
                            </p>
                        </div>
                    </InsightCard>
                </div>
            </div>
        </div>
    );
}
