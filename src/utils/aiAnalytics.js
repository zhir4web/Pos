
// Kurdish Date Formatter
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IQ').format(amount) + ' د.ع';
};

const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['پەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی', 'شەممە'];
    return days[date.getDay()];
};

// 1. Best Selling Products
const getBestSellers = (transactions, products) => {
    const productCounts = {};
    let totalItemsSold = 0;

    transactions.forEach(tx => {
        // Handle both new detailed transactions and old string-based ones
        if (tx.cart) {
            tx.cart.forEach(item => {
                const id = item.id || products.find(p => p.name === item.name)?.id;
                if (!id) return;
                productCounts[id] = (productCounts[id] || 0) + item.qty;
                totalItemsSold += item.qty;
            });
        }
    });

    const sortedProducts = Object.entries(productCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([id, count]) => {
            const product = products.find(p => p.id == id);
            return {
                name: product?.name || 'نەزانراو',
                count: count,
                percentage: Math.round((count / totalItemsSold) * 100)
            };
        });

    return sortedProducts;
};

// 2. Sales Trends (This Week vs Last Week)
const getSalesTrends = (transactions) => {
    const now = new Date();
    // Reset to start of today for consistent comparison
    now.setHours(23, 59, 59, 999);

    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    let thisWeekTotal = 0;
    let lastWeekTotal = 0;

    transactions.forEach(tx => {
        const txDate = new Date(tx.date);
        txDate.setHours(12, 0, 0, 0); // Avoid timezone issues by setting to noon

        // Comparing timestamps
        if (txDate > oneWeekAgo && txDate <= now) {
            thisWeekTotal += tx.total;
        } else if (txDate > twoWeeksAgo && txDate <= oneWeekAgo) {
            lastWeekTotal += tx.total;
        }
    });

    const growth = lastWeekTotal === 0 ? 100 : Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);

    return {
        thisWeek: thisWeekTotal,
        lastWeek: lastWeekTotal,
        growth: growth,
        isPositive: growth >= 0
    };
};

// 3. Peak Hours
const getPeakHours = (transactions) => {
    const hourCounts = new Array(24).fill(0);
    let totalTx = 0;

    transactions.forEach(tx => {
        // Parse time if it's stored separately or construct from date
        // Assuming tx.time is "HH:MM AM/PM" or similar, or derived from date
        // Since mock data will standardize, let's look at how we generate it. 
        // Assuming we can parse standard date or ISO string.
        // Let's rely on `tx.date` being ISO string in our new system, 
        // but existing system uses `date`: "YYYY-MM-DD", `time`: "HH:mm".

        if (tx.time) {
            let hour = parseInt(tx.time.split(':')[0]);
            if (tx.time.includes('PM') && hour !== 12) hour += 12;
            if (tx.time.includes('AM') && hour === 12) hour = 0;
            // Basic parsing for "05:30" 24h format which is standard in Date().toLocaleTimeString('ku-IQ')? 
            // Actually 'ku-IQ' might use Arabic numerals or specific formats. 
            // To be safe, we will likely store ISO date in new transactions or standard 24h format.
            // Fallback: try to parse time string, if NaN, skip.
            if (!isNaN(hour)) {
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
                totalTx++;
            }
        }
    });

    // Find heaviest 3-hour block
    let bestStart = 0;
    let maxCount = 0;
    for (let i = 0; i < 24; i++) {
        let count = hourCounts[i] + hourCounts[(i + 1) % 24] + hourCounts[(i + 2) % 24];
        if (count > maxCount) {
            maxCount = count;
            bestStart = i;
        }
    }

    const percentage = totalTx === 0 ? 0 : Math.round((maxCount / totalTx) * 100);

    // Format range
    const formatHour = (h) => {
        const ampm = h >= 12 ? 'ئێوارە' : 'بەیانی';
        const h12 = h % 12 || 12;
        return `${h12}`; // Keep it simple: 5-8
    };

    // Require at least 3 days of data to show meaningful peak hours
    const uniqueDays = new Set(transactions.map(t => t.date.split('T')[0]));
    const hasEnoughData = uniqueDays.size >= 3;

    return {
        range: `${formatHour(bestStart)}-${formatHour((bestStart + 3) % 24)}`,
        percentage,
        hasEnoughData
    };
};

