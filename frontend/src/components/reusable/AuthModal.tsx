"use client";

import React from 'react';
import NextImage from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuthModalStore } from '@/utils/AuthModalStore';
import dynamic from 'next/dynamic';
import { LogIn, UserPlus, GraduationCap, ChevronLeft, Shield, User, Users } from 'lucide-react';

// Dynamic imports for forms to keep the initial bundle light
const TeacherLoginForm = dynamic(() => import('@/app/(auth)/login/teacher/components/TeacherLoginForm'), {
    loading: () => <div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});
const StudentLoginForm = dynamic(() => import('@/app/(auth)/login/student/components/LoginForm'), {
    loading: () => <div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});
const ParentLoginForm = dynamic(() => import('@/app/(auth)/login/parent/components/LoginForm'), {
    loading: () => <div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});
const SchoolAdminLoginForm = dynamic(() => import('@/app/(auth)/login/school-admin/components/LoginForm'), {
    loading: () => <div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

const TeacherRegisterForm = dynamic(() => import('@/app/(auth)/signup/teacher/components/TeacherRegisterForm'), {
    loading: () => <div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});
const StudentRegisterForm = dynamic(() => import('@/app/(auth)/signup/student/components/StudentRegisterForm'), {
    loading: () => <div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});
const ParentRegisterForm = dynamic(() => import('@/app/(auth)/signup/parent/components/ParentForm'), {
    loading: () => <div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});
const SchoolRegisterForm = dynamic(() => import('@/app/(auth)/signup/school/components/SchoolCard'), {
    loading: () => <div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

const AuthModal = () => {
    const { isOpen, view, selectedRole, closeModal, setView, setRole } = useAuthModalStore();

    if (!isOpen) return null;

    const handleBack = () => {
        if (view === 'login-role' || view === 'signup-role') setView('selection');
        else if (view === 'login-form') setView('login-role');
        else if (view === 'signup-form') setView('signup-role');
    };

    const renderHeader = (title: string, description: string, showBack = false) => (
        <div className="relative mb-6">
            {showBack && (
                <button 
                    onClick={handleBack}
                    className="absolute -left-2 top-0 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
                    aria-label="Go back"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}
            <DialogHeader className="text-center pt-2">
                <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">{title}</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1">{description}</DialogDescription>
            </DialogHeader>
        </div>
    );

    const roles = [
        { key: 'school', title: 'School', icon: Shield, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        { key: 'TEACHER', title: 'Teacher', icon: GraduationCap, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
        { key: 'STUDENT', title: 'Student', icon: User, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { key: 'PARENT', title: 'Parent', icon: Users, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    ];

    const getRoleTitle = (key: string | null) => {
        if (!key) return "";
        const role = roles.find(r => r.key === key);
        return role ? role.title : key;
    };

    return (
        <Dialog open={isOpen} onOpenChange={closeModal}>
            <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto p-0 bg-white dark:bg-slate-900 border-none shadow-2xl">
                <div className="p-8">
                    {view === 'selection' && (
                        <div className="space-y-8 py-4">
                            <div className="text-center space-y-2">
                                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100 dark:border-slate-800 p-3">
                                    <NextImage src="/logo/favicon.svg" alt="Qefas Hub" width={80} height={80} className="w-full h-full object-contain" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome to Qefas Hub</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg">Choose how you want to continue</p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <button 
                                    onClick={() => setView('login-role')}
                                    className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary hover:bg-primary/5 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <LogIn className="w-6 h-6" />
                                    </div>
                                    <span className="text-xl font-bold">Log In</span>
                                    <span className="text-sm text-slate-500 text-center mt-1">Access your existing account</span>
                                </button>
                                
                                <button 
                                    onClick={() => setView('signup-role')}
                                    className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-primary bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <UserPlus className="w-6 h-6" />
                                    </div>
                                    <span className="text-xl font-bold">Get Started</span>
                                    <span className="text-sm text-white/80 text-center mt-1">Create a new account today</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {(view === 'login-role' || view === 'signup-role') && (
                        <div className="space-y-6">
                            {renderHeader("Select your role", "Choose your category to continue", true)}
                            <div className="grid grid-cols-2 gap-4">
                                {roles.map((role) => (
                                    <button
                                        key={role.key}
                                        onClick={() => {
                                            setRole(role.key as "school" | "TEACHER" | "STUDENT" | "PARENT");
                                            setView(view === 'login-role' ? 'login-form' : 'signup-form');
                                        }}
                                        className="flex flex-col items-center p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all group bg-slate-50/50 dark:bg-slate-800/50"
                                    >
                                        <div className={`w-14 h-14 rounded-full ${role.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
                                            <role.icon className={`w-7 h-7 ${role.color}`} />
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white">{role.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'login-form' && (
                        <div className="space-y-4">
                            {renderHeader(`${getRoleTitle(selectedRole)} Login`, "Welcome back! Please enter your details.", true)}
                            <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                {selectedRole === 'TEACHER' && <TeacherLoginForm />}
                                {selectedRole === 'STUDENT' && <StudentLoginForm />}
                                {selectedRole === 'PARENT' && <ParentLoginForm />}
                                {selectedRole === 'school' && <SchoolAdminLoginForm />}
                            </div>
                            <div className="text-center mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Don&apos;t have an account?{" "}
                                    <button 
                                        onClick={() => setView('signup-form')}
                                        className="font-bold text-blue-600 hover:underline"
                                    >
                                        Sign Up
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}

                    {view === 'signup-form' && (
                        <div className="space-y-4">
                            {renderHeader(`${getRoleTitle(selectedRole)} Registration`, "Join Qefas Hub to start your journey.", true)}
                            <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                {selectedRole === 'TEACHER' && <TeacherRegisterForm />}
                                {selectedRole === 'STUDENT' && <StudentRegisterForm />}
                                {selectedRole === 'PARENT' && <ParentRegisterForm />}
                                {selectedRole === 'school' && <SchoolRegisterForm />}
                            </div>
                            <div className="text-center mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Already have an account?{" "}
                                    <button 
                                        onClick={() => setView('login-form')}
                                        className="font-bold text-blue-600 hover:underline"
                                    >
                                        Log In
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
