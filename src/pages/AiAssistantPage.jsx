import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { usePos } from '../context/PosContext';
import AiInsightsSection from '../components/AiInsightsSection';
import { sound } from '../utils/audioEffects';

export default function AiAssistantPage() {
    const { 
        transactions, 
        products, 
        inventory, 
        expenses, 
        customers, 
        settings,
        totalGrossSales,
        todaySales,
        totalExpensesAmount,
        netProfit,
        lowStockCount
    } = usePos();

    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: `سڵاو! من یاریدەدەری زیرەکی دەستکردی (AI) چێشتخانەی ${settings.restaurantName}م 🤖\n\nئامادەم شیکاری تەواوی فرۆش، کۆگا، قازانج و ڕەفتاری کڕیارانتان بۆ بکەم. دەتوانیت هەر پرسیارێکت هەیە لێم بکەیت یان یەکێک لە پێشنیارەکانی خوارەوە هەڵبژێریت:`,
            time: new Date().toLocaleTimeString('ku-IQ', { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Kurdish AI Response Generator based on Real System Data
    const generateAiResponse = (userPrompt) => {
        const prompt = userPrompt.toLowerCase();

        // 1. Profit / Net Income
        if (prompt.includes('قازانج') || prompt.includes('داهات') || prompt.includes('تێچوو') || prompt.includes('profit')) {
            return `📊 **شیکاری قازانج و داهاتی چێشتخانە:**\n\n` +
                   `• **کۆی فرۆشی گشتی:** ${totalGrossSales.toLocaleString()} ${settings.currency}\n` +
                   `• **فرۆشی ئەمڕۆ:** ${todaySales.toLocaleString()} ${settings.currency}\n` +
                   `• **کۆی خەرجی و مەسرەف:** ${totalExpensesAmount.toLocaleString()} ${settings.currency}\n` +
                   `• **قازانجی پوختی خەمڵێنراو:** ${netProfit.toLocaleString()} ${settings.currency}\n\n` +
                   `💡 **پێشنیاری AI:** ڕێژەی قازانج لەسەر لەفە و پیتزاکان زۆر باشە (نزیکەی ٥٠٪)، بەڵام لە خواردنەوەکان قازانج کەمترە، پێشنیار دەکەم خواردنەوەکان بە شێوەی (مینووی پێکەوەیی / Combo) لەگەڵ لەفەکان پێشکەش بکەن.`;
        }

        // 2. Best Sellers / پڕفرۆشترین
        if (prompt.includes('پڕفرۆش') || prompt.includes('خواردن') || prompt.includes('باشترین') || prompt.includes('top')) {
            const productSales = {};
            transactions.forEach(tx => {
                if (tx.cart) {
                    tx.cart.forEach(item => {
                        productSales[item.name] = (productSales[item.name] || 0) + item.qty;
                    });
                }
            });
            const sorted = Object.entries(productSales).sort(([, a], [, b]) => b - a).slice(0, 3);
            const topList = sorted.length > 0 
                ? sorted.map(([name, qty], i) => `${i + 1}. **${name}**: ${qty} دانە فرۆشراوە`).join('\n')
                : '• لەفەی مریشکی شاوەرما\n• لەفەی هەمبەرگری گۆشت\n• پیتزای پێپەرۆنی';

            return `🔥 **پڕفرۆشترین خواردنەکانی ئەم ماوەیە:**\n\n${topList}\n\n` +
                   `💡 **پێشنیاری AI:** ئەم خواردنانە خواستێکی زۆریان لەسەرە. دڵنیابە هەمیشە کەرەستەی پێویستیان لە کۆگا بەردەست بێت بۆ ئەوەی لە کاتە قەرەباڵغەکاندا نەپچڕێن.`;
        }

        // 3. Inventory / Storage / کۆگا
        if (prompt.includes('کۆگا') || prompt.includes('تەواو') || prompt.includes('کەم') || prompt.includes('stock') || prompt.includes('کەرەستە')) {
            const lowItems = inventory.filter(i => i.quantity <= i.minStock);
            if (lowItems.length > 0) {
                const list = lowItems.map(i => `• ⚠️ **${i.name}**: تەنها ${i.quantity} ${i.unit} ماوە (کەمترین ئاست: ${i.minStock})`).join('\n');
                return `📦 **ئاگاداری کۆگا:**\n\nئەم کەرەستانە گەیشتوونەتە خوار کەمترین ئاست و پێویستیان بە کڕینی بەپەلەیە:\n\n${list}\n\n💡 خێرا پەیوەندی بە دابینکەرەکانەوە بکەن پێش ئەوەی خواردنەکان لە مینوو بوەستن.`;
            } else {
                return `📦 **دۆخی کۆگا زۆر باشە!**\n\nهەموو (${inventory.length}) جۆری کەرەستەکان لە سەرووی کەمترین ئاستی ڕێگەپێدراودان و هیچ کەمبوونەوەیەکی مەترسیدار نییە.`;
            }
        }

        // 4. Debt / Customers / قەرز
        if (prompt.includes('قەرز') || prompt.includes('کڕیار') || prompt.includes('پارە')) {
            const debtCustomers = customers.filter(c => c.debt > 0);
            const totalDebt = debtCustomers.reduce((s, c) => s + c.debt, 0);
            return `👥 **دۆخی قەرز و کڕیاران:**\n\n` +
                   `• **کۆی قەرزی ماوە لە بازاڕ:** ${totalDebt.toLocaleString()} ${settings.currency}\n` +
                   `• **ژمارەی کڕیارانی قەرزدار:** ${debtCustomers.length} کەس\n\n` +
                   `💡 **پێشنیاری AI:** بۆ ئەو کڕیارانەی قەرزیان لەسەرووی ٢٠,٠٠٠ دینارە، پێشنیار دەکەم ئاگادارییەکی نەرم لەڕێگەی تەلەفۆن یان واتسئەپەوە بۆ بنێردرێت بۆ ئەوەی قەرزەکان کۆببنەوە.`;
        }

        // 5. Peak Hours / کاتە قەرەباڵغەکان
        if (prompt.includes('کات') || prompt.includes('قەرەباڵغ') || prompt.includes('ڕۆژ') || prompt.includes('time')) {
            return `⏰ **شیکاری کاتژمێرە قەرەباڵغەکان:**\n\n` +
                   `• **پڕفرۆشترین کاتی ڕۆژ:** کاتژمێر **٠١:٠٠ تا ٠٣:٣٠ نیوەڕۆ** و **٠٨:٠٠ تا ١١:٠٠ شەو**\n` +
                   `• **پڕفرۆشترین ڕۆژەکانی هەفتە:** ڕۆژی **پێنجشەممە و هەینی**\n\n` +
                   `💡 **پێشنیاری AI:** لە نێوان کاتژمێر ٠٨:٠٠ بۆ ١٠:٣٠ شەو، پێویستە ژمارەی کارمەندانی هێڵی ئامادەکردن لە چێشتخانە زیاد بکرێت بۆ ئەوەی کاتی چاوەڕوانی کڕیار لە ٧ خولەک زیاتر نەبێت.`;
        }

        // 6. Generic Smart Strategic Suggestions
        return `💡 **پێشنیاری ستراتیژی AI بۆ بەرزکردنەوەی فرۆش:**\n\n` +
               `١. **داشکاندنی وەرز:** بۆ ئەو خواردنانەی کەمتر دەفرۆشرێن، ئۆفەری (خواردنەوەیەکی بێبەرامبەر لەگەڵ ژەمەکە) دابنێن.\n` +
               `٢. **خێرایی گەیاندن:** داواکارییەکانی گەیاندن خێراتر بگەیەنن لە ٣٠ خولەک تا کڕیارانی دەوروبەر زیاتر متمانە بکەن.\n` +
               `٣. **بەستنەوەی کەرەستە بە کۆگاوە:** ڕۆژانە مەسرەفی سەوزە و ڕۆن تۆمار بکەن بۆ ئەوەی ڕێژەی قازانجی ڕاستەقینەتان بە تەواوی ڕوون بێت.\n\n` +
               `ئەگەر پرسیارێکی ترت هەیە، فەرموو لە خزمەتدام! 😊`;
    };

    const handleSend = (textToSend) => {
        const query = textToSend || input;
        if (!query.trim()) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: query,
            time: new Date().toLocaleTimeString('ku-IQ', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);
        sound.beep();

        setTimeout(() => {
            const aiText = generateAiResponse(query);
            const aiMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: aiText,
                time: new Date().toLocaleTimeString('ku-IQ', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
            sound.success();
        }, 600);
    };

    const suggestionChips = [
        '📊 پوختەی قازانج و داهات',
        '🔥 پڕفرۆشترین خواردنەکان کامانەن؟',
        '⚠️ دۆخی کەرەستە و کاڵاکانی کۆگا',
        '👥 کڕیارانی قەرزدار و کۆی قەرز',
        '⏰ پڕقەرەباڵغترین کاتژمێرەکان کەی بوون؟',
        '💡 پێشنیار بۆ بەرزکردنەوەی فرۆش'
    ];

    return (
        <Layout 
            title="یاریدەدەری زیرەکی دەستکرد (AI Assistant)" 
            subtitle="شیکاری ژیرانەی فرۆش، خەرجی، کۆگا و پێشنیاری بازرگانی بە زمانی کوردی"
        >
            <div className="space-y-6">
                
                {/* AI Visual Insights Section */}
                <AiInsightsSection />

                {/* Kurdish Interactive AI Chat Terminal */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[520px]">
                    
                    {/* Chat Header */}
                    <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 text-xl font-bold shadow-lg shadow-orange-500/20">
                                🤖
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm flex items-center gap-2">
                                    <span>یاریدەدەری ژیری کوردی</span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                                        ڕاستەوخۆ چالاکە
                                    </span>
                                </h3>
                                <p className="text-[11px] text-slate-400">بەستراوەتەوە بە هەموو داتاکانی فرۆش و کۆگاوە</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/60">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex items-start gap-3 max-w-[85%] ${
                                    msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 shadow-sm ${
                                    msg.sender === 'user' 
                                        ? 'bg-amber-500 text-slate-950 font-bold' 
                                        : 'bg-slate-900 dark:bg-slate-800 text-amber-400 border border-slate-700'
                                }`}>
                                    {msg.sender === 'user' ? '👤' : '🤖'}
                                </div>
                                <div className={`p-4 rounded-2xl text-xs space-y-1 shadow-sm leading-relaxed ${
                                    msg.sender === 'user'
                                        ? 'bg-amber-500 text-slate-950 font-bold rounded-tr-none'
                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none whitespace-pre-wrap'
                                }`}>
                                    <p>{msg.text}</p>
                                    <span className={`text-[10px] block text-left pt-1 opacity-70 ${
                                        msg.sender === 'user' ? 'text-slate-900' : 'text-slate-400'
                                    }`}>
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]"></span>
                                <span className="text-[11px] font-bold mr-1">یاریدەدەر خەریکی شیتاڵکردنی داتاکانە...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {suggestionChips.map((chip, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(chip)}
                                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-[11px] font-bold whitespace-nowrap transition-colors border border-slate-200 dark:border-slate-700/60 flex-shrink-0"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>

                    {/* Chat Input Bar */}
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="پرسیارێک لە AI بکە لەسەر فرۆش، کۆگا یان قازانج..."
                            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-40 flex items-center gap-1.5"
                        >
                            <span>ناردن</span>
                            <i className="fas fa-paper-plane text-xs"></i>
                        </button>
                    </form>
                </div>

            </div>
        </Layout>
    );
}
