import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api/client';

interface ChangePasswordModalProps {
    children?: React.ReactNode;
}

export default function ChangePasswordModal({ children }: ChangePasswordModalProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const changePasswordMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post('/auth/password/change', data);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Password updated successfully!");
            setStep(1);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update password");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long");
            return;
        }
        changePasswordMutation.mutate({ currentPassword, newPassword });
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setStep(1);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
    };

    const handleNext = () => {
        if (!currentPassword) {
            toast.error("Please enter your current password");
            return;
        }
        setStep(2);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" className="rounded-xl font-bold">
                        <Lock size={16} className="mr-2" /> Change Password
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2rem] p-8 border-none shadow-2xl bg-white dark:bg-slate-950">
                <DialogHeader className="space-y-3 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                        <Lock size={24} />
                    </div>
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        {step === 1 ? "Verify Current Password" : "Set New Password"}
                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium text-slate-500">
                        {step === 1 
                            ? "Please enter your current password to proceed securely." 
                            : "Enter your new password below to update your credentials."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 ? (
                        <div className="space-y-2 animate-in slide-in-from-right-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Password</Label>
                            <div className="relative">
                                <Input 
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="h-12 rounded-2xl pr-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                    placeholder="Enter current password"
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <Button 
                                type="button"
                                onClick={handleNext}
                                className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs bg-indigo-600 hover:bg-indigo-700 text-white mt-6"
                            >
                                Next Step
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</Label>
                                <div className="relative">
                                    <Input 
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="h-12 rounded-2xl pr-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                        placeholder="Enter new password"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm New Password</Label>
                                <div className="relative">
                                    <Input 
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="h-12 rounded-2xl pr-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    className="w-1/3 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                                >
                                    Back
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={changePasswordMutation.isPending}
                                    className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {changePasswordMutation.isPending ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                                    ) : (
                                        'Save Password'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}
