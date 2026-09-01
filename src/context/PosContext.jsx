import React, { createContext, useContext, useState, useEffect } from 'react';
import { sound } from '../utils/audioEffects';

const PosContext = createContext();

export const usePos = () => useContext(PosContext);

// Initial Categories
export const initialCategories = [
    { id: 'all', name: 'هەموو خواردنەکان', icon: 'Utensils', count: 0 },
    { id: 'sandwiches', name: 'لەفە و ساندویچ', icon: 'Sandwich', count: 0 },
    { id: 'fastfood', name: 'پیتزا و کریسپی', icon: 'Pizza', count: 0 },
    { id: 'drinks', name: 'خواردنەوە و شەربەت', icon: 'Coffee', count: 0 },
    { id: 'sides', name: 'شیرینی و زیادەکان', icon: 'IceCream', count: 0 },
];

// Initial Products with Kurdish names, real prices, estimated cost, and category
export const initialProducts = [
    {
        id: 1,
        name: 'لەفەی فەلافلی تایبەت',
        nameEn: 'Special Falafel',
        price: 750,
        cost: 350,
        category: 'sandwiches',
        emoji: '🧆',
        color: 'from-amber-500 to-orange-600',
        available: true,
        stock: 80,
        ingredients: ['فەلافل', 'نان', 'خەیارشوور', 'عەمبە']
    },
    {
        id: 2,
        name: 'لەفەی مریشکی شاوەرما',
        nameEn: 'Chicken Shawarma',
        price: 2000,
        cost: 1000,
        category: 'sandwiches',
        emoji: '🌯',
        color: 'from-orange-500 to-amber-600',
        available: true,
        stock: 50,
        ingredients: ['مریشک', 'نان', 'سۆسی سیر', 'پەتاتە']
    },
    {
        id: 3,
        name: 'لەفەی گۆشتی شاوەرما',
        nameEn: 'Beef Shawarma',
        price: 2500,
        cost: 1300,
        category: 'sandwiches',
        emoji: '🥙',
        color: 'from-red-600 to-rose-700',
        available: true,
        stock: 40,
        ingredients: ['گۆشت', 'نان', 'تەحین', 'پیاز و جەعفەری']
    },
    {
        id: 4,
        name: 'هەمبەرگری گۆشتی دەبڵ پەنیر',
        nameEn: 'Double Cheese Beef Burger',
        price: 3500,
        cost: 1800,
        category: 'sandwiches',
        emoji: '🍔',
        color: 'from-yellow-500 to-amber-600',
        available: true,
        stock: 35,
        ingredients: ['گۆشت', 'سەمونی هەمبەرگر', 'پەنیری چیدەر', 'کاهو']
    },
    {
        id: 5,
        name: 'هەمبەرگری کریسپی مریشک',
        nameEn: 'Crispy Chicken Burger',
        price: 3000,
        cost: 1400,
        category: 'sandwiches',
        emoji: '🍔',
        color: 'from-orange-400 to-amber-500',
        available: true,
        stock: 45,
        ingredients: ['مریشک', 'سەمونی هەمبەرگر', 'مایۆنیس', 'پەتاتە']
    },
    {
        id: 6,
        name: 'لەفەی جگەری سوورکراوە',
        nameEn: 'Fried Liver Sandwich',
        price: 1500,
        cost: 750,
        category: 'sandwiches',
        emoji: '🥪',
        color: 'from-rose-600 to-red-800',
        available: true,
        stock: 25,
        ingredients: ['جگەر', 'نان', 'لیمۆ', 'سۆسی تیژ']
    },
    {
        id: 7,
        name: 'لەفەی شفتە و کەباب',
        nameEn: 'Shifta / Kebab Sandwich',
        price: 2000,
        cost: 1000,
        category: 'sandwiches',
        emoji: '🌯',
        color: 'from-amber-600 to-orange-700',
        available: true,
        stock: 30,
        ingredients: ['گۆشت', 'نان', 'تەماتەی برژاو', 'سەوزە']
    },
    {
        id: 8,
        name: 'پیتزای پێپەرۆنی قەبارەی گەورە',
        nameEn: 'Large Pepperoni Pizza',
        price: 8000,
        cost: 4000,
        category: 'fastfood',
        emoji: '🍕',
        color: 'from-red-500 to-orange-600',
        available: true,
        stock: 20,
        ingredients: ['هەویر', 'پێپەرۆنی', 'پەنیری مۆزارێلا', 'سۆسی پیتزا']
    },
    {
        id: 9,
        name: 'پیتزای مریشک و قارچک',
        nameEn: 'Chicken & Mushroom Pizza',
        price: 7500,
        cost: 3700,
        category: 'fastfood',
        emoji: '🍕',
        color: 'from-amber-500 to-yellow-600',
        available: true,
        stock: 22,
        ingredients: ['هەویر', 'مریشک', 'قارچک', 'پەنیر']
    },
    {
        id: 10,
        name: 'وەجبەی کنتاکی ٤ پارچە',
        nameEn: '4-Piece Crispy Meal',
        price: 6500,
        cost: 3200,
        category: 'fastfood',
        emoji: '🍗',
        color: 'from-amber-500 to-orange-600',
        available: true,
        stock: 30,
        ingredients: ['مریشک', 'پەتاتە', 'سۆس', 'نانی بچووک']
    },
    {
        id: 11,
        name: 'پەتاتەی سوورکراوەی گەورە',
        nameEn: 'Large French Fries',
        price: 1500,
        cost: 600,
        category: 'fastfood',
        emoji: '🍟',
        color: 'from-yellow-400 to-amber-500',
        available: true,
        stock: 60,
        ingredients: ['پەتاتە', 'ڕۆن', 'خوێ و بەهارات']
    },
    {
        id: 12,
        name: 'باڵی مریشکی سوورکراوە (٦ دانە)',
        nameEn: 'Fried Chicken Wings',
        price: 4500,
        cost: 2200,
        category: 'fastfood',
        emoji: '🍗',
        color: 'from-orange-600 to-red-600',
        available: true,
        stock: 25,
        ingredients: ['مریشک', 'سۆسی باربیکیۆ']
    },
    {
        id: 13,
        name: 'کۆکاکۆلا قتوو سارد',
        nameEn: 'Coca Cola Can',
        price: 500,
        cost: 300,
        category: 'drinks',
        emoji: '🥤',
        color: 'from-red-600 to-red-700',
        available: true,
        stock: 120,
        ingredients: []
    },
    {
        id: 14,
        name: 'پێپسی قتوو سارد',
        nameEn: 'Pepsi Can',
        price: 500,
        cost: 300,
        category: 'drinks',
        emoji: '🥤',
        color: 'from-blue-600 to-indigo-700',
        available: true,
        stock: 100,
        ingredients: []
    },
    {
        id: 15,
        name: 'فەنتا پرتەقاڵ قتوو',
        nameEn: 'Fanta Orange Can',
        price: 500,
        cost: 300,
        category: 'drinks',
        emoji: '🥤',
        color: 'from-orange-500 to-amber-600',
        available: true,
        stock: 80,
        ingredients: []
    },
    {
        id: 16,
        name: 'شەربەتی مۆز و شلیک فرێش',
        nameEn: 'Fresh Banana Strawberry',
        price: 2000,
        cost: 900,
        category: 'drinks',
        emoji: '🍓',
        color: 'from-pink-500 to-rose-600',
        available: true,
        stock: 40,
        ingredients: ['مۆز', 'شلیک', 'شیر']
    },
    {
        id: 17,
        name: 'شەربەتی پرتەقاڵی سروشتی',
        nameEn: 'Fresh Orange Juice',
        price: 2000,
        cost: 800,
        category: 'drinks',
        emoji: '🍊',
        color: 'from-orange-400 to-amber-500',
        available: true,
        stock: 40,
        ingredients: ['پرتەقاڵ']
    },
    {
        id: 18,
        name: 'دۆی کوردی سەفەری',
        nameEn: 'Kurdish Ayran / Do',
        price: 500,
        cost: 250,
        category: 'drinks',
        emoji: '🥛',
        color: 'from-slate-400 to-blue-500',
        available: true,
        stock: 75,
        ingredients: ['ماست', 'ئاو', 'نەعناع']
    },
    {
        id: 19,
        name: 'ئاوی کانزایی پاک',
        nameEn: 'Mineral Water',
        price: 250,
        cost: 100,
        category: 'drinks',
        emoji: '💧',
        color: 'from-cyan-500 to-blue-600',
        available: true,
        stock: 150,
        ingredients: []
    },
    {
        id: 20,
        name: 'کێک و دۆناتی شوکولاتە',
        nameEn: 'Chocolate Donut',
        price: 1500,
        cost: 700,
        category: 'sides',
        emoji: '🍩',
        color: 'from-amber-700 to-stone-800',
        available: true,
        stock: 30,
        ingredients: ['هەویر', 'شوکولاتە']
    },
    {
        id: 21,
        name: 'پارچە کنافەی گەرم بە پەنیر',
        nameEn: 'Hot Cheese Kunafa',
        price: 2500,
        cost: 1100,
        category: 'sides',
        emoji: '🍰',
        color: 'from-amber-500 to-orange-600',
        available: true,
        stock: 20,
        ingredients: ['کنافە', 'پەنیر', 'شیلە']
    },
    {
        id: 22,
        name: 'سۆسی سیری تایبەت',
        nameEn: 'Garlic Dip',
        price: 500,
        cost: 150,
        category: 'sides',
        emoji: '🥣',
        color: 'from-slate-300 to-slate-500',
        available: true,
        stock: 60,
        ingredients: ['سیر', 'مایۆنیس']
    },
    {
        id: 23,
        name: 'سۆسی پەنیری چیدەری شل',
        nameEn: 'Cheddar Cheese Sauce',
        price: 750,
        cost: 250,
        category: 'sides',
        emoji: '🧀',
        color: 'from-yellow-400 to-amber-500',
        available: true,
        stock: 50,
        ingredients: ['پەنیر']
    }
];

