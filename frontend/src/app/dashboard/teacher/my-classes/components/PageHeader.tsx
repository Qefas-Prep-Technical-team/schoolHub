'use client';

import { useState } from 'react';
import { Plus, GraduationCap } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCreateLinkRequest } from '@/lib/api/hooks/useLinks';
import { toast } from 'react-toastify';

interface PageHeaderProps {
    title: string;
    description: string;
    isPersonal?: boolean;
}

export default function PageHeader({ title, description, isPersonal }: PageHeaderProps) {
    const actionText = isPersonal ? "Create Class" : "Connect to Class";
    
    // State for modal
    const [isOpen, setIsOpen] = useState(false);
    const [code, setCode] = useState('');
    
    // Mutation hook
    const createMutation = useCreateLinkRequest();

    const handleSubmit = () => {
        if (isPersonal) {
            toast.info('Class creation flow coming soon');
            return;
        }

        if (!code.trim()) {
            toast.error('Please enter a class code');
            return;
        }

        createMutation.mutate(
            { targetCode: code.trim(), linkType: 'TEACHER_CLASS', note: 'Requesting to connect to class' },
            {
                onSuccess: () => {
                    setIsOpen(false);
                    setCode('');
                    toast.success('Connection request sent!');
                },
                onError: () => {
                    toast.error('Failed to connect to class');
                }
            }
        );
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {title}
                </h1>
                <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
                    {description}
                </p>
            </div>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm">
                        <Plus className="w-4 h-4" />
                        <span>{actionText}</span>
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-200 dark:border-slate-800">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <GraduationCap className="text-primary w-5 h-5" />
                                {actionText}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 mt-2">
                                {isPersonal 
                                    ? "Create a new academic class module globally for your personal teaching registry."
                                    : "Link your teaching profile to an existing class module within this school's directory."}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-900 space-y-6">
                        {isPersonal ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Class Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Advanced Physics 101" 
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Class Level/Grade</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Grade 11" 
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Class Connection Code</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="Enter the unique class code..." 
                                        className="w-full h-14 pl-5 pr-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-black tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2">Ask the school administrator for the connection code.</p>
                            </div>
                        )}
                        
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all">
                                Cancel
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={createMutation.isPending}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all border border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed">
                                {createMutation.isPending ? "Sending..." : (isPersonal ? "Create" : "Connect")}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
