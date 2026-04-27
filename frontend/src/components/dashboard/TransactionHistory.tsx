import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    CreditCard, 
    Calendar, 
    ArrowUpRight, 
    CheckCircle2, 
    XCircle, 
    Clock,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'PENDING': return <Clock className="w-4 h-4 text-amber-500" />;
            default: return null;
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
        <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Transaction History</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Review your recent payments and subscriptions ({items.length} total)</p>
                </div>
                <button className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">download</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/30 uppercase text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                            <th className="px-8 py-4">Transaction ID</th>
                            <th className="px-8 py-4">Date</th>
                            <th className="px-8 py-4">Plan / Cycle</th>
                            <th className="px-8 py-4">Amount</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {paginatedTransactions.map((txn, idx) => (
                            <motion.tr 
                                key={txn.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                            >
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{txn.reference || txn.id}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(txn.createdAt || txn.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white capitalize">{txn.plan || 'N/A'}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{txn.billingCycle || 'N/A'}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`font-black ${txn.amount === 0 ? 'text-green-500' : 'text-slate-900 dark:text-white'}`}>
                                        {txn.amount === 0 ? 'FREE TRIAL' : `₦${txn.amount.toLocaleString()}`}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        txn.status === 'SUCCESS' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                        txn.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                    }`}>
                                        {getStatusIcon(txn.status)}
                                        {txn.status}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="px-8 py-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                    <p className="text-sm font-medium text-slate-500">
                        Showing <span className="text-slate-900 dark:text-white">{startIndex + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(startIndex + itemsPerPage, totalCount)}</span> of <span className="text-slate-900 dark:text-white">{totalCount}</span> results
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                                        currentPage === page 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                        : 'hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
            
            <div className="p-8 bg-slate-50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Note: Transactions are processed securely. Your privacy and security are our top priorities.
                </p>
            </div>
            {items.length === 0 && (
                <div className="p-12 text-center">
                    <p className="text-slate-500 font-medium italic">No transactions found.</p>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