// Initial Inventory Items for Storage Department
export const initialInventory = [
    { id: 101, name: 'فەلافلی ئامادەکراو', category: 'خۆراک', quantity: 280, unit: 'دانە', minStock: 60, costPerUnit: 100, supplier: 'کارگەی فەلافل' },
    { id: 102, name: 'سینگی مریشکی پاککراو', category: 'گۆشت', quantity: 38, unit: 'کیلۆ', minStock: 10, costPerUnit: 5500, supplier: 'کۆمپانیای تەڕەزاق' },
    { id: 103, name: 'گۆشتی سووری تازی گۆلک', category: 'گۆشت', quantity: 24, unit: 'کیلۆ', minStock: 8, costPerUnit: 12000, supplier: 'قەسابخانەی ناوەندی' },
    { id: 104, name: 'نانی سەمونی هەمبەرگر و لەفە', category: 'نانەوا', quantity: 180, unit: 'دانە', minStock: 50, costPerUnit: 150, supplier: 'فڕنی شەهلا' },
    { id: 105, name: 'پەتاتەی بەستووی پریمیۆم', category: 'خۆراک', quantity: 45, unit: 'کیس/کیلۆ', minStock: 15, costPerUnit: 2500, supplier: 'کۆمپانیای فەست فوود' },
    { id: 106, name: 'پەنیری مۆزارێلای ئەڵمانی', category: 'شیرەمەنی', quantity: 18, unit: 'کیلۆ', minStock: 6, costPerUnit: 7000, supplier: 'شیرەمەنی ئاراس' },
    { id: 107, name: 'ڕۆنی سوورکردنەوەی ۱۰ لیتری', category: 'پێداویستی', quantity: 7, unit: 'دەبە', minStock: 2, costPerUnit: 18000, supplier: 'بازرگانی ئارۆ' },
    { id: 108, name: 'کۆکاکۆلا و خواردنەوەی ۲۴ دانەیی', category: 'ساردەمەنی', quantity: 12, unit: 'کارتۆن', minStock: 4, costPerUnit: 7200, supplier: 'کۆمپانیای کۆکاکۆلا' },
    { id: 109, name: 'مایۆنیس و کەچەپی ٥ کیلۆیی', category: 'سۆس', quantity: 8, unit: 'دەبە', minStock: 3, costPerUnit: 12000, supplier: 'کۆمپانیای سۆس پرۆ' },
    { id: 110, name: 'خەیارشوور و ترشیاتی خۆماڵی', category: 'سەوزە', quantity: 22, unit: 'کیلۆ', minStock: 5, costPerUnit: 1200, supplier: 'عەلوەی سلێمانی' },
];

