import React, { useRef } from 'react';
import { usePos } from '../context/PosContext';

export default function ReceiptModal({ transaction, isOpen, onClose }) {
    const { settings } = usePos();
    const printRef = useRef(null);

    if (!isOpen || !transaction) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-pop-in max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">وەسڵی کڕین (Receipt)</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Printable Receipt Paper Preview */}
                <div className="flex-1 overflow-y-auto py-4">
                    <div 
                        id="receipt-print" 
                        ref={printRef}
                        className="bg-amber-50/60 dark:bg-slate-950 p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 shadow-inner"
                    >
                        {/* Restaurant Branding */}
                        <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1">
                            <h2 className="font-black text-base text-slate-900 dark:text-white tracking-wide font-sans">{settings.restaurantName}</h2>
                            <p className="text-[11px] text-slate-500">{settings.restaurantNameEn}</p>
                            <p className="text-[11px] text-slate-500 font-sans">{settings.address}</p>
                            <p className="text-[11px] text-slate-600 font-bold" dir="ltr">{settings.phone}</p>
                        </div>

                        {/* Order Metadata */}
                        <div className="py-2.5 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1 text-[11px]">
                            <div className="flex justify-between">
                                <span>ژمارەی وەسڵ:</span>
                                <span className="font-bold">{transaction.orderNumber || `#${transaction.id}`}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>بەروار و کات:</span>
                                <span dir="ltr">{transaction.dateFormatted || new Date(transaction.date).toLocaleDateString('ku-IQ')} {transaction.time}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>جۆری داواکاری:</span>
                                <span className="font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-sans">
                                    {transaction.orderType || 'بردنەدەرەوە'}
                                </span>
                            </div>
                            {transaction.tableNumber && (
                                <div className="flex justify-between font-bold text-amber-500">
                                    <span>مێز:</span>
                                    <span>{transaction.tableNumber}</span>
                                </div>
                            )}
                            {transaction.customerName && (
                                <div className="flex justify-between">
                                    <span>کڕیار:</span>
                                    <span className="font-bold">{transaction.customerName}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>کاشێر:</span>
                                <span>{transaction.cashier || 'ئەحمەد'}</span>
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                            <div className="flex justify-between font-bold text-slate-500 text-[11px] pb-1 border-b border-slate-200 dark:border-slate-800">
                                <span className="w-1/2 text-right">خواردن</span>
                                <span className="w-1/4 text-center">بڕ x نرخ</span>
                                <span className="w-1/4 text-left">کۆ</span>
                            </div>
                            {transaction.cart && transaction.cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[11px]">
                                    <span className="w-1/2 font-sans font-medium truncate">{item.name}</span>
                                    <span className="w-1/4 text-center text-slate-500" dir="ltr">{item.qty} x {item.price.toLocaleString()}</span>
                                    <span className="w-1/4 text-left font-bold" dir="ltr">{(item.subtotal || item.price * item.qty).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        {/* Financial Totals */}
                        <div className="py-2.5 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1 text-xs">
                            <div className="flex justify-between text-slate-500">
                                <span>کۆی سەرەتایی:</span>
                                <span dir="ltr">{(transaction.subtotal || transaction.total).toLocaleString()} {settings.currency}</span>
                            </div>
                            {transaction.discount > 0 && (
                                <div className="flex justify-between text-rose-500 font-bold">
                                    <span>داشکاندن:</span>
                                    <span dir="ltr">- {transaction.discount.toLocaleString()} {settings.currency}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-1">
                                <span>کۆی گشتی بۆ دان:</span>
                                <span dir="ltr" className="text-emerald-500 font-sans">{transaction.total.toLocaleString()} {settings.currency}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                                <span>شێوازی پارەدان:</span>
                                <span className="font-bold text-amber-500 font-sans">{transaction.method || 'کاش'}</span>
                            </div>
                            {transaction.paidAmount && (
                                <>
                                    <div className="flex justify-between text-[11px] text-slate-500">
                                        <span>بڕی وەرگیراو:</span>
                                        <span dir="ltr">{Number(transaction.paidAmount).toLocaleString()} {settings.currency}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-bold text-blue-500">
                                        <span>پارەی گەڕاوە (Change):</span>
                                        <span dir="ltr">{Math.max(0, transaction.paidAmount - transaction.total).toLocaleString()} {settings.currency}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Barcode & Footer Greeting */}
                        <div className="pt-4 text-center space-y-2">
                            {/* Visual simulated barcode */}
                            <div className="flex justify-center items-center gap-0.5 h-8 opacity-80">
                                {[...Array(35)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="bg-slate-900 dark:bg-white h-full"
                                        style={{ width: (i % 4 === 0 || i % 7 === 0) ? '3px' : '1.5px', opacity: (i % 5 === 0) ? 0.4 : 1 }}
                                    ></div>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400 font-sans tracking-wider" dir="ltr">{transaction.orderNumber || transaction.id}</p>
                            <p className="text-xs font-bold font-sans text-slate-700 dark:text-slate-300">سوپاس بۆ سەردانەکەتان ❤️ بەخێربێنەوە</p>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors"
                    >
                        داخستن
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-print"></i>
                        <span>چاپکردنی وەسڵ</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
