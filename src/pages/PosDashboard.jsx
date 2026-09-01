import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { usePos, initialCategories } from '../context/PosContext';
import { useUI } from '../context/UIContext';
import { sound } from '../utils/audioEffects';
import ReceiptModal from '../components/ReceiptModal';
import KitchenTicketModal from '../components/KitchenTicketModal';
import confetti from 'canvas-confetti';

export default function PosDashboard() {
    const { 
        products, 
        addProduct, 
        updateProduct, 
        deleteProduct,
        addTransaction, 
        heldOrders, 
        holdCurrentOrder, 
        removeHeldOrder,
        tables,
        customers,
        settings 
    } = usePos();
    const { addToast } = useUI();

    // Order Type State
    const [orderType, setOrderType] = useState('بردنەدەرەوە'); // 'لە ناوەوە' | 'بردنەدەرەوە' | 'گەیاندن'
    const [selectedTable, setSelectedTable] = useState(null);
    const [deliveryInfo, setDeliveryInfo] = useState({ customerName: '', phone: '', address: '' });

    // Category & Search State
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef(null);

    // Cart State: { [productId]: { qty: number, note?: string } }
    const [cart, setCart] = useState({});
    
    // Discount State
    const [discountType, setDiscountType] = useState('fixed'); // 'fixed' | 'percentage'
    const [discountValue, setDiscountValue] = useState(0);

    // Modals
    const [showPayModal, setShowPayModal] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);
    const [showHeldOrdersModal, setShowHeldOrdersModal] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showMobileCart, setShowMobileCart] = useState(false);

    // Payment Form State
    const [paymentMethod, setPaymentMethod] = useState('کاش');
    const [paidAmount, setPaidAmount] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [autoPrintReceipt, setAutoPrintReceipt] = useState(settings.autoPrintReceipt);
    const [autoPrintKOT, setAutoPrintKOT] = useState(false);

    // Last completed transaction for receipt
    const [completedTx, setCompletedTx] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [showKOTModal, setShowKOTModal] = useState(false);

    // Product Add/Edit Form
    const [productForm, setProductForm] = useState({
        name: '',
        price: '',
        cost: '',
        category: 'sandwiches',
        emoji: '🍔',
        stock: 50
    });

    // Keyboard Shortcuts Listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                searchInputRef.current?.focus();
            } else if (e.key === 'F2') {
                e.preventDefault();
                if (totalCartItems > 0) handleHoldOrder();
            } else if (e.key === 'F4') {
                e.preventDefault();
                handleClearCart();
            } else if (e.key === 'Escape') {
                setShowPayModal(false);
                setShowTableModal(false);
                setShowHeldOrdersModal(false);
                setShowAddProductModal(false);
                setShowReceiptModal(false);
                setShowKOTModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart]);

    // Filter products
    const filteredProducts = products.filter((p) => {
        const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (p.nameEn && p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    // Cart Operations
    const addToCart = (product) => {
        setCart(prev => {
            const current = prev[product.id] || { qty: 0, note: '' };
            return {
                ...prev,
                [product.id]: { ...current, qty: current.qty + 1 }
            };
        });
        sound.beep();
    };

    const subtractFromCart = (productId) => {
        setCart(prev => {
            const current = prev[productId];
            if (!current) return prev;
            if (current.qty <= 1) {
                const newCart = { ...prev };
                delete newCart[productId];
                return newCart;
            }
            return {
                ...prev,
                [productId]: { ...current, qty: current.qty - 1 }
            };
        });
        sound.subBeep();
    };

    const removeFromCart = (productId) => {
        setCart(prev => {
            const newCart = { ...prev };
            delete newCart[productId];
            return newCart;
        });
        sound.subBeep();
    };

    const updateItemNote = (productId, note) => {
        setCart(prev => {
            if (!prev[productId]) return prev;
            return {
                ...prev,
                [productId]: { ...prev[productId], note }
            };
        });
    };

    const handleClearCart = () => {
        if (Object.keys(cart).length === 0) return;
        setCart({});
        setSelectedTable(null);
        setDiscountValue(0);
        sound.subBeep();
        addToast('سەبەتە بە تەواوی خاوێنکرایەوە', 'info');
    };

    // Calculate Financials
    const cartEntries = Object.entries(cart).map(([pId, item]) => {
        const product = products.find(p => p.id === Number(pId));
        return {
            id: Number(pId),
            name: product?.name || 'خواردن',
            price: product?.price || 0,
            cost: product?.cost || (product?.price * 0.45) || 0,
            qty: item.qty,
            note: item.note || '',
            emoji: product?.emoji || '🍽️',
            subtotal: (product?.price || 0) * item.qty
        };
    });

    const totalCartItems = cartEntries.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cartEntries.reduce((sum, item) => sum + item.subtotal, 0);
    const totalCost = cartEntries.reduce((sum, item) => sum + (item.cost * item.qty), 0);

    const calculatedDiscount = discountType === 'percentage' 
        ? Math.round((subtotal * Number(discountValue || 0)) / 100)
        : Number(discountValue || 0);

    const totalDue = Math.max(0, subtotal - calculatedDiscount);

    // Hold Order
    const handleHoldOrder = () => {
        if (totalCartItems === 0) return;
        holdCurrentOrder({
            cart,
            orderType,
            selectedTable,
            deliveryInfo,
            subtotal,
            discountType,
            discountValue,
            itemCount: totalCartItems
        });
        setCart({});
        setSelectedTable(null);
        addToast('داواکارییەکە لە سەبەتەی هەڵگیراو پاشەکەوت کرا', 'success');
    };

    // Restore Held Order
    const handleRestoreHeldOrder = (held) => {
        setCart(held.cart);
        setOrderType(held.orderType);
        setSelectedTable(held.selectedTable);
        setDeliveryInfo(held.deliveryInfo || { customerName: '', phone: '', address: '' });
        setDiscountType(held.discountType || 'fixed');
        setDiscountValue(held.discountValue || 0);
        removeHeldOrder(held.id);
        setShowHeldOrdersModal(false);
        addToast('داواکارییە هەڵگیراوەکە گەڕێندرایەوە', 'info');
    };

    // Open Payment Modal
    const handleOpenPayment = () => {
        if (totalCartItems === 0) {
            addToast('تکایە سەرەتا خواردن زیادبکە بۆ سەبەتە', 'warning');
            return;
        }
        setPaidAmount(String(totalDue));
        setShowPayModal(true);
    };

    // Complete Checkout
    const handleCompletePayment = (e) => {
        e.preventDefault();
        
        const customer = customers.find(c => c.id === Number(selectedCustomerId));
        const customerName = orderType === 'گەیاندن' ? deliveryInfo.customerName : customer?.name || 'کڕیاری گشتی';

        const newTx = {
            id: Date.now(),
            orderNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString(),
            dateFormatted: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('ku-IQ', { hour: '2-digit', minute: '2-digit' }),
            orderType,
            tableNumber: selectedTable?.name || null,
            tableId: selectedTable?.id || null,
            customerId: customer?.id || null,
            customerName,
            deliveryAddress: orderType === 'گەیاندن' ? deliveryInfo.address : null,
            deliveryPhone: orderType === 'گەیاندن' ? deliveryInfo.phone : null,
            cart: cartEntries,
            items: cartEntries.map(i => `${i.qty}x ${i.name}`).join(', '),
            subtotal,
            discount: calculatedDiscount,
            total: totalDue,
            estimatedCost: totalCost,
            profit: totalDue - totalCost,
            method: paymentMethod,
            paidAmount: Number(paidAmount) || totalDue,
            cashier: settings.restaurantName
        };

        addTransaction(newTx);
        setCompletedTx(newTx);
        setShowPayModal(false);

        // Confetti celebration
        try {
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
            });
        } catch (err) {}

        // Reset Cart
        setCart({});
        setSelectedTable(null);
        setDiscountValue(0);
        setDeliveryInfo({ customerName: '', phone: '', address: '' });
        setShowMobileCart(false);

        addToast('فرۆشتنەکە بە سەرکەوتوویی تۆمارکرا!', 'success');

        // Show Receipts based on preferences
        if (autoPrintKOT) {
            setShowKOTModal(true);
        } else if (autoPrintReceipt) {
            setShowReceiptModal(true);
        }
    };

    // Save New / Edited Product
    const handleSaveProduct = (e) => {
        e.preventDefault();
        if (!productForm.name || !productForm.price) return;

        if (editingProduct) {
            updateProduct({
                ...editingProduct,
                name: productForm.name,
                price: Number(productForm.price),
                cost: Number(productForm.cost) || Number(productForm.price) * 0.45,
                category: productForm.category,
                emoji: productForm.emoji,
                stock: Number(productForm.stock) || 50
            });
            addToast('خواردنەکە نوێکرایەوە', 'success');
        } else {
            addProduct({
                name: productForm.name,
                price: Number(productForm.price),
                cost: Number(productForm.cost) || Number(productForm.price) * 0.45,
                category: productForm.category,
                emoji: productForm.emoji,
                stock: Number(productForm.stock) || 50,
                color: 'from-amber-500 to-orange-600',
                available: true
            });
            addToast('خواردنی نوێ بە سەرکەوتوویی زیادکرا', 'success');
        }

        setShowAddProductModal(false);
        setEditingProduct(null);
        setProductForm({ name: '', price: '', cost: '', category: 'sandwiches', emoji: '🍔', stock: 50 });
    };

    const openEditProduct = (prod, e) => {
        e.stopPropagation();
        setEditingProduct(prod);
        setProductForm({
            name: prod.name,
            price: String(prod.price),
            cost: String(prod.cost || ''),
            category: prod.category,
            emoji: prod.emoji || '🍔',
            stock: prod.stock || 50
        });
        setShowAddProductModal(true);
    };

    return (
        <Layout 
            title="سیستەمی کاشێری خێرا" 
            subtitle="شاشەی فرۆشتن و دەرکردنی وەسڵ"
            extraHeaderAction={
                heldOrders.length > 0 && (
                    <button
                        onClick={() => setShowHeldOrdersModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 text-xs font-black transition-all border border-amber-500/30"
                    >
                        <i className="fas fa-hand-holding-hand"></i>
                        <span>سەبەتەی ڕاگیراو ({heldOrders.length})</span>
                    </button>
                )
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
                
                {/* Left/Center Products Catalog (8 Cols) */}
                <div className="lg:col-span-8 flex flex-col h-full space-y-4">
                    
                    {/* Top Control Bar: Order Types & Quick Actions */}
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
                        
                        {/* Order Type Toggle Tabs */}
                        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl">
                            <button
                                onClick={() => {
                                    setOrderType('بردنەدەرەوە');
                                    setSelectedTable(null);
                                    sound.click();
                                }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    orderType === 'بردنەدەرەوە'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <i className="fas fa-bag-shopping"></i>
                                <span>بردنەدەرەوە (Takeaway)</span>
                            </button>

                            <button
                                onClick={() => {
                                    setOrderType('لە ناوەوە');
                                    setShowTableModal(true);
                                    sound.click();
                                }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    orderType === 'لە ناوەوە'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <i className="fas fa-utensils"></i>
                                <span>سەرمێز {selectedTable ? `(${selectedTable.name})` : ''}</span>
                            </button>

                            <button
                                onClick={() => {
                                    setOrderType('گەیاندن');
                                    setSelectedTable(null);
                                    sound.click();
                                }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    orderType === 'گەیاندن'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <i className="fas fa-motorcycle"></i>
                                <span>گەیاندن (Delivery)</span>
                            </button>
                        </div>

                        {/* Search and Add Food Button */}
                        <div className="flex items-center gap-2 flex-1 max-w-sm">
                            <div className="relative flex-1">
                                <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="گەڕان بەپێی ناو... (F1)"
                                    className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <i className="fas fa-times text-xs"></i>
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    setEditingProduct(null);
                                    setProductForm({ name: '', price: '', cost: '', category: 'sandwiches', emoji: '🍔', stock: 50 });
                                    setShowAddProductModal(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap border border-slate-200 dark:border-slate-700"
                            >
                                <i className="fas fa-plus"></i>
                                <span>خواردنی نوێ</span>
                            </button>
                        </div>
                    </div>

                    {/* Categories Pill Scroller */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {initialCategories.map((cat) => {
                            const isCatActive = activeCategory === cat.id;
                            const count = cat.id === 'all' 
                                ? products.length 
                                : products.filter(p => p.category === cat.id).length;

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setActiveCategory(cat.id);
                                        sound.click();
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 ${
                                        isCatActive
                                            ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-md translate-y-[-1px]'
                                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500'
                                    }`}
                                >
                                    <span>{cat.name}</span>
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                                        isCatActive ? 'bg-white/20 text-white dark:text-slate-950 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto pr-0.5">
                        {filteredProducts.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                                <i className="fas fa-utensils text-4xl mb-3 opacity-30"></i>
                                <p className="font-bold text-sm">هیچ خواردنێک نەدۆزرایەوە</p>
                                <p className="text-xs text-slate-500 mt-1">تکایە وشەی گەڕانەکەت بگۆڕە یان خواردنی نوێ زیاد بکە</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                                {filteredProducts.map((product) => {
                                    const inCartQty = cart[product.id]?.qty || 0;
                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-3.5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:translate-y-[-2px] flex flex-col justify-between select-none ${
                                                inCartQty > 0 
                                                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md dark:border-amber-500' 
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                        >
                                            {/* In-cart badge indicator */}
                                            {inCartQty > 0 && (
                                                <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow animate-pop-in">
                                                    {inCartQty}
                                                </div>
                                            )}

                                            {/* Top emoji / image avatar */}
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
                                                    {product.emoji || '🍽️'}
                                                </div>
                                                <button
                                                    onClick={(e) => openEditProduct(product, e)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-amber-500 transition-opacity"
                                                    title="دەستکاری خواردن"
                                                >
                                                    <i className="fas fa-ellipsis-vertical text-xs"></i>
                                                </button>
                                            </div>

                                            {/* Name and Category */}
                                            <div className="mb-2">
                                                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                                                    {product.name}
                                                </h3>
                                                {product.nameEn && (
                                                    <p className="text-[10px] text-slate-400 truncate">{product.nameEn}</p>
                                                )}
                                            </div>

                                            {/* Price and Stock Bottom Bar */}
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                                <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                                                    {product.price.toLocaleString()} {settings.currency}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {product.stock ? `${product.stock} دانە` : 'بەردەست'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side Cart Terminal (4 Cols) */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col h-full">
                    
                    {/* Cart Header */}
                    <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm font-bold">
                                <i className="fas fa-receipt"></i>
                            </div>
                            <div>
                                <h3 className="font-black text-sm text-slate-900 dark:text-white">سەبەتەی داواکاری</h3>
                                <p className="text-[10px] text-slate-500">
                                    {orderType} {selectedTable ? `• ${selectedTable.name}` : ''}
                                </p>
                            </div>
                        </div>

                        {totalCartItems > 0 && (
                            <button
                                onClick={handleClearCart}
                                title="خاوێنکردنەوەی سەبەتە (F4)"
                                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs"
                            >
                                <i className="fas fa-trash-can"></i>
                            </button>
                        )}
                    </div>

                    {/* Delivery Form inputs if Delivery order */}
                    {orderType === 'گەیاندن' && (
                        <div className="py-2.5 px-3 my-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5 text-xs">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={deliveryInfo.customerName}
                                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, customerName: e.target.value })}
                                    placeholder="ناوی کڕیار..."
                                    className="w-1/2 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-white"
                                />
                                <input
                                    type="text"
                                    value={deliveryInfo.phone}
                                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                                    placeholder="مۆبایل..."
                                    className="w-1/2 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-white"
                                    dir="ltr"
                                />
                            </div>
                            <input
                                type="text"
                                value={deliveryInfo.address}
                                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                                placeholder="ناونیشان / شوێنی گەیاندن..."
                                className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-white"
                            />
                        </div>
                    )}

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-0.5">
                        {cartEntries.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mb-3 opacity-60">
                                    🛒
                                </div>
                                <p className="font-bold text-sm text-slate-600 dark:text-slate-300">سەبەتە بەتاڵە</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">کلیک لەسەر خواردنەکان بکە بۆ زیادکردن بۆ ئەم داواکارییە</p>
                            </div>
                        ) : (
                            cartEntries.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all space-y-1.5"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="text-lg">{item.emoji}</span>
                                            <div className="overflow-hidden">
                                                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{item.name}</h4>
                                                <span className="text-[10px] text-slate-400">{item.price.toLocaleString()} {settings.currency}</span>
                                            </div>
                                        </div>

                                        {/* Total Subtotal for item */}
                                        <span className="font-black text-xs text-slate-900 dark:text-white">
                                            {item.subtotal.toLocaleString()} {settings.currency}
                                        </span>
                                    </div>

                                    {/* Action Bar: Note & Qty Counter */}
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-xs">
                                        {/* Custom Note input */}
                                        <input
                                            type="text"
                                            value={item.note}
                                            onChange={(e) => updateItemNote(item.id, e.target.value)}
                                            placeholder="تێبینی (بێ پیاز...)"
                                            className="w-32 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                        />

                                        {/* Qty +/- */}
                                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <button
                                                onClick={() => subtractFromCart(item.id)}
                                                className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                                            >
                                                <i className="fas fa-minus"></i>
                                            </button>
                                            <span className="w-6 text-center font-black text-xs text-slate-900 dark:text-white">{item.qty}</span>
                                            <button
                                                onClick={() => addToCart(products.find(p => p.id === item.id))}
                                                className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                                            >
                                                <i className="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Cart Summary & Checkout Footer */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                        
                        {/* Discount Input Row */}
                        <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500 font-bold">داشکاندن:</span>
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    value={discountValue || ''}
                                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                                    placeholder="0"
                                    className="w-20 px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-white"
                                />
                                <button
                                    onClick={() => setDiscountType(prev => prev === 'fixed' ? 'percentage' : 'fixed')}
                                    className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-black text-[10px] text-slate-700 dark:text-slate-200"
                                >
                                    {discountType === 'percentage' ? '%' : settings.currency}
                                </button>
                            </div>
                        </div>

                        {/* Calculations */}
                        <div className="space-y-1 text-slate-600 dark:text-slate-400">
                            <div className="flex justify-between">
                                <span>کۆی سەرەتایی:</span>
                                <span>{subtotal.toLocaleString()} {settings.currency}</span>
                            </div>
                            {calculatedDiscount > 0 && (
                                <div className="flex justify-between text-rose-500 font-bold">
                                    <span>داشکاندن:</span>
                                    <span>- {calculatedDiscount.toLocaleString()} {settings.currency}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800 font-black text-base text-slate-900 dark:text-white">
                                <span>کۆی گشتی:</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                                    {totalDue.toLocaleString()} {settings.currency}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons: Hold and Pay */}
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={handleHoldOrder}
                                disabled={totalCartItems === 0}
                                title="ڕاگرتنی داواکاری (F2)"
                                className="px-3 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors disabled:opacity-40"
                            >
                                <i className="fas fa-hand-holding"></i>
                            </button>

                            <button
                                onClick={handleOpenPayment}
                                disabled={totalCartItems === 0}
                                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 disabled:opacity-40"
                            >
                                <i className="fas fa-credit-card"></i>
                                <span>پارەدان و وەرگرتن ({totalDue.toLocaleString()})</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Table Selection Modal */}
            {showTableModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-pop-in">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-lg">
                                    <i className="fas fa-chair"></i>
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">هەڵبژاردنی مێز</h3>
                                    <p className="text-xs text-slate-500">مێزی داواکاری بۆ میوانان دیاری بکە</p>
                                </div>
                            </div>
                            <button onClick={() => setShowTableModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                            {tables.map((tbl) => (
                                <button
                                    key={tbl.id}
                                    onClick={() => {
                                        setSelectedTable(tbl);
                                        setShowTableModal(false);
                                        sound.click();
                                    }}
                                    className={`p-4 rounded-2xl border text-center transition-all ${
                                        selectedTable?.id === tbl.id
                                            ? 'bg-amber-500 text-slate-950 font-black border-amber-600 shadow-lg scale-105'
                                            : tbl.status === 'پڕە'
                                                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-500'
                                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-800 dark:text-slate-200'
                                    }`}
                                >
                                    <i className="fas fa-chair text-2xl mb-1.5"></i>
                                    <h4 className="font-extrabold text-sm">{tbl.name}</h4>
                                    <span className="text-[10px] opacity-70 block">{tbl.capacity} کەسی</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Held Orders Modal */}
            {showHeldOrdersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-pop-in max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">سەبەتە هەڵگیراوەکان ({heldOrders.length})</h3>
                            <button onClick={() => setShowHeldOrdersModal(false)} className="text-slate-400 hover:text-white">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-3 space-y-2">
                            {heldOrders.map((held) => (
                                <div key={held.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-sm text-slate-900 dark:text-white">{held.orderType}</span>
                                            {held.selectedTable && <span className="text-xs text-amber-500 font-bold">({held.selectedTable.name})</span>}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">کات: {held.heldAt} • {held.itemCount} خواردن</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-sm text-emerald-500">{held.subtotal.toLocaleString()} {settings.currency}</span>
                                        <button
                                            onClick={() => handleRestoreHeldOrder(held)}
                                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow"
                                        >
                                            هێنانەوە
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Payment Modal */}
            {showPayModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-pop-in">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="font-black text-lg text-slate-900 dark:text-white">پارەدان و وەرگرتن</h3>
                                <p className="text-xs text-slate-500">کۆی گشتی بۆ وەرگرتن</p>
                            </div>
                            <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-white">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        {/* Grand Total Display */}
                        <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 text-center">
                            <span className="text-xs font-bold text-slate-500 uppercase">بڕی پارەی پێویست</span>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">
                                {totalDue.toLocaleString()} <span className="text-amber-500 text-lg">{settings.currency}</span>
                            </h2>
                        </div>

                        <form onSubmit={handleCompletePayment} className="space-y-4">
                            
                            {/* Payment Method Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">شێوازی پارەدان</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['کاش', 'FastPay', 'FIB', 'ZainCash', 'کارتی بانکی', 'قەرز'].map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setPaymentMethod(m)}
                                            className={`py-2 rounded-xl text-xs font-bold transition-all ${
                                                paymentMethod === m
                                                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                            }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* If Debt, Select Customer */}
                            {paymentMethod === 'قەرز' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">کڕیاری قەرزدار دیاری بکە</label>
                                    <select
                                        value={selectedCustomerId}
                                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="">هەڵبژاردنی کڕیار...</option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} - (قەرزی ئێستا: {c.debt.toLocaleString()} {settings.currency})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Cash Tendered & Change Return */}
                            {paymentMethod === 'کاش' && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">بڕی پارەی وەرگیراو لە کڕیار</label>
                                    <input
                                        type="number"
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-center text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />

                                    {/* Quick Cash Suggestions */}
                                    <div className="flex gap-1.5">
                                        {[totalDue, 5000, 10000, 25000, 50000].map((amt, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setPaidAmount(String(amt))}
                                                className="flex-1 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold rounded-lg text-slate-700 dark:text-slate-300"
                                            >
                                                {amt.toLocaleString()}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Change Return Box */}
                                    {Number(paidAmount) > totalDue && (
                                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                            <span>پارەی گەڕاوە بۆ کڕیار (Change):</span>
                                            <span className="font-mono text-base font-black">
                                                {(Number(paidAmount) - totalDue).toLocaleString()} {settings.currency}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Print Options */}
                            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoPrintReceipt}
                                        onChange={(e) => setAutoPrintReceipt(e.target.checked)}
                                        className="rounded text-amber-500 focus:ring-amber-500"
                                    />
                                    <span>پیشاندانی وەسڵی کڕیار</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoPrintKOT}
                                        onChange={(e) => setAutoPrintKOT(e.target.checked)}
                                        className="rounded text-rose-500 focus:ring-rose-500"
                                    />
                                    <span>وەسڵی چێشتخانە (KOT)</span>
                                </label>
                            </div>

                            {/* Complete Button */}
                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-base transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-check-double"></i>
                                <span>تەواوکردنی فرۆشتن و تۆمارکردن</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add / Edit Product Modal */}
            {showAddProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-pop-in">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                                {editingProduct ? 'دەستکاری خواردن' : 'زیادکردنی خواردنی نوێ'}
                            </h3>
                            <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-white">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ناوی خواردن</label>
                                <input
                                    type="text"
                                    required
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    placeholder="نموونە: لەفەی مریشک..."
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نرخی فرۆشتن ({settings.currency})</label>
                                    <input
                                        type="number"
                                        required
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                        placeholder="2000"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تێچوون ({settings.currency})</label>
                                    <input
                                        type="number"
                                        value={productForm.cost}
                                        onChange={(e) => setProductForm({ ...productForm, cost: e.target.value })}
                                        placeholder="1000"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">بەش (Category)</label>
                                    <select
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="sandwiches">لەفە و ساندویچ</option>
                                        <option value="fastfood">پیتزا و کریسپی</option>
                                        <option value="drinks">خواردنەوە و شەربەت</option>
                                        <option value="sides">شیرینی و زیادەکان</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ئیمۆجی / وێنە</label>
                                    <input
                                        type="text"
                                        value={productForm.emoji}
                                        onChange={(e) => setProductForm({ ...productForm, emoji: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-center text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-3">
                                {editingProduct && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            deleteProduct(editingProduct.id);
                                            setShowAddProductModal(false);
                                            addToast('خواردنەکە سڕایەوە', 'info');
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
                                    {editingProduct ? 'پاشەکەوتکردنی گۆڕانکاری' : 'زیادکردنی خواردن'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Receipt Modal Trigger */}
            <ReceiptModal
                transaction={completedTx}
                isOpen={showReceiptModal}
                onClose={() => setShowReceiptModal(false)}
            />

            {/* KOT Modal Trigger */}
            <KitchenTicketModal
                transaction={completedTx}
                isOpen={showKOTModal}
                onClose={() => setShowKOTModal(false)}
            />
        </Layout>
    );
}
