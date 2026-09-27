"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    CreditCard, 
    Calendar, 
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Search,
    Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Lottie from 'lottie-react';
import SuccessLottie from '@/lotties/Success.json';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

interface Transaction {
    id: number | string;
    reference: string | null;
    date?: string;
    createdAt?: string;
    amount: number;
    plan: string | null;
    status: string;
    billingCycle: string | null;
    paymentMethod?: string | null;
    expiryDate?: string;
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
    const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
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
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">#</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoice</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Date</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Amount</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Method</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Status</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {paginatedTransactions.map((txn, idx) => (
                            <motion.tr 
                                key={txn.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                                onClick={() => setSelectedTxn(txn)}
                            >
                                <td className="px-6 py-5">
                                    <span className="text-sm font-semibold text-slate-400">
                                        {(startIndex + idx + 1).toString().padStart(2, '0')}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[120px] inline-block">
                                        {txn.reference || `INV-00${txn.id}`}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className="text-sm text-slate-500 font-medium">
                                        {new Date(txn.createdAt || txn.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {txn.amount === 0 ? 'Free' : `₦${txn.amount.toLocaleString()}`}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-5 flex relative shrink-0 items-center">
                                            {txn.paymentMethod?.toLowerCase().includes('transfer') ? (
                                                <div className="w-full h-full bg-[#192A56] rounded-sm flex items-center justify-center text-[8px] font-bold text-white tracking-widest">TRF</div>
                                            ) : (
                                                <>
                                                    <div className="w-4 h-4 rounded-full bg-[#FF7675] absolute left-0 mix-blend-multiply dark:mix-blend-screen opacity-90" />
                                                    <div className="w-4 h-4 rounded-full bg-[#FDCB6E] absolute left-2 mix-blend-multiply dark:mix-blend-screen opacity-90" />
                                                </>
                                            )}
                                        </div>
                                        <span className="text-sm text-slate-500 font-medium">
                                            **** {String(txn.id).slice(-4).padStart(4, '0')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <div className={cn(
                                        "inline-flex items-center px-3 py-1 rounded bg-[#55EFC4]/10 text-[#00b894] text-[10px] font-bold tracking-wider",
                                        txn.status !== 'SUCCESS' && "bg-amber-100 text-amber-600"
                                    )}>
                                        {txn.status === 'SUCCESS' ? 'Paid' : 'Pending'}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTxn(txn);
                                        }}
                                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <div className="w-1 h-1 rounded-full bg-current"></div>
                                            <div className="w-1 h-1 rounded-full bg-current"></div>
                                            <div className="w-1 h-1 rounded-full bg-current"></div>
                                        </div>
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

            <Dialog open={!!selectedTxn} onOpenChange={(open) => !open && setSelectedTxn(null)}>
                <DialogContent className="p-0 border-none bg-transparent shadow-none w-full max-w-md sm:max-w-md" showCloseButton={false}>
                    {selectedTxn && (
                        <div className="relative bg-white dark:bg-slate-900 rounded-t-[2rem] rounded-b-[0.5rem] shadow-2xl dark:shadow-none w-full border border-b-0 border-slate-100 dark:border-slate-800 mx-auto">
                            
                            {/* Close Button overlay */}
                            <button 
                                onClick={() => setSelectedTxn(null)}
                                className="absolute top-4 right-4 z-50 h-8 w-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 transition-colors"
                            >
                                &times;
                            </button>

                            {/* Top Section */}
                            <div className="p-10 pb-6 flex flex-col items-center text-center">
                                <Lottie 
                                    animationData={SuccessLottie} 
                                    loop={false}
                                    style={{ height: '140px', width: '140px', marginBottom: '8px' }}
                                />
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-lexend mt-2">
                                    {selectedTxn.status === 'SUCCESS' ? 'Thank you' : selectedTxn.status === 'PENDING' ? 'Pending' : 'Failed'}
                                </h2>
                                <p className="text-sm text-slate-500 mt-2 font-medium">
                                    {selectedTxn.status === 'SUCCESS' 
                                        ? 'Your payment was processed successfully.' 
                                        : `Transaction is currently ${selectedTxn.status.toLowerCase()}.`
                                    }
                                </p>
                            </div>

                            {/* Dotted Divider & Punch Holes */}
                            <div className="relative h-8 w-full bg-transparent overflow-hidden flex items-center justify-center">
                                <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 sm:bg-slate-950/20 rounded-full border border-r-0 border-slate-100 dark:border-slate-800 shadow-inner z-10 mix-blend-multiply dark:mix-blend-normal backdrop-blur-sm" />
                                <div className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 sm:bg-slate-950/20 rounded-full border border-l-0 border-slate-100 dark:border-slate-800 shadow-inner z-10 mix-blend-multiply dark:mix-blend-normal backdrop-blur-sm" />
                                <div className="w-full border-t-[3px] border-dashed border-slate-200 dark:border-slate-700 mx-8 relative z-0" />
                            </div>

                            {/* Bottom Section */}
                            <div className="p-8 pt-4 space-y-6 rounded-b-[2rem] bg-white dark:bg-slate-900 border border-t-0 border-slate-100 dark:border-slate-800 shadow-2xl dark:shadow-none relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket ID</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white max-w-[150px] truncate">{selectedTxn.reference || selectedTxn.id}</p>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(String(selectedTxn.reference || selectedTxn.id));
                                                    toast.success("Ticket ID copied!");
                                                }}
                                                className="text-slate-400 hover:text-indigo-600 transition-colors"
                                                title="Copy Ticket ID"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {selectedTxn.amount === 0 ? 'Free' : `₦${selectedTxn.amount.toLocaleString()}`}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {new Date(selectedTxn.createdAt || selectedTxn.date || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} | {new Date(selectedTxn.createdAt || selectedTxn.date || '').toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="w-10 h-6 flex relative shrink-0 items-center">
                                        <div className="w-5 h-5 rounded-full bg-red-500 absolute left-0 mix-blend-multiply dark:mix-blend-screen" />
                                        <div className="w-5 h-5 rounded-full bg-amber-400 absolute left-3 mix-blend-multiply dark:mix-blend-screen" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-slate-900 dark:text-white capitalize">
                                            {selectedTxn.paymentMethod ? `${selectedTxn.paymentMethod.replace('_', ' ')} Payment` : 'Card Payment'}
                                        </p>
                                        <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                                            Subscription Expiry: {selectedTxn.expiryDate ? new Date(selectedTxn.expiryDate).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Barcode Mock */}
                                <div className="pt-6 flex flex-col items-center pb-2">
                                    <div className="h-14 w-full flex items-center justify-between px-2 opacity-60 dark:invert">
                                        {Array.from({ length: 42 }).map((_, i) => {
                                            const width = [2, 4, 3, 2, 6, 2, 3, 2][i % 8];
                                            return <div key={i} className={`bg-slate-900 h-full rounded-[1px]`} style={{ width: `${width}px` }} />
                                        })}
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-mono tracking-[0.2em] mt-3">
                                        {String(selectedTxn.reference || selectedTxn.id).replace(/\D/g, '').padEnd(16, '0').slice(0,16)}
                                    </p>
                                </div>
                                
                                {/* Jagged bottom edge */}
                                <div className="absolute -bottom-2 left-0 w-full h-4 overflow-hidden">
                                    <div className="w-full h-8 -mt-4 bg-[radial-gradient(circle,transparent_4px,#fff_5px)] dark:bg-[radial-gradient(circle,transparent_4px,#0f172a_5px)] bg-[length:12px_12px]" />
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TransactionHistory;
