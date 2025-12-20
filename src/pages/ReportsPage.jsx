import React from 'react';
import Layout from '../components/Layout';
import { useSales } from '../context/SalesContext';

export default function ReportsPage() {
    const { transactions } = useSales();

    return (
        <Layout title="ڕاپۆرتەکان">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Filter Toolbar */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold">ئەمڕۆ</button>
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">دوێنێ</button>
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">ئەم هەفتەیە</button>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                        <span className="text-gray-400">-</span>
                        <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">ژ.وەسڵ</th>
                                <th className="px-6 py-4 font-medium">بەروار/کات</th>
                                <th className="px-6 py-4 font-medium">وردەکاری</th>
                                <th className="px-6 py-4 font-medium">ڕێگای پارەدان</th>
                                <th className="px-6 py-4 font-medium text-left">کۆی گشتی</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-gray-800">#{tx.id}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="text-sm font-bold">{tx.date}</div>
                                        <div className="text-xs text-gray-400">{tx.time}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate" title={tx.items}>
                                        {tx.items}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
                                            {tx.method}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-left font-bold text-green-600">
                                        {tx.total.toLocaleString()} د.ع
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
