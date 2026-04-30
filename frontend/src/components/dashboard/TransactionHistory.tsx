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
    ChevronRight,
    ArrowRight
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
        <div className="bg-transparent overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-900 dark:bg-orange-600 uppercase text-[10px] font-black tracking-[0.2em] text-white border-b border-white/10">
                            <th className="px-8 py-5">Record Ref</th>
                            <th className="px-8 py-5">Timestamp</th>
                            <th className="px-8 py-5">Protocol / Cycle</th>
                            <th className="px-8 py-5">Credit Value</th>
                            <th className="px-8 py-5">State</th>
                            <th className="px-8 py-5 text-right">Review</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {paginatedTransactions.map((txn, idx) => (
                            <motion.tr 
                                key={txn.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group hover:bg-orange-600/[0.02] transition-colors"
                            >
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 bg-slate-900 dark:bg-white/5 rounded-xl flex items-center justify-center text-white dark:text-orange-500 shadow-lg group-hover:scale-110 transition-transform">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <span className="font-black text-slate-900 dark:text-white truncate max-w-[150px] uppercase tracking-tight">{txn.reference || txn.id}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                                        <Calendar className="w-4 h-4 text-orange-600" />
                                        {new Date(txn.createdAt || txn.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white capitalize text-sm tracking-tight">{txn.plan || 'N/A'}</p>
                                        <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">{txn.billingCycle || 'N/A'}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`text-lg font-black tracking-tighter ${txn.amount === 0 ? 'text-green-500' : 'text-slate-900 dark:text-white'}`}>
                                        {txn.amount === 0 ? 'FREE TRIAL' : `₦${txn.amount.toLocaleString()}`}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-sm ${
                                        txn.status === 'SUCCESS' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                        txn.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                    }`}>
                                        {getStatusIcon(txn.status)}
                                        {txn.status}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="p-3 text-slate-400 hover:text-orange-600 dark:hover:text-white transition-all bg-slate-50 dark:bg-white/5 rounded-xl hover:shadow-xl active:scale-90">
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Displaying <span className="text-slate-900 dark:text-white">{startIndex + 1}</span> - <span className="text-slate-900 dark:text-white">{Math.min(startIndex + itemsPerPage, totalCount)}</span> of <span className="text-slate-900 dark:text-white">{totalCount}</span> Transactions
                    </p>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="h-12 w-12 flex items-center justify-center rounded-[1.2rem] border border-slate-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-white/5 hover:border-orange-500 transition-all shadow-sm active:scale-90"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                        
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-12 h-12 rounded-[1.2rem] font-black text-xs transition-all uppercase tracking-widest ${
                                        currentPage === page 
                                        ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/30' 
                                        : 'hover:bg-white dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="h-12 w-12 flex items-center justify-center rounded-[1.2rem] border border-slate-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-white/5 hover:border-orange-500 transition-all shadow-sm active:scale-90"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>
            )}
            
            {items.length === 0 && (
                <div className="p-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                       <CreditCard className="w-8 h-8 text-slate-200 dark:text-slate-800" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">No Records Detected</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Initiate a protocol upgrade to see transactions here.</p>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
