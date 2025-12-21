import React, { createContext, useContext, useState, useEffect } from 'react';

const SalesContext = createContext();

export const useSales = () => useContext(SalesContext);

const initialProducts = [
    { id: 1, name: 'لەفەی فلاوفل', price: 500, category: 'sandwich', img: './fast.jpg' },
    { id: 2, name: 'لەفەی مریشک', price: 1250, category: 'sandwich', img: './fast.jpg' },
    { id: 3, name: 'لەفەی کوبە', price: 1000, category: 'sandwich', img: './fast.jpg' },
    { id: 4, name: 'لەفەی جگێر', price: 1250, category: 'sandwich', img: './fast.jpg' },
    { id: 5, name: 'لەفەی هەمبەرگر', price: 1250, category: 'sandwich', img: './fast.jpg' },
    { id: 6, name: 'لەفەی شفتە', price: 1500, category: 'sandwich', img: './fast.jpg' },
    { id: 7, name: 'لەفەی پەتاتە', price: 500, category: 'sandwich', img: './fast.jpg' },
    { id: 8, name: 'لەفەی کنتاکی', price: 500, category: 'sandwich', img: './fast.jpg' },
    { id: 9, name: 'لەفەی بۆرەک', price: 500, category: 'sandwich', img: './fast.jpg' },
    { id: 10, name: 'کۆکاکۆلا', price: 500, category: 'drinks', img: './fast.jpg' },
    { id: 11, name: 'ئاوی میوە', price: 750, category: 'drinks', img: './fast.jpg' },
    { id: 12, name: 'دۆ', price: 250, category: 'drinks', img: './fast.jpg' },
];

export const SalesProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState(initialProducts);

    // Generate Mock Data on Mount - REMOVED for production/real usage
    // useEffect(() => { ... }, []);

    const addTransaction = (transaction) => {
        setTransactions(prev => [transaction, ...prev]);
    };

    const addProduct = (product) => {
        setProducts(prev => [...prev, { ...product, id: Date.now() }]);
    };

    const deleteProduct = (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const updateProduct = (updatedProduct) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    // Derived Statistics
    const totalSales = transactions.reduce((sum, tx) => sum + tx.total, 0);
    const totalOrders = transactions.length;
    // Fix: Ensure we match ISO date string YYYY-MM-DD
    const todaySales = transactions
        .filter(tx => tx.date.split('T')[0] === new Date().toISOString().split('T')[0])
        .reduce((sum, tx) => sum + tx.total, 0);

    return (
        <SalesContext.Provider value={{ transactions, addTransaction, totalSales, totalOrders, todaySales, products, addProduct, deleteProduct, updateProduct }}>
            {children}
        </SalesContext.Provider>
    );
};
