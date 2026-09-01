import React, { createContext, useContext, useState, useEffect } from 'react';
import { sound } from '../utils/audioEffects';

const PosContext = createContext();

export const usePos = () => useContext(PosContext);

// Auto-purge any previous mock data on initial load
if (typeof window !== 'undefined') {
    const isCleaned = localStorage.getItem('pos_clean_v4_purged');
    if (!isCleaned) {
        // Clear all previous test & mock storage keys completely
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('pos_') || key.startsWith('sales_'))) {
                localStorage.removeItem(key);
            }
        }
        localStorage.setItem('pos_clean_v4_purged', 'true');
    }
}

// Initial Categories (Customizable)
export const initialCategories = [
    { id: 'all', name: 'هەموو خواردنەکان', icon: 'Utensils', count: 0 },
    { id: 'sandwiches', name: 'لەفە و ساندویچ', icon: 'Sandwich', count: 0 },
    { id: 'fastfood', name: 'پیتزا و فەست فوود', icon: 'Pizza', count: 0 },
    { id: 'drinks', name: 'خواردنەوە و شەربەت', icon: 'Coffee', count: 0 },
    { id: 'sides', name: 'شیرینی و زیادەکان', icon: 'IceCream', count: 0 },
];

// Clean Zero State - Empty Products for User Customization
export const initialProducts = [];

// Clean Zero State - Empty Storage Inventory
export const initialInventory = [];

// Clean Zero State - Empty Customers
export const initialCustomers = [];

// Clean Zero State - Empty Expenses
export const initialExpenses = [];

// Clean Zero State - Default Tables
export const initialTables = [
    { id: 1, name: 'مێزی ١', capacity: 4, status: 'خاڵی', activeOrder: null },
    { id: 2, name: 'مێزی ٢', capacity: 4, status: 'خاڵی', activeOrder: null },
    { id: 3, name: 'مێزی ٣', capacity: 4, status: 'خاڵی', activeOrder: null },
    { id: 4, name: 'مێزی ٤', capacity: 6, status: 'خاڵی', activeOrder: null },
];

// Clean Initial Settings
export const initialSettings = {
    restaurantName: 'ناوی چێشتخانە',
    restaurantNameEn: 'Restaurant Name',
    phone: '0770 000 0000',
    address: 'ناونیشانی چێشتخانە و شوێن',
    currency: 'د.ع',
    printerWidth: '80mm', // '80mm' | '58mm'
    taxRate: 0,
    serviceFee: 0,
    soundEnabled: true,
    autoPrintReceipt: true,
    theme: 'dark' // 'dark' | 'light'
};

export const PosProvider = ({ children }) => {
    // Products State
    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('pos_products_v4');
        return saved !== null ? JSON.parse(saved) : [];
    });

    // Inventory State
    const [inventory, setInventory] = useState(() => {
        const saved = localStorage.getItem('pos_inventory_v4');
        return saved !== null ? JSON.parse(saved) : [];
    });

    // Customers State
    const [customers, setCustomers] = useState(() => {
        const saved = localStorage.getItem('pos_customers_v4');
        return saved !== null ? JSON.parse(saved) : [];
    });

    // Expenses State
    const [expenses, setExpenses] = useState(() => {
        const saved = localStorage.getItem('pos_expenses_v4');
        return saved !== null ? JSON.parse(saved) : [];
    });

    // Tables State
    const [tables, setTables] = useState(() => {
        const saved = localStorage.getItem('pos_tables_v4');
        return saved !== null ? JSON.parse(saved) : initialTables;
    });

    // Transactions / Orders History
    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('pos_transactions_v4');
        return saved !== null ? JSON.parse(saved) : [];
    });

    // Held Orders
    const [heldOrders, setHeldOrders] = useState(() => {
        const saved = localStorage.getItem('pos_held_orders_v4');
        return saved !== null ? JSON.parse(saved) : [];
    });

    // Shift Register State
    const [currentShift, setCurrentShift] = useState(() => {
        const saved = localStorage.getItem('pos_current_shift_v4');
        return saved !== null ? JSON.parse(saved) : {
            isOpen: true,
            openedAt: new Date().toISOString(),
            startingCash: 0,
            cashierName: 'کاشێری سەرەکی',
        };
    });

    // Settings State
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('pos_settings_v4');
        return saved !== null ? JSON.parse(saved) : initialSettings;
    });

    // Save to LocalStorage whenever states update
    useEffect(() => {
        localStorage.setItem('pos_products_v4', JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem('pos_inventory_v4', JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        localStorage.setItem('pos_customers_v4', JSON.stringify(customers));
    }, [customers]);

    useEffect(() => {
        localStorage.setItem('pos_expenses_v4', JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        localStorage.setItem('pos_tables_v4', JSON.stringify(tables));
    }, [tables]);

    useEffect(() => {
        localStorage.setItem('pos_transactions_v4', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('pos_held_orders_v4', JSON.stringify(heldOrders));
    }, [heldOrders]);

    useEffect(() => {
        localStorage.setItem('pos_current_shift_v4', JSON.stringify(currentShift));
    }, [currentShift]);

    useEffect(() => {
        localStorage.setItem('pos_settings_v4', JSON.stringify(settings));
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

    // Hard Clear / Purge all data to clean zero state
    const resetToFactoryData = () => {
        setProducts([]);
        setInventory([]);
        setCustomers([]);
        setExpenses([]);
        setTables(initialTables);
        setTransactions([]);
        setHeldOrders([]);
        setCurrentShift({
            isOpen: true,
            openedAt: new Date().toISOString(),
            startingCash: 0,
            cashierName: 'کاشێری سەرەکی',
        });
        setSettings(initialSettings);
        
        // Clear all localStorage keys completely
        localStorage.clear();
        localStorage.setItem('pos_clean_v4_purged', 'true');
        
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
        downloadAnchor.setAttribute("download", `pos_backup_${new Date().toISOString().split('T')[0]}.json`);
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
