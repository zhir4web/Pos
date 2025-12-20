import React from 'react';

export default function ReceiptPrint({ cart, totalAmount, transactionId, date }) {
    if (!cart || !transactionId) return null;

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

    return (
        <div id="receipt-print" className="hidden print:block bg-white text-black p-4 font-mono text-[12px] max-w-[300px] mx-auto">
            {/* Header */}
            <div className="text-center mb-4 border-b-2 border-dashed border-black pb-2">
                <h1 className="text-xl font-bold mb-1">شەهلا خان</h1>
                <h2 className="text-sm font-bold mb-2">خواردمەنی</h2>
                <p className="text-[10px]">سلێمانی - شەقامی سەرەکی</p>
                <p className="text-[10px]">0770 123 4567</p>
            </div>

            {/* Transaction Info */}
            <div className="mb-4 border-b-2 border-dashed border-black pb-2 flex flex-col gap-1">
                <div className="flex justify-between">
                    <span>ژمارە:</span>
                    <span>#{transactionId}</span>
                </div>
                <div className="flex justify-between">
                    <span>بەروار:</span>
                    <span>{new Date(date).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex justify-between">
                    <span>کات:</span>
                    <span>{new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            {/* Items */}
            <div className="mb-4 text-[12px]">
                <div className="flex font-bold border-b border-black pb-1 mb-2">
                    <span className="w-1/2 text-right">کاڵا</span>
                    <span className="w-1/6 text-center">بڕ</span>
                    <span className="w-1/3 text-left">کۆی گشتی</span>
                </div>
                {Object.entries(cart).map(([name, item]) => (
                    <div key={name} className="flex mb-1" dir="rtl">
                        <span className="w-1/2 text-right truncate pl-1">{item.name}</span>
                        <span className="w-1/6 text-center">x{item.qty}</span>
                        <span className="w-1/3 text-left ltr" dir="ltr">{item.subtotal.toLocaleString()}</span>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="border-t-2 border-dashed border-black pt-2 mb-4">
                <div className="flex justify-between font-bold text-[14px] mb-1">
                    <span>کۆی گشتی:</span>
                    <span>{totalAmount.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between text-[11px]">
                    <span>ژمارەی پارچە:</span>
                    <span>{totalItems}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] border-t-2 border-dashed border-black pt-2">
                <p className="font-bold mb-1">سوپاس بۆ کڕینەکەت</p>
                <p>Thank you for your purchase</p>
                <p className="mt-2 text-[8px]">Software by Myxelvo</p>
            </div>
        </div>
    );
}
