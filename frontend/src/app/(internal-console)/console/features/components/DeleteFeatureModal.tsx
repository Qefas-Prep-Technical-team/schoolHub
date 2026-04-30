"use client"

import { 
    Dialog, 
    DialogContent, 
    DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, RefreshCcw } from "lucide-react"

interface DeleteFeatureModalProps {
    isOpen: boolean
    onClose: () => void
    featureToDelete: any
    onDelete: (id: string) => void
    isDeleting: boolean
}

export default function DeleteFeatureModal({ 
    isOpen, 
    onClose, 
    featureToDelete, 
    onDelete, 
    isDeleting 
}: DeleteFeatureModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950">
                <div className="bg-red-500/5 p-8 flex flex-col items-center text-center">
                    <div className="h-20 w-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                        <Trash2 size={40} />
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
                        Delete Entitlement?
                    </DialogTitle>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs">
                        You are about to remove <span className="font-bold text-slate-900 dark:text-white">"{featureToDelete?.name}"</span>. This will also remove it from all subscription plans.
                    </p>
                </div>
                <div className="p-8 flex flex-col gap-3">
                    <Button 
                        onClick={() => featureToDelete?.id && onDelete(featureToDelete.id)}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-2xl py-7 font-black uppercase tracking-widest text-xs gap-2 shadow-xl shadow-red-500/20 w-full h-14"
                    >
                        {isDeleting ? <RefreshCcw className="animate-spin" size={16} /> : <Trash2 size={16} />}
                        {isDeleting ? "Removing Entitlement..." : "Confirm Deletion"}
                    </Button>
                    <Button 
                        variant="ghost"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl py-7 font-black uppercase tracking-widest text-xs w-full h-14"
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
