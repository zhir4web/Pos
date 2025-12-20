import React from 'react';
import Layout from '../components/Layout';
import { useSales } from '../context/SalesContext';

export default function DashboardPage() {
    const { totalSales, totalOrders, transactions } = useSales();

    // Get last 5 transactions for "Recent Orders"
    const recentOrders = transactions.slice(0, 5);

    // Dynamic Stats
    const stats = [
        { title: 'کۆی فرۆشی ئەمڕۆ', value: totalSales.toLocaleString() + ' د.ع', icon: 'fa-coins', color: 'bg-green-500' },
        { title: 'ژمارەی داواکاری', value: totalOrders, icon: 'fa-shopping-bag', color: 'bg-blue-500' },
        { title: 'قازانجی خەمڵێنراو', value: (totalSales * 0.3).toLocaleString() + ' د.ع', icon: 'fa-chart-line', color: 'bg-amber-500' }, // Assume 30% margin
        { title: 'کڕیاری نوێ', value: '٥', icon: 'fa-users', color: 'bg-purple-500' }, // Mock hardcoded
    ];

    return (
        <Layout title="داشبۆرد">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`w - 14 h - 14 rounded - xl flex items - center justify - center text - white text - 2xl shadow - lg ${stat.color} shadow - ${stat.color.split('-')[1]} -200`}>
                            <i className={`fas ${stat.icon} `}></i>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders Chart Placeholder */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">فرۆشی ئەم هەفتەیە</h3>
                        <select className="bg-gray-50 border border-gray-200 rounded-lg text-sm px-3 py-1 outline-none">
                            <option>حەفتانە</option>
                            <option>مانگانە</option>
                        </select>
                    </div>
                    {/* Simple CSS Chart Placeholder */}
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {[40, 70, 45, 90, 60, 80, 50].map((height, i) => (
                            <div key={i} className="w-full bg-blue-50 rounded-t-lg relative group">
                                <div style={{ height: `${height}% ` }} className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:bg-blue-600"></div>
                                <div className="absolute -bottom-6 w-full text-center text-xs text-gray-400">
                                    {['شەم', 'یەک', 'دوو', 'سێ', 'چوار', 'پێنج', 'هەین'][i]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products / Recent Orders List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">دواین داواکارییەکان</h3>
                    <div className="space-y-4">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-dashed border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                        {String(order.id).slice(-4)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">{order.items.split(',')[0]}...</h4>
                                        <p className="text-xs text-gray-400">{order.time}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-green-600 text-sm">{order.total.toLocaleString()}</span>
                                    <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full">{order.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 text-center text-blue-600 text-sm font-bold hover:underline">بینینی هەمووی</button>
                </div>
            </div>
        </Layout>
    );
}
