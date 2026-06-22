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
        onSuccess: (data, variables) => {
            toast.success("Device session revoked");
            queryClient.invalidateQueries({ queryKey: ['deviceSessions'] });
            
            // If we revoked the current device, we should redirect to login
            const revokedSession = sessions?.find(s => s.id === variables);
            if (revokedSession?.isCurrentDevice) {
                window.location.href = '/login';
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to revoke session");
        }
    });

    if (isLoading) {
        return (
            <Card className="rounded-[2.5rem] md:rounded-[3rem] border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
                <CardContent className="p-10 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card className="rounded-[2.5rem] md:rounded-[3rem] border-red-200/60 dark:border-red-800/60 shadow-xl overflow-hidden bg-red-50/50 dark:bg-red-950/50 backdrop-blur-xl">
                <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                    <LogOut className="h-10 w-10 text-red-400 mb-4" />
                    <p className="text-red-600 dark:text-red-400 font-medium">Failed to load device sessions.</p>
                    <p className="text-sm text-red-500/80 dark:text-red-400/80 mt-2">Please try again later or check your connection.</p>
                </CardContent>
            </Card>
        );
    }

    const getDeviceIcon = (deviceType: string) => {
        const type = deviceType?.toLowerCase() || '';
        if (type.includes('mobile') || type.includes('tablet')) return <Smartphone size={24} />;
        if (type.includes('desktop') || type.includes('mac') || type.includes('windows')) return <Monitor size={24} />;
        return <Globe size={24} />;
    };

    return (
        <Card className="rounded-[2.5rem] md:rounded-[3rem] border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black italic uppercase flex items-center gap-3">
                    <Server className="text-indigo-500" /> Logged-in Devices
                </CardTitle>
                <CardDescription className="ml-9">Manage devices where you are currently signed in.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
                {sessions?.length === 0 ? (
                    <p className="text-sm font-medium text-slate-500">No active devices found.</p>
                ) : (
                    <>
                        {sessions?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((session) => (
                            <div key={session.id} className={cn("flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl border transition-all duration-300 gap-6", session.isCurrentDevice ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 shadow-sm" : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700")}>
                            <div className="flex items-start gap-4">
                                <div className={cn("h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center shadow-sm", session.isCurrentDevice ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400" : "bg-white text-slate-500 dark:bg-slate-950 dark:text-slate-400")}>
                                    {getDeviceIcon(session.deviceType)}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-[15px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
                                            {session.deviceModel || 'Unknown Device'}
                                        </h4>
                                        {session.isCurrentDevice && (
                                            <Badge variant="default" className="bg-indigo-500 hover:bg-indigo-600 text-[9px] uppercase tracking-widest px-2 py-0">Current</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-slate-500">
                                        {session.osVersion} • {session.ipAddress}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Last active {formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            
                            <Button 
                                variant={session.isCurrentDevice ? "outline" : "destructive"}
                                onClick={() => revokeMutation.mutate(session.id)}
                                disabled={revokeMutation.isPending}
                                className={cn("shrink-0 rounded-xl h-12 px-6 font-black uppercase text-[10px] tracking-widest", session.isCurrentDevice && "text-slate-500 hover:text-slate-700 dark:text-slate-400")}
                            >
                                {revokeMutation.isPending && revokeMutation.variables === session.id ? (
                                    <Loader2 className="animate-spin h-4 w-4" />
                                ) : (
                                    <>
                                        <LogOut size={14} className="mr-2" /> 
                                        {session.isCurrentDevice ? 'Log out' : 'Revoke'}
                                    </>
                                )}
                            </Button>
                        </div>
                    ))}
                    {sessions && sessions.length > itemsPerPage && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-500">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sessions.length)} of {sessions.length} devices
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-xl h-9 text-xs"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(sessions.length / itemsPerPage), p + 1))}
                                    disabled={currentPage >= Math.ceil(sessions.length / itemsPerPage)}
                                    className="rounded-xl h-9 text-xs"
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
