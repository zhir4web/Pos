import React, { useState } from 'react';
import Layout from '../components/Layout';
import { usePos } from '../context/PosContext';
import { useUI } from '../context/UIContext';
import { sound } from '../utils/audioEffects';

export default function InventoryPage() {
    const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, settings, lowStockCount } = usePos();
    const { addToast } = useUI();

    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showStockAdjustModal, setShowStockAdjustModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [adjustingItem, setAdjustingItem] = useState(null);
    const [adjustQty, setAdjustQty] = useState('');
    const [adjustType, setAdjustType] = useState('add'); // 'add' | 'subtract'

    const [form, setForm] = useState({
        name: '',
        category: 'خۆراک',
        quantity: '',
        unit: 'دانە',
        minStock: '10',
        costPerUnit: '',
        supplier: ''
    });

    const categories = ['all', 'خۆراک', 'گۆشت', 'نانەوا', 'شیرەمەنی', 'سۆس', 'سەوزە', 'ساردەمەنی', 'پێداویستی'];

    const filtered = inventory.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                              (item.supplier && item.supplier.toLowerCase().includes(search.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    // Total Inventory Value
    const totalValue = inventory.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.costPerUnit || 0)), 0);

    const handleSave = (e) => {
        e.preventDefault();
        if (!form.name || !form.quantity) return;

        if (editingItem) {
            updateInventoryItem({
                ...editingItem,
                name: form.name,
                category: form.category,
                quantity: Number(form.quantity),
                unit: form.unit,
                minStock: Number(form.minStock) || 5,
                costPerUnit: Number(form.costPerUnit) || 0,
                supplier: form.supplier
            });
            addToast('کاڵای کۆگا بە سەرکەوتوویی نوێکرایەوە', 'success');
        } else {
            addInventoryItem({
                name: form.name,
                category: form.category,
                quantity: Number(form.quantity),
                unit: form.unit,
                minStock: Number(form.minStock) || 5,
                costPerUnit: Number(form.costPerUnit) || 0,
                supplier: form.supplier
            });
            addToast('کەرەستەی نوێ لە کۆگا تۆمارکرا', 'success');
        }

        setShowModal(false);
        setEditingItem(null);
        setForm({ name: '', category: 'خۆراک', quantity: '', unit: 'دانە', minStock: '10', costPerUnit: '', supplier: '' });
    };

    const handleAdjustStock = (e) => {
        e.preventDefault();
        if (!adjustingItem || !adjustQty) return;

        const qtyNum = Number(adjustQty);
        const newQty = adjustType === 'add' 
            ? adjustingItem.quantity + qtyNum 
            : Math.max(0, adjustingItem.quantity - qtyNum);

        updateInventoryItem({
            ...adjustingItem,
            quantity: newQty
        });

        addToast(`بڕی کاڵا بە سەرکەوتوویی ${adjustType === 'add' ? 'زیادکرا' : 'کەمکرایەوە'}`, 'info');
        setShowStockAdjustModal(false);
        setAdjustingItem(null);
        setAdjustQty('');
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setForm({
            name: item.name,
            category: item.category,
            quantity: String(item.quantity),
            unit: item.unit,
            minStock: String(item.minStock),
            costPerUnit: String(item.costPerUnit || ''),
            supplier: item.supplier || ''
        });
        setShowModal(true);
    };

    const openStockAdjust = (item, type = 'add') => {
        setAdjustingItem(item);
        setAdjustType(type);
        setAdjustQty('');
        setShowStockAdjustModal(true);
    };

    return (
        <Layout 
            title="کۆگا و کەرەستە خاوەکان" 
            subtitle="بەڕێوەبردنی ماددە سەرەکییەکان، ڕێژەی کۆگا و ئاگاداری کەمبوونەوە"
            extraHeaderAction={
                <button
                    onClick={() => {
                        setEditingItem(null);
                        setForm({ name: '', category: 'خۆراک', quantity: '', unit: 'دانە', minStock: '10', costPerUnit: '', supplier: '' });
                        setShowModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                    <i className="fas fa-plus"></i>
                    <span>زیادکردنی کەرەستە بۆ کۆگا</span>
                </button>
            }
        >
            <div className="space-y-6">
                
                {/* Low stock warning banner if any items are low */}
                {lowStockCount > 0 && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center text-lg animate-pulse">
                                <i className="fas fa-triangle-exclamation"></i>
                            </div>
                            <div>
                                <h4 className="font-extrabold text-sm text-rose-600 dark:text-rose-400">ئاگاداری کەمبوونەوەی کاڵا لە کۆگا!</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    ژمارەی ({lowStockCount}) کەرەستە گەیشتوونەتە خوار کەمترین ئاستی ڕێگەپێدراو، تکایە کڕینی نوێ ئەنجام بدەن.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Storage Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center text-xl">
                            <i className="fas fa-boxes-stacked"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">کۆی جۆری کەرەستەکان</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{inventory.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center text-xl">
                            <i className="fas fa-triangle-exclamation"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">کەرەستەی کەمبووەوە</p>
                            <h3 className="text-2xl font-black text-rose-500 mt-0.5">{lowStockCount} دانە</h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xl">
                            <i className="fas fa-sack-dollar"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">کۆی بەهای دارایی کۆگا</p>
                            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                                {totalValue.toLocaleString()} <span className="text-xs font-sans">{settings.currency}</span>
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-xl">
                            <i className="fas fa-truck-ramp-box"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">دابینکەرانی سەرەکی</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                                {new Set(inventory.map(i => i.supplier).filter(Boolean)).size} کۆمپانیا
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                    {/* Category Filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setSelectedCategory(c)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                                    selectedCategory === c
                                        ? 'bg-amber-500 text-slate-950 font-black'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                                }`}
                            >
                                {c === 'all' ? 'هەموو جۆرەکان' : c}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-72">
                        <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="گەڕان بەپێی ناوی کاڵا یان دابینکەر..."
                            className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-4">ناوی کەرەستە</th>
                                    <th className="px-5 py-4">بەش</th>
                                    <th className="px-5 py-4">بڕی بەردەست</th>
                                    <th className="px-5 py-4">کەمترین ئاست</th>
                                    <th className="px-5 py-4">تێچووی یەکە</th>
                                    <th className="px-5 py-4">کۆی بەها</th>
                                    <th className="px-5 py-4">دابینکەر</th>
                                    <th className="px-5 py-4 text-center">کردارەکان</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-5 py-12 text-center text-slate-400 font-bold">
                                            هیچ کەرەستەیەک نەدۆزرایەوە
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((item) => {
                                        const isLow = item.quantity <= item.minStock;
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="px-5 py-4 font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isLow ? '#ef4444' : '#10b981' }}></span>
                                                    <span>{item.name}</span>
                                                </td>
                                                <td className="px-5 py-4 text-slate-500">{item.category}</td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`font-black font-mono text-sm ${isLow ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                                                            {item.quantity}
                                                        </span>
                                                        <span className="text-slate-400 text-[11px]">{item.unit}</span>
                                                        {isLow && (
                                                            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-500 rounded text-[10px] font-bold">کەمە</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-slate-500 font-mono">{item.minStock} {item.unit}</td>
                                                <td className="px-5 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                                    {Number(item.costPerUnit || 0).toLocaleString()} {settings.currency}
                                                </td>
                                                <td className="px-5 py-4 font-mono font-black text-emerald-600 dark:text-emerald-400">
                                                    {(Number(item.quantity) * Number(item.costPerUnit || 0)).toLocaleString()} {settings.currency}
                                                </td>
                                                <td className="px-5 py-4 text-slate-500">{item.supplier || '-'}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => openStockAdjust(item, 'add')}
                                                            title="زیادکردنی باری نوێ (Restock)"
                                                            className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                                                        >
                                                            <i className="fas fa-plus-circle text-base"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => openStockAdjust(item, 'subtract')}
                                                            title="کەمکردنەوەی بەفیڕۆچوون (Waste)"
                                                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                                        >
                                                            <i className="fas fa-minus-circle text-base"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => openEdit(item)}
                                                            title="دەستکاری"
                                                            className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg transition-colors"
                                                        >
                                                            <i className="fas fa-pen-to-square text-sm"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Add / Edit Inventory Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-pop-in">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                                {editingItem ? 'دەستکاری کەرەستەی کۆگا' : 'تۆمارکردنی کەرەستەی نوێ'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ناوی کەرەستە</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="نموونە: پەنیری مۆزارێلا..."
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">جۆر / بەش</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                                    >
                                        {categories.filter(c => c !== 'all').map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">یەکەی پێوانە</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.unit}
                                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                        placeholder="کیلۆ، دانە، دەبە..."
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">بڕی سەرەتا</label>
                                    <input
                                        type="number"
                                        required
                                        value={form.quantity}
                                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">کەمترین ئاست (ئاگاداری)</label>
                                    <input
                                        type="number"
                                        required
                                        value={form.minStock}
                                        onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                                        placeholder="5"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تێچووی یەکە ({settings.currency})</label>
                                    <input
                                        type="number"
                                        value={form.costPerUnit}
                                        onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">دابینکەر / کۆمپانیا</label>
                                    <input
                                        type="text"
                                        value={form.supplier}
                                        onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                                        placeholder="ناوی دابینکەر..."
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-3">
                                {editingItem && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            deleteInventoryItem(editingItem.id);
                                            setShowModal(false);
                                            addToast('کەرەستەکە سڕایەوە', 'info');
                                        }}
                                        className="px-4 py-2.5 bg-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl font-bold transition-colors"
                                    >
                                        سڕینەوە
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold transition-all shadow-md"
                                >
                                    {editingItem ? 'پاشەکەوتکردن' : 'تۆمارکردنی کاڵا'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Stock Adjustment Modal */}
            {showStockAdjustModal && adjustingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-pop-in">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                                {adjustType === 'add' ? 'زیادکردنی باری نوێ (Restock)' : 'کەمکردنەوەی بەفیڕۆچوون (Waste)'}
                            </h3>
                            <button onClick={() => setShowStockAdjustModal(false)} className="text-slate-400 hover:text-white">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-3 text-xs">
                            <span className="text-slate-500 block">کاڵای دیاریکراو:</span>
                            <span className="font-black text-sm text-slate-900 dark:text-white">{adjustingItem.name}</span>
                            <span className="text-slate-400 block mt-1">بڕی ئێستا: {adjustingItem.quantity} {adjustingItem.unit}</span>
                        </div>

                        <form onSubmit={handleAdjustStock} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    بڕی {adjustType === 'add' ? 'زیادکردن' : 'کەمکردنەوە'} ({adjustingItem.unit})
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={adjustQty}
                                    onChange={(e) => setAdjustQty(e.target.value)}
                                    placeholder="نموونە: 10"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-mono font-black text-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className={`w-full py-2.5 rounded-xl text-white font-extrabold text-xs transition-all shadow-md ${
                                    adjustType === 'add'
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : 'bg-rose-600 hover:bg-rose-700'
                                }`}
                            >
                                سەلماندنی گۆڕانکاری
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
