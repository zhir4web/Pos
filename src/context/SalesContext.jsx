import React from 'react';
import { usePos, PosProvider } from './PosContext';

// Backwards compatibility layer
export const useSales = () => {
    const pos = usePos();
    return {
        ...pos,
        totalSales: pos.totalGrossSales,
        totalOrders: pos.totalTransactionsCount,
        todaySales: pos.todaySales,
    };
};

export const SalesProvider = PosProvider;