// Initial Customers
export const initialCustomers = [
    { id: 1, name: 'کاک هێمن ئەحمەد', phone: '0770 123 4567', debt: 15000, address: 'گەڕەکی ڕزگاری، شەقامی ٢٠', notes: 'کڕیاری بەردەوام - داواکاری گەیاندن' },
    { id: 2, name: 'مامۆستا پشتیوان عەلی', phone: '0750 987 6543', debt: 8500, address: 'تەنیشت قوتابخانەی کوردستان', notes: 'پارەی هەفتانە دەدات' },
    { id: 3, name: 'ڕەوەند عوسمان', phone: '0771 456 7890', debt: 0, address: 'شەقامی تووی مەلیك', notes: 'هەمیشە بە کاش پارە دەدات' },
    { id: 4, name: 'دکتۆر کاروان کەمال', phone: '0751 333 2211', debt: 22000, address: 'کلینیکی پسپۆڕی، بەرامبەر نەخۆشخانە', notes: 'وەجبەی نیوەڕۆیان بۆ کارمەندان' },
];

// Initial Expenses
export const initialExpenses = [
    { id: 1, title: 'پارەی مۆلیدەی گەڕەک', amount: 35000, category: 'مۆلیدە و کارەبا', date: new Date().toISOString().split('T')[0], time: '10:30', note: 'بۆ مانگی ٨' },
    { id: 2, title: 'کڕینی سەوزە و تەماتە لە عەلوە', amount: 28000, category: 'کڕینی ڕۆژانە', date: new Date().toISOString().split('T')[0], time: '08:15', note: 'خەیار، کاهو، تەماتە' },
    { id: 3, title: 'پاککەرەوە و کلینکس و قاپ', amount: 15000, category: 'پێداویستی پاکوخاوێنی', date: new Date().toISOString().split('T')[0], time: '14:00', note: 'ماددەی پاککەرەوە و دەستەسڕ' },
];