// 4. Slow Moving Items
const getSlowMovers = (transactions, products) => {
    const productCounts = {};
    products.forEach(p => productCounts[p.id] = 0);

    transactions.forEach(tx => {
        if (tx.cart) {
            tx.cart.forEach(item => {
                const id = item.id || products.find(p => p.name === item.name)?.id;
                if (id) productCounts[id] = (productCounts[id] || 0) + item.qty;
            });
        }
    });

    // Find products with lowest sales > 0 (or 0 if we want to show unsold)
    // Let's show items sold less than 5 times
    const slow = Object.entries(productCounts)
        .filter(([, count]) => count < 5)
        .map(([id, count]) => {
            const p = products.find(prod => prod.id == id);
            return { name: p?.name, count };
        })
        .filter(p => p.name) // Filter out deleted products
        .slice(0, 1); // Just take the worst one for the card

    return slow[0];
};

// 5. Product Combinations
const getProductcombinations = (transactions, products) => {
    const pairs = {};

    transactions.forEach(tx => {
        if (tx.cart && tx.cart.length > 1) {
            // Get unique product IDs in this transaction
            const itemIds = [...new Set(tx.cart.map(i => i.id || products.find(p => p.name === i.name)?.id).filter(Boolean))].sort();

            for (let i = 0; i < itemIds.length; i++) {
                for (let j = i + 1; j < itemIds.length; j++) {
                    const key = `${itemIds[i]}|${itemIds[j]}`;
                    pairs[key] = (pairs[key] || 0) + 1;
                }
            }
        }
    });

    let bestPair = null;
    let max = 0;

    Object.entries(pairs).forEach(([key, count]) => {
        if (count > max) {
            max = count;
            bestPair = key;
        }
    });

    if (bestPair) {
        const [id1, id2] = bestPair.split('|');
        const p1 = products.find(p => p.id == id1);
        const p2 = products.find(p => p.id == id2);
        return {
            p1: p1?.name,
            p2: p2?.name,
            count: max
        };
    }
    return null;
};

// 7. Day Stats
const getDayStats = (transactions) => {
    const days = {};
    transactions.forEach(tx => {
        const d = new Date(tx.date).getDay(); // 0-6
        days[d] = (days[d] || 0) + tx.total;
    });

    let bestDayIndex = 0;
    let worstDayIndex = 0;
    let maxVal = -1;
    let minVal = Infinity;

    Object.entries(days).forEach(([day, total]) => {
        if (total > maxVal) { maxVal = total; bestDayIndex = parseInt(day); }
        if (total < minVal) { minVal = total; worstDayIndex = parseInt(day); }
    });

    const dayNames = ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی', 'شەممە'];

    return {
        bestDay: dayNames[bestDayIndex],
        bestTotal: maxVal,
        worstDay: dayNames[worstDayIndex],
        worstTotal: minVal,
        hasMultipleDays: Object.keys(days).length > 1
    };
};

// Main Export
export const calculateWeeklyInsights = (transactions, products) => {
    // Filter last 7 days for most stats
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentTx = transactions.filter(t => new Date(t.date) >= sevenDaysAgo);

    // 1. Best Sellers
    const bestSellers = getBestSellers(recentTx, products);

    // 2. Trends (uses all tx to compare weeks)
    const trends = getSalesTrends(transactions);

    // 3. Peak Hours
    const peakHours = getPeakHours(recentTx);

    // 4. Slow Movers
    const slowMover = getSlowMovers(recentTx, products);

    // 5. Combinations
    const combo = getProductcombinations(recentTx, products);

    // 7. Days
    const dayStats = getDayStats(recentTx);

    // 8. Customer Behavior
    const totalRev = recentTx.reduce((sum, t) => sum + t.total, 0);
    const avgOrderValue = recentTx.length ? Math.round(totalRev / recentTx.length) : 0;

    return {
        bestSellers,
        trends,
        peakHours,
        slowMover,
        combo,
        dayStats,
        customerBehavior: {
            avgOrderValue,
            // Simple logic for item count
            avgItems: 3 // Mock/Approx
        },
        prediction: {
            // Simple projection: avg daily * 30
            monthly: Math.round((totalRev / 7) * 30)
        }
    };
};
