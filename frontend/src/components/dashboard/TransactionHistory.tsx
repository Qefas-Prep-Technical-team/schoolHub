"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    CreditCard, 
    Calendar, 
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transaction {
    id: number | string;
    reference: string | null;
    date?: string;
    createdAt?: string;
    amount: number;
    plan: string | null;
    status: string;
    billingCycle: string | null;
}

interface TransactionHistoryProps {
    items?: Transaction[];
    totalItems?: number;
    currentPage?: number;
    itemsPerPage?: number;
    onPageChange?: (page: number) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
    items = [], 
    totalItems,
    currentPage: externalCurrentPage,
    itemsPerPage: externalItemsPerPage,
    onPageChange
}) => {
    const [internalPage, setInternalPage] = useState(1);
    const itemsPerPage = externalItemsPerPage || 5;
    const currentPage = externalCurrentPage || internalPage;
    
    const isServerSide = totalItems !== undefined;
    
    // Pagination logic
    const totalCount = isServerSide ? totalItems : items.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    
    // If server-side, items should already be paginated. If client-side, we slice them.
    const paginatedTransactions = isServerSide ? items : items.slice(startIndex, startIndex + itemsPerPage);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'FAILED': return 'bg-red-500/10 text-red-600 border-red-500/20';
            case 'PENDING': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
        }
    };

    const handlePageChange = (page: number) => {
        if (onPageChange) {
            onPageChange(page);
        } else {
            setInternalPage(page);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ledger Ref</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Timestamp</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tier / Protocol</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quantum</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">State</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">View</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {paginatedTransactions.map((txn, idx) => (
                            <motion.tr 
                                key={txn.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all cursor-default"
                            >
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-all">
                                            <CreditCard size={18} />
                                        </div>
                                        <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xs">{txn.reference || txn.id}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                                        <Calendar size={14} className="text-slate-300" />
                                        {new Date(txn.createdAt || txn.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-0.5">
                                        <p className="font-black text-slate-900 dark:text-white capitalize text-xs tracking-tight italic">{txn.plan || 'N/A'}</p>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{txn.billingCycle || 'One-time'}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={cn(
                                        "text-lg font-black tracking-tighter",
                                        txn.amount === 0 ? "text-emerald-500" : "text-slate-900 dark:text-white"
                                    )}>
                                        {txn.amount === 0 ? 'COMPLIMENTARY' : `₦${txn.amount.toLocaleString()}`}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className={cn(
                                        "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                        getStatusStyles(txn.status)
                                    )}>
                                        {txn.status}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all active:scale-90 shadow-sm border border-transparent hover:border-indigo-500/20">
                                        <ArrowRight size={16} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/20 dark:bg-transparent border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Showing <span className="text-slate-900 dark:text-white">{startIndex + 1}</span> - <span className="text-slate-900 dark:text-white">{Math.min(startIndex + itemsPerPage, totalCount)}</span> / <span className="text-slate-900 dark:text-white">{totalCount}</span> Transactions
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:text-indigo-600 transition-all shadow-sm active:scale-90"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={cn(
                                        "w-10 h-10 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest",
                                        currentPage === page 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600'
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:text-indigo-600 transition-all shadow-sm active:scale-90"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
            
            {items.length === 0 && (
                <div className="p-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200 dark:text-slate-700">
                       <Search size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-2">No Transactions Detected</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">The financial ledger is currently awaiting initialization.</p>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
