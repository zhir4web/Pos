import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useSales } from '../context/SalesContext';
import { useUI } from '../context/UIContext';
import { ProductSkeleton, ButtonLoader } from '../components/LoadingComponents';
import { EmptyState } from '../components/ErrorComponents';
import ReceiptPrint from '../components/ReceiptPrint';

const categories = [
    { id: 'all', name: 'هەموو', icon: 'fa-utensils' },
    { id: 'sandwich', name: 'لەفەکان', icon: 'fa-hamburger' },
    { id: 'drinks', name: 'خواردنەوەکان', icon: 'fa-glass-cheers' },
    { id: 'sides', name: 'زیادەکان', icon: 'fa-box' },
];

export default function PosDashboard() {
    const [cart, setCart] = useState({});
    const [activeCategory, setActiveCategory] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showCart, setShowCart] = useState(false); // Mobile cart toggle
    const [isLoading, setIsLoading] = useState(true); // Product loading state
    const [shouldPrint, setShouldPrint] = useState(() => {
        const saved = localStorage.getItem('shouldPrint');
        return saved !== null ? JSON.parse(saved) : true;
    });

    // Simulate initial loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    // New Product Form State
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'sandwich', img: './fast.jpg' });
    const [editingProduct, setEditingProduct] = useState(null); // Track which product is being edited
    const [lastTransaction, setLastTransaction] = useState(null); // For receipt printing

    const { addTransaction, products, addProduct, deleteProduct, updateProduct } = useSales();
    const { addToast } = useUI();

    const getCount = (id) => cart[id] || 0;

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProduct(prev => ({ ...prev, img: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setNewProduct({ name: product.name, price: String(product.price), category: product.category, img: product.img });
        setShowAddProductModal(true);
    };

    const handleCreateProduct = (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price) return;

        if (editingProduct) {
            updateProduct({
                id: editingProduct.id,
                name: newProduct.name,
                price: Number(newProduct.price),
                category: newProduct.category,
                img: newProduct.img
            });
            addToast('بەرهەمەکە بە سەرکەوتوویی نوێکرایەوە', 'success');
        } else {
            addProduct({
                ...newProduct,
                price: Number(newProduct.price)
            });
            addToast('بەرهەمەکە زیادکرا', 'success');
        }

        setShowAddProductModal(false);
        setNewProduct({ name: '', price: '', category: 'sandwich', img: './fast.jpg' });
        setEditingProduct(null);
    };

    const handleAdd = (id) => {
        setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const handleSubtract = (id) => {
        setCart(prev => {
            const newCount = (prev[id] || 0) - 1;
            if (newCount <= 0) {
                const newCart = { ...prev };
                delete newCart[id];
                return newCart;
            }
            return { ...prev, [id]: newCount };
        });
    };

    const handleDelete = (id) => {
        setCart(prev => {
            const newCart = { ...prev };
            delete newCart[id];
            return newCart;
        });
        addToast('بەرهەمەکە لە سەبەتە سڕایەوە', 'info');
    };

    const calculateTotal = () => {
        return Object.entries(cart).reduce((total, [id, count]) => {
            const food = products.find(f => f.id === parseInt(id));
            return total + (food ? food.price * count : 0);
        }, 0);
    };

    const handleSell = () => {
        if (totalItems === 0) return;

        // Create Transaction Object
        const itemsDescription = Object.entries(cart).map(([id, count]) => {
            const food = products.find(f => f.id === parseInt(id));
            return `${count}x ${food.name}`;
        }).join(', ');

        const newTransaction = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('ku-IQ', { hour: '2-digit', minute: '2-digit' }),
            items: itemsDescription,
            total: totalAmount,
            method: 'کاش',
            status: 'تەواو'
        };

        addTransaction(newTransaction);

        // Save for printing BEFORE clearing cart
        const printCart = Object.entries(cart).map(([id, count]) => {
            const food = products.find(f => f.id === parseInt(id));
            return {
                name: food?.name || 'Unknown',
                qty: count,
                subtotal: (food?.price || 0) * count
            };
        });

        setLastTransaction({
            ...newTransaction,
            cart: printCart, // Detailed cart for printing
            date: new Date().toISOString()
        });

        setCart({});
        setShowModal(true);
        addToast('فرۆشتنەکە بە سەرکەوتوویی ئەنجامدرا', 'success');

        // Auto print ONLY if enabled
        if (shouldPrint) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredFoods = activeCategory === 'all'
        ? products
        : products.filter(f => f.category === activeCategory);

    const totalAmount = calculateTotal();
    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

    return (
        <Layout title="POS (فرۆشتن)">
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
                {/* Left Side: Product Grid */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Categories & Add Button */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl whitespace-nowrap transition-all ${activeCategory === cat.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-white border border-gray-100 dark:border-gray-700'
                                        }`}
                                >
                                    <i className={`fas ${cat.icon}`}></i>
                                    <span className="font-bold">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                setEditingProduct(null);
                                setNewProduct({ name: '', price: '', category: 'sandwich', img: '/fast.jpg' });
                                setShowAddProductModal(true);
                            }}
                            className="bg-slate-800 dark:bg-blue-600 text-white px-4 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap hover:bg-slate-700 dark:hover:bg-blue-500 transition"
                        >
                            <i className="fas fa-plus"></i>
                            <span className="hidden sm:inline">زیادکردن</span>
                        </button>
                    </div>
                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto pr-2 pb-20 lg:pb-0">
                        {isLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
                                {[...Array(8)].map((_, i) => (
                                    <ProductSkeleton key={i} />
                                ))}
                            </div>
                        ) : filteredFoods.length === 0 ? (
                            <EmptyState
                                icon="fa-search"
                                title="هیچ بەرهەمێک نەدۆزرایەوە"
                                message="هەوڵبدە لە هاوپۆلێکی تر بگەڕێیت یان بەرهەمی نوێ زیاد بکەیت."
                                action={
                                    <button
                                        onClick={() => setActiveCategory('all')}
                                        className="text-blue-600 hover:underline font-bold"
                                    >
                                        بینینی هەموو بەرهەمەکان
                                    </button>
                                }
                            />
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
                                {filteredFoods.map((food) => (
                                    <div key={food.id} className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all group flex flex-col h-full animate-fade-in hover:translate-y-[-2px]">
                                        <div className="relative mb-3 overflow-hidden rounded-xl h-28 group-hover:shadow-md transition-shadow">
                                            <img src={food.img} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            {getCount(food.id) > 0 && (
                                                <div className="absolute top-2 right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md animate-bounce">
                                                    {getCount(food.id)}
                                                </div>
                                            )}
                                            {/* Delete Product Button */}
                                            <div className="absolute top-2 left-2 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(food);
                                                    }}
                                                    className="bg-blue-500/90 hover:bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-lg transition-transform active:scale-95"
                                                    title="دەستکاری"
                                                >
                                                    <i className="fas fa-pen"></i>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm('دڵنیایت لە سڕینەوەی ئەم بەرهەمە؟')) {
                                                            deleteProduct(food.id);
                                                            addToast('بەرهەمەکە سڕایەوە', 'warning');
                                                        }
                                                    }}
                                                    className="bg-red-500/90 hover:bg-red-600 text-white w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-lg transition-transform active:scale-95"
                                                    title="سڕینەوە"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-800 dark:text-white mb-1">{food.name}</h3>
                                        <div className="mt-auto flex justify-between items-end">
                                            <span className="font-medium text-gray-500 dark:text-gray-400 text-sm">{food.price.toLocaleString()} د.ع</span>
                                            <button
                                                onClick={() => {
                                                    handleAdd(food.id);
                                                    addToast(`${food.name} زیادکرا`, 'info');
                                                }}
                                                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all active:scale-90 text-blue-600 dark:text-blue-400"
                                            >
                                                <i className="fas fa-plus text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Cart Toggle Button */}
                <button
                    onClick={() => setShowCart(!showCart)}
                    className="lg:hidden fixed bottom-4 left-4 right-4 bg-blue-600 text-white py-4 rounded-2xl shadow-xl flex items-center justify-between px-6 z-40"
                >
                    <div className="flex items-center gap-3">
                        <i className="fas fa-shopping-basket"></i>
                        <span className="font-bold">سەبەتە ({totalItems})</span>
                    </div>
                    <span className="font-bold">{totalAmount.toLocaleString()} د.ع</span>
                </button>

                {/* Right Side: Cart Sidebar */}
                <div className={`
                    fixed lg:static inset-0 lg:inset-auto z-50 lg:z-auto
                    ${showCart ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
                    lg:w-96 bg-white dark:bg-gray-800 lg:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 
                    flex flex-col transition-transform duration-300 lg:transition-none
                `}>
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                            <i className="fas fa-shopping-basket text-blue-500"></i>
                            سەبەتەی کڕین <span className="text-sm font-normal text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-600">{totalItems} دوگمە</span>
                        </h3>
                        <button onClick={() => setShowCart(false)} className="lg:hidden text-gray-500 hover:text-red-500 text-xl">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {Object.keys(cart).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 opacity-60">
                                <i className="fas fa-shopping-cart text-4xl mb-3"></i>
                                <p>سەبەتە بەتاڵە</p>
                            </div>
                        ) : (
                            Object.entries(cart).map(([id, count]) => {
                                const food = products.find(f => f.id === parseInt(id));
                                if (!food) return null;
                                return (
                                    <div key={id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                                        <img src={food.img} alt={food.name} className="w-12 h-12 rounded-lg object-cover" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-gray-800 dark:text-white">{food.name}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{food.price * count} د.ع</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-1 py-1 shadow-sm">
                                            <button onClick={() => handleSubtract(id)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500"><i className="fas fa-minus text-[10px]"></i></button>
                                            <span className="text-sm font-bold w-4 text-center dark:text-white">{count}</span>
                                            <button onClick={() => handleAdd(id)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-500"><i className="fas fa-plus text-[10px]"></i></button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="p-5 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                <span>کۆی دانەکان</span>
                                <span>{totalItems}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white">
                                <span>کۆی گشتی</span>
                                <span className="text-blue-600 dark:text-blue-400">{totalAmount.toLocaleString()} د.ع</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-2">
                                <i className={`fas fa-print ${shouldPrint ? 'text-blue-500' : 'text-gray-400'}`}></i>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">چاپکردنی پسوڵە</span>
                            </div>
                            <button
                                onClick={() => {
                                    const newValue = !shouldPrint;
                                    setShouldPrint(newValue);
                                    localStorage.setItem('shouldPrint', JSON.stringify(newValue));
                                }}
                                className={`w-12 h-6 rounded-full transition-colors relative ${shouldPrint ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${shouldPrint ? 'right-1' : 'right-7'}`}></div>
                            </button>
                        </div>
                        <button
                            onClick={handleSell}
                            disabled={totalItems === 0}
                            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 dark:shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-check-circle"></i>
                            تەواوکردنی داواکاری
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl transform transition-all scale-100">
                            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                                <i className="fas fa-check"></i>
                            </div>
                            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">داواکاری سەرکەوتوو بوو</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">فرۆشتنەکە بە سەرکەوتوویی تۆمارکرا <br /><span className="font-bold text-gray-800 dark:text-gray-200">#{lastTransaction?.id}</span></p>

                            <div className="flex flex-col gap-3">
                                <button onClick={handlePrint} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                                    <i className="fas fa-print"></i>
                                    چاپکردنی پسوڵە
                                </button>
                                <button onClick={() => setShowModal(false)} className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 rounded-xl transition-colors">
                                    باشە، داخستن
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Hidden Receipt Component */}
            <ReceiptPrint
                cart={lastTransaction?.cart}
                totalAmount={lastTransaction?.total}
                transactionId={lastTransaction?.id}
                date={lastTransaction?.date}
            />


            {/* Add Product Modal */}
            {
                showAddProductModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
                            <h2 className="text-xl font-bold mb-6 border-b pb-2">{editingProduct ? 'دەستکاری بەرهەم' : 'زیادکردنی بەرهەمی نوێ'}</h2>
                            <form onSubmit={handleCreateProduct} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">ناوی بەرهەم</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                                        value={newProduct.name}
                                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                        placeholder="نموونە: پیتزا"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">نرخ (دینار)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                                            value={newProduct.price}
                                            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                            placeholder="1000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">جۆر</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                                            value={newProduct.category}
                                            onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                        >
                                            <option value="sandwich">لەفەکان</option>
                                            <option value="drinks">خواردنەوەکان</option>
                                            <option value="sides">زیادەکان</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">وێنەی بەرهەم</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        onChange={handleImageUpload}
                                    />
                                    {newProduct.img !== '/fast.jpg' && (
                                        <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                            <i className="fas fa-check"></i> وێنە هەڵبژێردرا
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button type="button" onClick={() => setShowAddProductModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors">
                                        پاشگەزبوونەوە
                                    </button>
                                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                                        {editingProduct ? 'تۆمارکردن' : 'زیادکردن'}
                                    </button>
                                </div>
                            </form>
                        </div >
                    </div >
                )
            }
        </Layout >
    );
}