// Initial Tables (مێزەکان بۆ Dine-In)
export const initialTables = [
    { id: 1, name: 'مێزی ١', capacity: 4, status: 'خاڵی', activeOrder: null },
    { id: 2, name: 'مێزی ٢', capacity: 4, status: 'خاڵی', activeOrder: null },
    { id: 3, name: 'مێزی ٣', capacity: 6, status: 'خاڵی', activeOrder: null },
    { id: 4, name: 'مێزی ٤ (VIP)', capacity: 8, status: 'خاڵی', activeOrder: null },
    { id: 5, name: 'مێزی ٥', capacity: 2, status: 'خاڵی', activeOrder: null },
    { id: 6, name: 'مێزی ٦', capacity: 4, status: 'خاڵی', activeOrder: null },
    { id: 7, name: 'مێزی ٧ (دەرەوە)', capacity: 4, status: 'خاڵی', activeOrder: null },
    { id: 8, name: 'مێزی ٨ (دەرەوە)', capacity: 6, status: 'خاڵی', activeOrder: null },
];

// Generate 10 realistic past sample transactions for immediate rich charts and reports
const generateSampleTransactions = () => {
    const today = new Date();
    const mockTxs = [];
    const sampleItems = [
        { id: 2, name: 'لەفەی مریشکی شاوەرما', price: 2000, qty: 2 },
        { id: 13, name: 'کۆکاکۆلا قتوو سارد', price: 500, qty: 2 },
        { id: 11, name: 'پەتاتەی سوورکراوەی گەورە', price: 1500, qty: 1 }
    ];

    for (let i = 0; i < 8; i++) {
        const d = new Date(today.getTime() - i * 3600 * 1000 * 3);
        mockTxs.push({
            id: 1001 + i,
            orderNumber: `#${1001 + i}`,
            date: d.toISOString(),
            dateFormatted: d.toISOString().split('T')[0],
            time: d.toLocaleTimeString('ku-IQ', { hour: '2-digit', minute: '2-digit' }),
            orderType: i % 3 === 0 ? 'لە ناوەوە' : i % 3 === 1 ? 'بردنەدەرەوە' : 'گەیاندن',
            tableNumber: i % 3 === 0 ? `مێزی ${(i % 6) + 1}` : null,
            customerName: i % 3 === 2 ? 'کاک هێمن' : 'کڕیاری گشتی',
            items: '٢x لەفەی مریشک, ٢x کۆکاکۆلا, ١x پەتاتە',
            cart: sampleItems.map(item => ({ ...item, subtotal: item.price * item.qty })),
            subtotal: 6500,
            discount: i % 2 === 0 ? 500 : 0,
            total: i % 2 === 0 ? 6000 : 6500,
            estimatedCost: 3100,
            profit: (i % 2 === 0 ? 6000 : 6500) - 3100,
            method: i % 4 === 0 ? 'FastPay' : i % 4 === 1 ? 'FIB' : 'کاش',
            status: 'تەواوکراو',
            cashier: 'ئەحمەد کاشێر'
        });
    }
    return mockTxs;
};

