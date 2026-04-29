import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Landmark, CreditCard, CheckCircle2, Clock, AlertCircle, RefreshCw, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AtmAccountCardProps {
    account: {
        id: string;
        bankName: string;
        accountName: string;
        accountNumber: string;
        status: "active" | "pending" | "unverified" | string;
        totalSettled: number;
        isDefault?: boolean;
    };
    onRefresh?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export function AtmAccountCard({ account, onRefresh, onDelete }: AtmAccountCardProps) {
    const isSuccess = account.status === "active";
    const isPending = account.status === "pending";
    const isError = account.status === "unverified";

    return (
        <Card className={cn(
            "relative w-full max-w-[380px] h-[220px] rounded-[2rem] overflow-hidden border-none transition-all hover:scale-[1.02] shadow-2xl",
            isSuccess ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-blue-500/10" : 
            isPending ? "bg-gradient-to-br from-amber-900/40 via-slate-900 to-slate-900 border border-amber-500/20" :
            "bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900 border border-red-500/20"
        )}>
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -ml-12 -mb-12" />

            <CardContent className="p-7 flex flex-col justify-between h-full relative z-10 text-white">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Landmark className={cn("h-5 w-5", isSuccess ? "text-blue-400" : isPending ? "text-amber-400" : "text-red-400")} />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {account.bankName}
                            </p>
                        </div>
                        <h3 className="text-lg font-black tracking-tight line-clamp-1">{account.accountName}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {account.isDefault && (
                            <Badge className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-[9px] font-black uppercase py-0.5">
                                Primary
                            </Badge>
                        )}
                        <div className="flex items-center gap-1">
                            {onRefresh && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={(e) => { e.stopPropagation(); onRefresh(account.id); }}
                                    className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            )}
                            {onDelete && !account.isDefault && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={(e) => { e.stopPropagation(); onDelete(account.id); }}
                                    className="h-8 w-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 font-mono text-xl tracking-widest text-slate-300">
                        <span className="opacity-40">••••</span>
                        <span className="opacity-40">••••</span>
                        <span>{account.accountNumber?.slice(-4) || "0000"}</span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Total Settled</p>
                            <p className="text-xl font-black">₦{account.totalSettled.toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {isSuccess ? (
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase">Verified</span>
                                </div>
                            ) : isPending ? (
                                <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
                                    <Clock className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase">Pending</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20">
                                    <AlertCircle className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase">Failed</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
