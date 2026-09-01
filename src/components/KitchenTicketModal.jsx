import React from 'react';

export default function KitchenTicketModal({ transaction, isOpen, onClose }) {
    if (!isOpen || !transaction) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-pop-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">وەسڵی چێشتخانە (KOT)</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                <div className="py-4">
                    <div 
                        id="kot-print" 
                        className="bg-yellow-50/50 dark:bg-slate-950 p-5 rounded-2xl border-2 border-slate-800 dark:border-slate-700 font-sans text-slate-900 dark:text-white"
                    >
                        <div className="text-center pb-3 border-b-2 border-dashed border-slate-400 space-y-1">
                            <h2 className="text-2xl font-black tracking-wider text-rose-600">داواکاری چێشتخانە (KOT)</h2>
                            <p className="text-sm font-bold">ژمارەی داواکاری: {transaction.orderNumber || `#${transaction.id}`}</p>
                            <p className="text-xs text-slate-500">{transaction.dateFormatted || new Date().toLocaleDateString('ku-IQ')} - {transaction.time}</p>
                        </div>

                        <div className="py-3 border-b-2 border-dashed border-slate-400 flex justify-between items-center bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-xl my-2">
                            <div>
                                <span className="text-xs text-slate-500 block">جۆری داواکاری:</span>
                                <span className="font-black text-base text-rose-500">{transaction.orderType || 'بردنەدەرەوە'}</span>
                            </div>
                            {transaction.tableNumber && (
                                <div className="text-left">
                                    <span className="text-xs text-slate-500 block">مێزی داواکراو:</span>
                                    <span className="font-black text-xl text-amber-500">{transaction.tableNumber}</span>
                                </div>
                            )}
                        </div>

                        {/* Items Checklist for Chefs */}
                        <div className="py-3 space-y-3">
                            <h4 className="font-black text-xs uppercase tracking-wider text-slate-500">لیستی خواردنەکان:</h4>
                            {transaction.cart && transaction.cart.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-rose-600 text-white font-black flex items-center justify-center text-base">
                                            {item.qty}
                                        </div>
                                        <div>
                                            <p className="font-black text-base">{item.name}</p>
                                            {item.note && (
                                                <p className="text-xs text-rose-500 font-bold">تێبینی: {item.note}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-5 h-5 rounded border-2 border-slate-400"></div>
                                </div>
                            ))}
                        </div>

                        {transaction.customerName && (
                            <div className="pt-2 text-xs text-slate-500">
                                <span>کڕیار: {transaction.customerName}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors"
                    >
                        داخستن
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-print"></i>
                        <span>چاپ بۆ چێشتخانە</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
