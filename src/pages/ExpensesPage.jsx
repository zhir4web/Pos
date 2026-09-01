import React, { useState } from 'react';
import Layout from '../components/Layout';
import { usePos } from '../context/PosContext';
import { useUI } from '../context/UIContext';

export default function ExpensesPage() {
    const { expenses, addExpense, deleteExpense, settings, todayExpenses, totalExpensesAmount } = usePos();
    const { addToast } = useUI();

    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        title: '',
        amount: '',
        category: 'کڕینی ڕۆژانە',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('ku-IQ', { hour: '2-digit', minute: '2-digit' }),
        note: ''
    });

    const expenseCategories = [
        'all',
        'مۆلیدە و کارەبا',
        'کڕینی ڕۆژانە',
        'پێداویستی پاکوخاوێنی',
        'مووچەی کارمەندان',
        'کرێی دوکان',
        'گاز و سووتەمەنی',
        'چاککردنەوە و ترومپا'
    ];

    const filtered = expenses.filter(exp => {
        const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
        const matchesSearch = exp.title.toLowerCase().includes(search.toLowerCase()) ||
                              (exp.note && exp.note.toLowerCase().includes(search.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleSave = (e) => {
        e.preventDefault();
        if (!form.title || !form.amount) return;

        addExpense({
            title: form.title,
            amount: Number(form.amount),
            category: form.category,
            date: form.date,
            time: form.time || new Date().toLocaleTimeString('ku-IQ', { hour: '2-digit', minute: '2-digit' }),
            note: form.note
        });

        addToast('مەسرەفەکە بە سەرکەوتوویی تۆمارکرا', 'success');
        setShowModal(false);
        setForm({
            title: '',
            amount: '',
            category: 'کڕینی ڕۆژانە',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('ku-IQ', { hour: '2-digit', minute: '2-digit' }),
            note: ''
        });
    };

    return (
        <Layout 
            title="مەسرەف و خەرجی ڕۆژانە" 
            subtitle="تۆمارکردنی خەرجییەکان، پسوڵەی کڕینی پێداویستی و مۆلیدە و مووچە"
            extraHeaderAction={
                <button
                    onClick={() => setShowModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                    <i className="fas fa-minus-circle"></i>
                    <span>تۆمارکردنی مەسرەفی نوێ</span>
                </button>
            }
        >
            <div className="space-y-6">
                
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-xl">
                            <i className="fas fa-calendar-day"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">مەسرەفی ئەمڕۆ</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                                {todayExpenses.toLocaleString()} <span className="text-xs font-sans">{settings.currency}</span>
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center text-xl">
                            <i className="fas fa-money-bill-wave"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">کۆی گشتی خەرجییەکان</p>
                            <h3 className="text-2xl font-black text-rose-500 mt-0.5 font-mono">
                                {totalExpensesAmount.toLocaleString()} <span className="text-xs font-sans">{settings.currency}</span>
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center text-xl">
                            <i className="fas fa-receipt"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">ژمارەی پسوڵەکان</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                                {expenses.length} پسوڵە
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
                        {expenseCategories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setSelectedCategory(c)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                                    selectedCategory === c
                                        ? 'bg-rose-500 text-white font-black'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                                }`}
                            >
                                {c === 'all' ? 'هەموو بەشەکان' : c}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-72">
                        <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="گەڕان لە خەرجییەکان..."
                            className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                    </div>
                </div>

                {/* Expenses Table */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-4">بابەت / وەسف</th>
                                    <th className="px-5 py-4">جۆری خەرجی</th>
                                    <th className="px-5 py-4">بەروار و کات</th>
                                    <th className="px-5 py-4">بڕی مەسرەف</th>
                                    <th className="px-5 py-4">تێبینی</th>
                                    <th className="px-5 py-4 text-center">کردار</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-12 text-center text-slate-400 font-bold">
                                            هیچ خەرجییەک تۆمار نەکراوە
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-5 py-4 font-black text-slate-900 dark:text-white">
                                                {exp.title}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-500 font-bold text-[11px]">
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500 font-mono" dir="ltr">
                                                {exp.date} {exp.time}
                                            </td>
                                            <td className="px-5 py-4 font-mono font-black text-sm text-rose-500">
                                                {exp.amount.toLocaleString()} {settings.currency}
                                            </td>
                                            <td className="px-5 py-4 text-slate-500 max-w-xs truncate">{exp.note || '-'}</td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        deleteExpense(exp.id);
                                                        addToast('مەسرەفەکە سڕایەوە', 'info');
                                                    }}
                                                    title="سڕینەوە"
                                                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                                                >
                                                    <i className="fas fa-trash-can text-sm"></i>
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

            {/* Add Expense Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-pop-in">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">تۆمارکردنی خەرجی و مەسرەف</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ناوی بابەت / هۆکاری خەرجی</label>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="نموونە: کڕینی سەوزە و تەماتە..."
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">بڕی پارە ({settings.currency})</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">بەش</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    >
                                        {expenseCategories.filter(c => c !== 'all').map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">بەروار</label>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">کات</label>
                                    <input
                                        type="text"
                                        value={form.time}
                                        onChange={(e) => setForm({ ...form, time: e.target.value })}
                                        placeholder="12:00"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تێبینی</label>
                                <textarea
                                    rows="2"
                                    value={form.note}
                                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                                    placeholder="زانیاری زیاتر لەسەر ئەم خەرجییە..."
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-extrabold transition-all shadow-md mt-2"
                            >
                                پاشەکەوتکردنی خەرجی
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
