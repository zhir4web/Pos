import React, { useState } from 'react';
import Layout from '../components/Layout';
import { usePos } from '../context/PosContext';
import ReceiptModal from '../components/ReceiptModal';
import { sound } from '../utils/audioEffects';

export default function ReportsPage() {
    const { transactions, settings, totalGrossSales } = usePos();

    const [filterPeriod, setFilterPeriod] = useState('all'); // 'today' | 'yesterday' | 'week' | 'month' | 'all'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('all');
    const [selectedOrderType, setSelectedOrderType] = useState('all');
    const [selectedTx, setSelectedTx] = useState(null);

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const filtered = transactions.filter(tx => {
        const txDate = tx.dateFormatted || (tx.date && tx.date.split('T')[0]);
        
        // Date period filter
        if (filterPeriod === 'today' && txDate !== todayStr) return false;
        if (filterPeriod === 'yesterday' && txDate !== yesterday) return false;
        if (startDate && txDate < startDate) return false;
        if (endDate && txDate > endDate) return false;

        // Method filter
        if (selectedMethod !== 'all' && tx.method !== selectedMethod) return false;

        // Order Type filter
        if (selectedOrderType !== 'all' && tx.orderType !== selectedOrderType) return false;

        return true;
    });

    // Calculated totals for filtered set
    const filteredTotalSales = filtered.reduce((sum, tx) => sum + (tx.total || 0), 0);
    const filteredTotalDiscounts = filtered.reduce((sum, tx) => sum + (tx.discount || 0), 0);
    const filteredTotalCost = filtered.reduce((sum, tx) => sum + (tx.estimatedCost || tx.total * 0.45), 0);
    const filteredNetProfit = filteredTotalSales - filteredTotalCost;

    // Export CSV
    const exportCsv = () => {
        if (filtered.length === 0) return;
        const headers = ['ژمارەی وەسڵ', 'بەروار', 'کات', 'جۆری داواکاری', 'مێز/کڕیار', 'خواردنەکان', 'ڕێگای پارەدان', 'کۆی گشتی', 'قازانج'];
        const rows = filtered.map(tx => [
            tx.orderNumber || tx.id,
            tx.dateFormatted || tx.date,
            tx.time,
            tx.orderType,
            tx.tableNumber || tx.customerName || '',
            `"${tx.items}"`,
            tx.method,
            tx.total,
            tx.profit || (tx.total - (tx.estimatedCost || 0))
        ]);

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `shahla_khan_reports_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        sound.success();
    };

    return (
        <Layout 
            title="ڕاپۆرتە داراییەکان و فرۆش" 
            subtitle="شیکاری وردی وەسڵەکان، فلتەرکردنی بەروار و هەناردەکردنی Excel / CSV"
            extraHeaderAction={
                <button
                    onClick={exportCsv}
                    disabled={filtered.length === 0}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all disabled:opacity-40"
                >
                    <i className="fas fa-file-excel"></i>
                    <span>هەناردەکردنی CSV / Excel</span>
                </button>
            }
        >
            <div className="space-y-6">
                
                {/* Financial Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xl">
                            <i className="fas fa-coins"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">کۆی فرۆشی فلتەرکراو</p>
                            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                                {filteredTotalSales.toLocaleString()} <span className="text-xs font-sans">{settings.currency}</span>
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-xl">
                            <i className="fas fa-chart-pie"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">قازانجی پوختی خەمڵێنراو</p>
                            <h3 className="text-xl font-black text-amber-500 mt-0.5 font-mono">
                                {filteredNetProfit.toLocaleString()} <span className="text-xs font-sans">{settings.currency}</span>
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center text-xl">
                            <i className="fas fa-percent"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">کۆی داشکاندنەکان</p>
                            <h3 className="text-xl font-black text-rose-500 mt-0.5 font-mono">
                                {filteredTotalDiscounts.toLocaleString()} <span className="text-xs font-sans">{settings.currency}</span>
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center text-xl">
                            <i className="fas fa-file-invoice"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">ژمارەی وەسڵەکان</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                                {filtered.length} وەسڵ
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    
                    {/* Period Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                            {[
                                { id: 'all', label: 'هەموو کات' },
                                { id: 'today', label: 'ئەمڕۆ' },
                                { id: 'yesterday', label: 'دوێنێ' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setFilterPeriod(tab.id);
                                        setStartDate('');
                                        setEndDate('');
                                    }}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                        filterPeriod === tab.id
                                            ? 'bg-amber-500 text-slate-950 font-black'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Date Range pickers */}
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400 font-bold">لە:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setFilterPeriod('custom');
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                            />
                            <span className="text-slate-400 font-bold">تا:</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setFilterPeriod('custom');
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                            />
                        </div>
                    </div>

                    {/* Secondary Filters: Method & Type */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-bold">شێوازی پارەدان:</span>
                            <select
                                value={selectedMethod}
                                onChange={(e) => setSelectedMethod(e.target.value)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                            >
                                <option value="all">هەموو شێوازەکان</option>
                                <option value="کاش">کاش</option>
                                <option value="FastPay">FastPay</option>
                                <option value="FIB">FIB</option>
                                <option value="ZainCash">ZainCash</option>
                                <option value="کارتی بانکی">کارتی بانکی</option>
                                <option value="قەرز">قەرز</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-bold">جۆری داواکاری:</span>
                            <select
                                value={selectedOrderType}
                                onChange={(e) => setSelectedOrderType(e.target.value)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                            >
                                <option value="all">هەموو جۆرەکان</option>
                                <option value="بردنەدەرەوە">بردنەدەرەوە</option>
                                <option value="لە ناوەوە">لە ناوەوە (سەرمێز)</option>
                                <option value="گەیاندن">گەیاندن (Delivery)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-4">ژمارەی وەسڵ</th>
                                    <th className="px-5 py-4">بەروار و کات</th>
                                    <th className="px-5 py-4">جۆری داواکاری</th>
                                    <th className="px-5 py-4">وردەکاری خواردنەکان</th>
                                    <th className="px-5 py-4">شێوازی پارەدان</th>
                                    <th className="px-5 py-4">کۆی گشتی</th>
                                    <th className="px-5 py-4 text-center">وەسڵ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-5 py-12 text-center text-slate-400 font-bold">
                                            هیچ فرۆشتنێک لەم مەودایەدا نەدۆزرایەوە
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                                                {tx.orderNumber || `#${tx.id}`}
                                            </td>
                                            <td className="px-5 py-4 text-slate-500 font-mono" dir="ltr">
                                                {tx.dateFormatted || (tx.date && tx.date.split('T')[0])} {tx.time}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                                                    {tx.orderType || 'بردنەدەرەوە'} {tx.tableNumber ? `(${tx.tableNumber})` : ''}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={tx.items}>
                                                {tx.items}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold text-[11px]">
                                                    {tx.method || 'کاش'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                                                {tx.total.toLocaleString()} {settings.currency}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={() => setSelectedTx(tx)}
                                                    className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg transition-colors"
                                                    title="بینینی وەسڵ"
                                                >
                                                    <i className="fas fa-receipt text-base"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Receipt Modal Trigger */}
            <ReceiptModal
                transaction={selectedTx}
                isOpen={!!selectedTx}
                onClose={() => setSelectedTx(null)}
            />
        </Layout>
    );
}
