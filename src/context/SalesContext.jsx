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
];

export const SalesProvider = ({ children }) => {
    // Start with empty transactions as requested
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState(initialProducts);

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
    // Simple check for "today"
    const todaySales = transactions
        .filter(tx => tx.date === new Date().toISOString().split('T')[0])
        .reduce((sum, tx) => sum + tx.total, 0);

    return (
        <SalesContext.Provider value={{ transactions, addTransaction, totalSales, totalOrders, todaySales, products, addProduct, deleteProduct, updateProduct }}>
            {children}
        </SalesContext.Provider>
    );
};