export const PosProvider = ({ children }) => {
    // Products State
    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('pos_products_v2');
        return saved ? JSON.parse(saved) : initialProducts;
    });

    // Inventory State
    const [inventory, setInventory] = useState(() => {
        const saved = localStorage.getItem('pos_inventory_v2');
        return saved ? JSON.parse(saved) : initialInventory;
    });

    // Customers State
    const [customers, setCustomers] = useState(() => {
        const saved = localStorage.getItem('pos_customers_v2');
        return saved ? JSON.parse(saved) : initialCustomers;
    });

    // Expenses State
    const [expenses, setExpenses] = useState(() => {
        const saved = localStorage.getItem('pos_expenses_v2');
        return saved ? JSON.parse(saved) : initialExpenses;
    });

    // Tables State
    const [tables, setTables] = useState(() => {
        const saved = localStorage.getItem('pos_tables_v2');
        return saved ? JSON.parse(saved) : initialTables;
    });

    // Transactions / Orders History
    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('pos_transactions_v2');
        return saved ? JSON.parse(saved) : generateSampleTransactions();
    });

    // Held Orders (سەبەتە ڕاگیراوەکان)
    const [heldOrders, setHeldOrders] = useState(() => {
        const saved = localStorage.getItem('pos_held_orders_v2');
        return saved ? JSON.parse(saved) : [];
    });

    // Shift Register State
    const [currentShift, setCurrentShift] = useState(() => {
        const saved = localStorage.getItem('pos_current_shift_v2');
        return saved ? JSON.parse(saved) : {
            isOpen: true,
            openedAt: new Date().toISOString(),
            startingCash: 50000,
            cashierName: 'کاشێری سەرەکی',
        };
    });

    // Settings State
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('pos_settings_v2');
        return saved ? JSON.parse(saved) : {
            restaurantName: 'خواردەمەنی شەهلا خان',
            restaurantNameEn: 'Shahla Khan Restaurant',
            phone: '0770 123 4567',
            address: 'سلێمانی - شەقامی سالم، تەنیشت باخی گشتی',
            currency: 'د.ع',
            printerWidth: '80mm', // '80mm' | '58mm'
            taxRate: 0,
            serviceFee: 0,
            soundEnabled: true,
            autoPrintReceipt: true,
            theme: 'dark' // 'dark' | 'light'
        };
    });

    // Save to LocalStorage whenever states update
    useEffect(() => {
        localStorage.setItem('pos_products_v2', JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem('pos_inventory_v2', JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        localStorage.setItem('pos_customers_v2', JSON.stringify(customers));
    }, [customers]);

    useEffect(() => {
        localStorage.setItem('pos_expenses_v2', JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        localStorage.setItem('pos_tables_v2', JSON.stringify(tables));
    }, [tables]);

    useEffect(() => {
        localStorage.setItem('pos_transactions_v2', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('pos_held_orders_v2', JSON.stringify(heldOrders));
    }, [heldOrders]);

    useEffect(() => {
        localStorage.setItem('pos_current_shift_v2', JSON.stringify(currentShift));
    }, [currentShift]);

    useEffect(() => {
        localStorage.setItem('pos_settings_v2', JSON.stringify(settings));
        sound.enabled = settings.soundEnabled;
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings]);

    // Transaction Actions
    const addTransaction = (newTx) => {
        setTransactions(prev => [newTx, ...prev]);
        sound.cashRegister();

        // If customer used debt, update customer balance
        if (newTx.method === 'قەرز' && newTx.customerId) {
            setCustomers(prev => prev.map(c => 
                c.id === newTx.customerId ? { ...c, debt: c.debt + newTx.total } : c
            ));
        }

        // If dine-in order, update table status
        if (newTx.tableId) {
            setTables(prev => prev.map(t => 
                t.id === newTx.tableId ? { ...t, status: 'خاڵی', activeOrder: null } : t
            ));
        }
    };

    // Product CRUD
    const addProduct = (item) => {
        const id = Date.now();
        setProducts(prev => [{ ...item, id }, ...prev]);
        sound.success();
    };

    const updateProduct = (updated) => {
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        sound.success();
    };

    const deleteProduct = (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        sound.subBeep();
    };

    // Inventory CRUD
    const addInventoryItem = (item) => {
        const id = Date.now();
        setInventory(prev => [{ ...item, id }, ...prev]);
        sound.success();
    };

    const updateInventoryItem = (updated) => {
        setInventory(prev => prev.map(i => i.id === updated.id ? updated : i));
        sound.success();
    };

    const deleteInventoryItem = (id) => {
        setInventory(prev => prev.filter(i => i.id !== id));
        sound.subBeep();
    };

    // Customer CRUD
    const addCustomer = (cust) => {
        const id = Date.now();
        setCustomers(prev => [{ ...cust, id, debt: Number(cust.debt) || 0 }, ...prev]);
        sound.success();
    };

    const updateCustomer = (updated) => {
        setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
        sound.success();
    };

    const recordCustomerPayment = (customerId, paidAmount) => {
        setCustomers(prev => prev.map(c => {
            if (c.id === customerId) {
                const newDebt = Math.max(0, c.debt - Number(paidAmount));
                return { ...c, debt: newDebt };
            }
            return c;
        }));
        sound.cashRegister();
    };

    // Expense CRUD
    const addExpense = (exp) => {
        const id = Date.now();
        setExpenses(prev => [{ ...exp, id }, ...prev]);
        sound.success();
    };

    const deleteExpense = (id) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
        sound.subBeep();
    };

    // Hold Orders
    const holdCurrentOrder = (orderData) => {
        const newHold = {
            id: Date.now(),
            heldAt: new Date().toLocaleTimeString('ku-IQ', { hour: '2-digit', minute: '2-digit' }),
            ...orderData
        };
        setHeldOrders(prev => [newHold, ...prev]);
        sound.beep();
    };

    const removeHeldOrder = (holdId) => {
        setHeldOrders(prev => prev.filter(h => h.id !== holdId));
    };

    // Shift Management
    const openShift = (cashierName, startingCash) => {
        setCurrentShift({
            isOpen: true,
            openedAt: new Date().toISOString(),
            startingCash: Number(startingCash) || 0,
            cashierName: cashierName || 'کاشێر',
        });
        sound.success();
    };

    const closeShift = (actualCashCount) => {
        const closedShift = {
            ...currentShift,
            isOpen: false,
            closedAt: new Date().toISOString(),
            actualCashCount: Number(actualCashCount) || 0
        };
        setCurrentShift(closedShift);
        sound.cashRegister();
        return closedShift;
    };

    // Settings update
    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
        sound.success();
    };

    // Reset / Demo Data loader
    const resetToFactoryData = () => {
        setProducts(initialProducts);
        setInventory(initialInventory);
        setCustomers(initialCustomers);
        setExpenses(initialExpenses);
        setTables(initialTables);
        setTransactions(generateSampleTransactions());
        setHeldOrders([]);
        sound.success();
    };

    // Export/Import Database JSON
    const exportDataAsJson = () => {
        const allData = {
            products,
            inventory,
            customers,
            expenses,
            tables,
            transactions,
            settings,
            exportDate: new Date().toISOString()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `shahla_khan_pos_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        sound.success();
    };

    const importDataFromJson = (jsonData) => {
        try {
            if (jsonData.products) setProducts(jsonData.products);
            if (jsonData.inventory) setInventory(jsonData.inventory);
            if (jsonData.customers) setCustomers(jsonData.customers);
            if (jsonData.expenses) setExpenses(jsonData.expenses);
            if (jsonData.tables) setTables(jsonData.tables);
            if (jsonData.transactions) setTransactions(jsonData.transactions);
            if (jsonData.settings) setSettings(jsonData.settings);
            sound.success();
            return { success: true };
        } catch (e) {
            sound.error();
            return { success: false, error: e.message };
        }
    };

    // Financial Metrics Calculation
    const totalGrossSales = transactions.reduce((sum, tx) => sum + (tx.total || 0), 0);
    const totalTransactionsCount = transactions.length;
    
    // Today's stats
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(tx => tx.date && tx.date.split('T')[0] === todayStr);
    const todaySales = todayTransactions.reduce((sum, tx) => sum + (tx.total || 0), 0);
    const todayOrdersCount = todayTransactions.length;

    // Total Expenses
    const totalExpensesAmount = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    const todayExpenses = expenses
        .filter(exp => exp.date === todayStr)
        .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    // Total Cost of Goods Sold (COGS)
    const totalEstimatedCost = transactions.reduce((sum, tx) => sum + (tx.estimatedCost || (tx.total * 0.45)), 0);
    const netProfit = totalGrossSales - totalEstimatedCost - totalExpensesAmount;

    // Total Customer Outstanding Debt
    const totalOutstandingDebt = customers.reduce((sum, c) => sum + (c.debt || 0), 0);

    // Low Stock Alert Count
    const lowStockCount = inventory.filter(item => item.quantity <= item.minStock).length;

    return (
        <PosContext.Provider value={{
            products,
            addProduct,
            updateProduct,
            deleteProduct,
            inventory,
            addInventoryItem,
            updateInventoryItem,
            deleteInventoryItem,
            customers,
            addCustomer,
            updateCustomer,
            recordCustomerPayment,
            expenses,
            addExpense,
            deleteExpense,
            tables,
            setTables,
            transactions,
            addTransaction,
            heldOrders,
            holdCurrentOrder,
            removeHeldOrder,
            currentShift,
            openShift,
            closeShift,
            settings,
            updateSettings,
            resetToFactoryData,
            exportDataAsJson,
            importDataFromJson,
            // Metrics
            totalGrossSales,
            totalTransactionsCount,
            todaySales,
            todayOrdersCount,
            todayExpenses,
            totalExpensesAmount,
            totalEstimatedCost,
            netProfit,
            totalOutstandingDebt,
            lowStockCount
        }}>
            {children}
        </PosContext.Provider>
    );
};
