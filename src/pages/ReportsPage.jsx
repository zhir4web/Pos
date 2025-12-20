import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useSales } from '../context/SalesContext';
import { Spinner } from '../components/LoadingComponents';
import { EmptyState } from '../components/ErrorComponents';

export default function ReportsPage() {
    const { transactions } = useSales();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Layout title="ڕاپۆرتەکان">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
                {/* Filter Toolbar */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto">
                        <button className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold whitespace-nowrap">ئەمڕۆ</button>
                        <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg text-sm whitespace-nowrap">دوێنێ</button>
                        <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg text-sm whitespace-nowrap">ئەم هەفتەیە</button>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <input type="date" className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" />
                        <span className="text-gray-400">-</span>
                        <input type="date" className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" />
                    </div>
                </div>

                {/* Table Section */}
                <div className="min-h-[400px] flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-20">
                            <Spinner size="lg" />
                            <p className="mt-4 text-gray-500 animate-pulse">داتاکان ئامادە دەکرێن...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex-1">
                            <EmptyState
                                icon="fa-file-invoice"
                                title="هیچ مامەڵەیەک نییە"
                                message="لە کاتی ئەنجامدانی فرۆشتن لێرەدا دەردەکەون."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">ژ.وەسڵ</th>
                                        <th className="px-6 py-4 font-medium">بەروار/کات</th>
                                        <th className="px-6 py-4 font-medium">وردەکاری</th>
                                        <th className="px-6 py-4 font-medium">ڕێگای پارەدان</th>
                                        <th className="px-6 py-4 font-medium text-left">کۆی گشتی</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">#{tx.id}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                <div className="text-sm font-bold">{tx.date}</div>
                                                <div className="text-xs text-gray-400">{tx.time}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm max-w-xs truncate" title={tx.items}>
                                                {tx.items}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded border border-gray-200 dark:border-gray-600">
                                                    {tx.method}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-left font-bold text-green-600 dark:text-green-400">
                                                {tx.total.toLocaleString()} د.ع
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <span>پیشاندانی ١-٥ لە کۆی ٤٥</span>
                    <div className="flex gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50" disabled><i className="fas fa-chevron-right"></i></button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-blue-600 text-white">١</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50">٢</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50"><i className="fas fa-chevron-left"></i></button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
