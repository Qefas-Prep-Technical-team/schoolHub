'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor, Globe, LogOut, Loader2, Server } from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface DeviceSession {
    id: string;
    deviceType: string;
    deviceModel: string;
    osVersion: string;
    ipAddress: string;
    lastActiveAt: string;
    createdAt: string;
    isCurrentDevice: boolean;
}

const fetchSessions = async (): Promise<DeviceSession[]> => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/sessions`, {
        withCredentials: true
    });
    return res.data.data;
};

const revokeSession = async (id: string) => {
    const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/sessions/${id}`, {
        withCredentials: true
    });
    return res.data;
};

export default function DeviceSessions() {
    const queryClient = useQueryClient();

    const { data: sessions, isLoading, isError } = useQuery({
        queryKey: ['deviceSessions'],
        queryFn: fetchSessions,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const revokeMutation = useMutation({
        mutationFn: revokeSession,
        onMutate: async (deletedId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['deviceSessions'] });

            // Snapshot the previous value
            const previousSessions = queryClient.getQueryData<DeviceSession[]>(['deviceSessions']);

            // Optimistically update to the new value
            if (previousSessions) {
                queryClient.setQueryData<DeviceSession[]>(
                    ['deviceSessions'],
                    previousSessions.filter(session => session.id !== deletedId)
                );
            }

            return { previousSessions };
        },
        onSuccess: (data, variables) => {
            toast.success("Device session revoked");
            // If we revoked the current device, we should redirect to login
            const revokedSession = sessions?.find(s => s.id === variables);
            if (revokedSession?.isCurrentDevice) {
                window.location.href = '/login';
            }
        },
        onError: (error: any, variables, context) => {
            // Rollback on error
            if (context?.previousSessions) {
                queryClient.setQueryData(['deviceSessions'], context.previousSessions);
            }
            toast.error(error.response?.data?.message || "Failed to revoke session");
        },
        onSettled: () => {
            // Sync with server in background
            queryClient.invalidateQueries({ queryKey: ['deviceSessions'] });
        }
    });

    if (isError) {
        return (
            <Card className="rounded-2xl border-rose-100 dark:border-rose-900/30 shadow-sm bg-rose-50/50 dark:bg-rose-950/20 overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                    <LogOut className="h-10 w-10 text-rose-500 mb-3" />
                    <p className="text-sm font-bold text-rose-900 dark:text-rose-400">Failed to load device sessions.</p>
                    <p className="text-xs text-rose-700 dark:text-rose-300/70 mt-1">Please try again later or check your connection.</p>
                </CardContent>
            </Card>
        );
    }

    const getDeviceIcon = (deviceType: string) => {
        const type = deviceType?.toLowerCase() || '';
        if (type.includes('mobile') || type.includes('tablet')) return <Smartphone size={20} />;
        if (type.includes('desktop') || type.includes('mac') || type.includes('windows')) return <Monitor size={20} />;
        return <Globe size={20} />;
    };

    return (
        <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
            <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Server className="text-emerald-500" size={18} /> Logged-in Devices
                </CardTitle>
                <CardDescription>Manage devices where you are currently signed in.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 gap-4">
                                <div className="flex items-start gap-4">
                                    <Skeleton className="h-12 w-12 rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                        <Skeleton className="h-2 w-24" />
                                    </div>
                                </div>
                                <Skeleton className="h-9 w-24 rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : sessions?.length === 0 ? (
                    <p className="text-sm font-medium text-slate-500">No active devices found.</p>
                ) : (
                    <>
                        {sessions?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((session) => (
                            <div key={session.id} className={cn(
                                "flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border transition-all duration-300 gap-4", 
                                session.isCurrentDevice 
                                    ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20" 
                                    : "bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                            )}>
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "h-12 w-12 shrink-0 rounded-xl flex items-center justify-center", 
                                        session.isCurrentDevice 
                                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400" 
                                            : "bg-white text-slate-500 dark:bg-slate-950 dark:text-slate-400 shadow-sm border border-slate-100 dark:border-slate-800"
                                    )}>
                                        {getDeviceIcon(session.deviceType)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                {session.deviceModel || 'Unknown Device'}
                                            </h4>
                                            {session.isCurrentDevice && (
                                                <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 px-1.5 py-0">Current</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {session.osVersion === 'Windows 10' ? 'Windows 10/11' : session.osVersion} • {session.ipAddress}
                                        </p>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                                            Last active {formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                
                                <Button 
                                    variant={session.isCurrentDevice ? "outline" : "destructive"}
                                    onClick={() => revokeMutation.mutate(session.id)}
                                    disabled={revokeMutation.isPending && revokeMutation.variables === session.id}
                                    className={cn(
                                        "shrink-0 rounded-lg h-9 text-xs font-semibold px-4", 
                                        session.isCurrentDevice && "text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                    )}
                                >
                                    {revokeMutation.isPending && revokeMutation.variables === session.id ? (
                                        <Loader2 className="animate-spin h-3 w-3 mr-2" />
                                    ) : (
                                        <LogOut size={14} className="mr-2" /> 
                                    )}
                                    {session.isCurrentDevice ? 'Log out' : 'Revoke'}
                                </Button>
                            </div>
                        ))}
                        {sessions && sessions.length > itemsPerPage && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                                <span className="text-xs font-medium text-slate-500">
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sessions.length)} of {sessions.length} devices
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-lg h-8 text-xs font-medium"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(sessions.length / itemsPerPage), p + 1))}
                                        disabled={currentPage >= Math.ceil(sessions.length / itemsPerPage)}
                                        className="rounded-lg h-8 text-xs font-medium"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
