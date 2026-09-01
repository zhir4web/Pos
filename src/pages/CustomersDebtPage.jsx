import React, { useState } from 'react';
import Layout from '../components/Layout';
import { usePos } from '../context/PosContext';
import { useUI } from '../context/UIContext';

export default function CustomersDebtPage() {
    const { customers, addCustomer, updateCustomer, recordCustomerPayment, settings, totalOutstandingDebt } = usePos();
    const { addToast } = useUI();

    const [search, setSearch] = useState('');
    const [filterWithDebtOnly, setFilterWithDebtOnly] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    const [form, setForm] = useState({
        name: '',
        phone: '',
        debt: '',
        address: '',
        notes: ''
    });

    const filtered = customers.filter(c => {
        const matchesDebt = !filterWithDebtOnly || c.debt > 0;
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                              c.phone.includes(search) || 
                              (c.address && c.address.toLowerCase().includes(search.toLowerCase()));
        return matchesDebt && matchesSearch;
    });

    const handleSave = (e) => {
        e.preventDefault();
        if (!form.name || !form.phone) return;

        if (editingCustomer) {
            updateCustomer({
                ...editingCustomer,
                name: form.name,
                phone: form.phone,
                debt: Number(form.debt) || 0,
                address: form.address,
                notes: form.notes
            });
            addToast('زانیاری کڕیار بە سەرکەوتوویی نوێکرایەوە', 'success');
        } else {
            addCustomer({
                name: form.name,
                phone: form.phone,
                debt: Number(form.debt) || 0,
                address: form.address,
                notes: form.notes
            });
            addToast('کڕیاری نوێ زیادکرا', 'success');
        }

        setShowModal(false);
        setEditingCustomer(null);
        setForm({ name: '', phone: '', debt: '', address: '', notes: '' });
    };

    const handleRecordPayment = (e) => {
        e.preventDefault();
        if (!selectedCustomerForPayment || !paymentAmount) return;

        recordCustomerPayment(selectedCustomerForPayment.id, paymentAmount);
        addToast(`بڕی ${Number(paymentAmount).toLocaleString()} ${settings.currency} لە قەرزی کڕیار وەرگیرا`, 'success');
        setShowPaymentModal(false);
        setSelectedCustomerForPayment(null);
        setPaymentAmount('');
    };

    const openEdit = (c) => {
        setEditingCustomer(c);
        setForm({
            name: c.name,
            phone: c.phone,
            debt: String(c.debt),
            address: c.address || '',
            notes: c.notes || ''
        });
        setShowModal(true);
    };

    const openPayment = (c) => {
        setSelectedCustomerForPayment(c);
        setPaymentAmount(String(c.debt));
        setShowPaymentModal(true);
    };

    return (
        <Layout 
            title="دەفتەری قەرز و کڕیاران" 
            subtitle="بەڕێوەبردنی کڕیارانی بەردەوام، ژمێرەی قەرزەکان و وەرگرتنەوەی پارە"
            extraHeaderAction={
                <button
                    onClick={() => {
                        setEditingCustomer(null);
                        setForm({ name: '', phone: '', debt: '', address: '', notes: '' });
                        setShowModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                    <i className="fas fa-user-plus"></i>
                    <span>زیادکردنی کڕیاری نوێ</span>
                </button>
            }
        >
            <div className="space-y-6">
                
                {/* Metric Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center text-xl">
                            <i className="fas fa-users"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">کۆی گشتی کڕیاران</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{customers.length} کەس</h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center text-xl">
                            <i className="fas fa-hand-holding-dollar"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">کۆی قەرز لەلایەن کڕیاران</p>
                            <h3 className="text-2xl font-black text-rose-500 mt-0.5 font-mono">
                                {totalOutstandingDebt.toLocaleString()} <span className="text-xs font-sans">{settings.currency}</span>
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-xl">
                            <i className="fas fa-file-invoice"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">ژمارەی کڕیارانی قەرزدار</p>
                            <h3 className="text-2xl font-black text-amber-500 mt-0.5">
                                {customers.filter(c => c.debt > 0).length} کڕیار
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilterWithDebtOnly(false)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                !filterWithDebtOnly ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                        >
                            هەموو کڕیاران
                        </button>
                        <button
                            onClick={() => setFilterWithDebtOnly(true)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                                filterWithDebtOnly ? 'bg-rose-500 text-white font-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                        >
                            <span>تەنها قەرزدارەکان</span>
                            <span className="bg-rose-600 text-white px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                                {customers.filter(c => c.debt > 0).length}
                            </span>
                        </button>
                    </div>

                    <div className="relative w-full md:w-72">
                        <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="گەڕان بەپێی ناو، مۆبایل، ناونیشان..."
                            className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                </div>

                {/* Customers Table */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-4">ناوی کڕیار</th>
                                    <th className="px-5 py-4">ژمارەی مۆبایل</th>
                                    <th className="px-5 py-4">ناونیشان</th>
                                    <th className="px-5 py-4">قەرزی ماوە</th>
                                    <th className="px-5 py-4">تێبینی</th>
                                    <th className="px-5 py-4 text-center">کردارەکان</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-12 text-center text-slate-400 font-bold">
                                            هیچ کڕیارێک نەدۆزرایەوە
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-5 py-4 font-black text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-amber-500">
                                                        {c.name.charAt(0)}
                                                    </div>
                                                    <span>{c.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-300" dir="ltr">
                                                {c.phone}
                                            </td>
                                            <td className="px-5 py-4 text-slate-500 max-w-xs truncate">{c.address || '-'}</td>
                                            <td className="px-5 py-4">
                                                {c.debt > 0 ? (
                                                    <span className="font-black font-mono text-sm text-rose-500">
                                                        {c.debt.toLocaleString()} {settings.currency}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md font-bold text-[10px]">
                                                        بێ قەرز
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-slate-500 max-w-xs truncate">{c.notes || '-'}</td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {c.debt > 0 && (
                                                        <button
                                                            onClick={() => openPayment(c)}
                                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] shadow transition-colors flex items-center gap-1"
                                                        >
                                                            <i className="fas fa-hand-holding-dollar"></i>
                                                            <span>وەرگرتنەوە</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openEdit(c)}
                                                        className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg transition-colors"
                                                    >
                                                        <i className="fas fa-pen-to-square text-sm"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Add / Edit Customer Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-pop-in">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                                {editingCustomer ? 'دەستکاری کڕیار' : 'تۆمارکردنی کڕیاری نوێ'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ناوی سیانی کڕیار</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="نموونە: کاک هێمن ئەحمەد..."
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ژمارەی مۆبایل</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="0770..."
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">قەرزی سەرەتا ({settings.currency})</label>
                                    <input
                                        type="number"
                                        value={form.debt}
                                        onChange={(e) => setForm({ ...form, debt: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ناونیشان</label>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    placeholder="گەڕەك، شەقام..."
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تێبینی</label>
                                <textarea
                                    rows="2"
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="تێبینی زیادە لەسەر کڕیار..."
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold transition-all shadow-md mt-2"
                            >
                                {editingCustomer ? 'پاشەکەوتکردن' : 'تۆمارکردنی کڕیار'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Repayment Modal */}
            {showPaymentModal && selectedCustomerForPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-pop-in">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">وەرگرتنەوەی قەرز</h3>
                            <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-3 text-xs space-y-1">
                            <span className="text-slate-500 block">ناوی کڕیار:</span>
                            <span className="font-black text-sm text-slate-900 dark:text-white block">{selectedCustomerForPayment.name}</span>
                            <span className="text-rose-500 font-bold font-mono block">کۆی قەرز: {selectedCustomerForPayment.debt.toLocaleString()} {settings.currency}</span>
                        </div>

                        <form onSubmit={handleRecordPayment} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">بڕی پارەی وەرگیراو ({settings.currency})</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={selectedCustomerForPayment.debt}
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-mono font-black text-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md"
                            >
                                تۆمارکردنی وەرگرتنی پارە
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
