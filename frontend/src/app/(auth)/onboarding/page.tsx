"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CheckCircle2, ChevronRight, Mail, Shield, UploadCloud, Settings, Sparkles, Users, CreditCard, MessageSquare, GraduationCap, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import CheerAnimation from './_components/CheerAnimation';
import { useAuthStore } from '../login/services/auth-store';
import Lottie from "lottie-react";
import Success from "../../../lotties/Success.json";

const THEME_MAP = {
  ADMIN: {
    gradientSidebar: 'from-slate-900 via-blue-950 to-black',
    gradientBlob: 'from-blue-600/10 to-indigo-600/10',
    gradientText: 'from-blue-400 to-indigo-300',
    glowClass: 'bg-blue-500/20 border-blue-400/30 shadow-blue-500/20',
    borderColor: 'border-blue-500',
    primaryText: 'text-blue-500',
    primaryBg: 'bg-blue-500',
    primaryHover: 'hover:bg-blue-600',
    primaryBgSubtle: 'bg-blue-50 dark:bg-blue-500/10',
    primaryTextSubtle: 'text-blue-600 dark:text-blue-400',
    iconColor: 'text-blue-500',
    buttonColor: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  TEACHER: {
    gradientSidebar: 'from-slate-900 via-emerald-950 to-black',
    gradientBlob: 'from-emerald-600/10 to-teal-600/10',
    gradientText: 'from-emerald-400 to-teal-300',
    glowClass: 'bg-emerald-500/20 border-emerald-400/30 shadow-emerald-500/20',
    borderColor: 'border-emerald-500',
    primaryText: 'text-emerald-500',
    primaryBg: 'bg-emerald-500',
    primaryHover: 'hover:bg-emerald-600',
    primaryBgSubtle: 'bg-emerald-50 dark:bg-emerald-500/10',
    primaryTextSubtle: 'text-emerald-600 dark:text-emerald-400',
    iconColor: 'text-emerald-500',
    buttonColor: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  },
  STUDENT: {
    gradientSidebar: 'from-slate-900 via-pink-950 to-black',
    gradientBlob: 'from-pink-600/10 to-rose-600/10',
    gradientText: 'from-pink-400 to-rose-300',
    glowClass: 'bg-pink-500/20 border-pink-400/30 shadow-pink-500/20',
    borderColor: 'border-pink-500',
    primaryText: 'text-pink-500',
    primaryBg: 'bg-pink-500',
    primaryHover: 'hover:bg-pink-600',
    primaryBgSubtle: 'bg-pink-50 dark:bg-pink-500/10',
    primaryTextSubtle: 'text-pink-600 dark:text-pink-400',
    iconColor: 'text-pink-500',
    buttonColor: 'bg-pink-500 hover:bg-pink-600 text-white',
  },
  PARENT: {
    gradientSidebar: 'from-slate-900 via-orange-950 to-black',
    gradientBlob: 'from-orange-600/10 to-amber-600/10',
    gradientText: 'from-orange-400 to-amber-300',
    glowClass: 'bg-orange-500/20 border-orange-400/30 shadow-orange-500/20',
    borderColor: 'border-orange-500',
    primaryText: 'text-orange-500',
    primaryBg: 'bg-orange-500',
    primaryHover: 'hover:bg-orange-600',
    primaryBgSubtle: 'bg-orange-50 dark:bg-orange-500/10',
    primaryTextSubtle: 'text-orange-600 dark:text-orange-400',
    iconColor: 'text-orange-500',
    buttonColor: 'bg-orange-500 hover:bg-orange-600 text-white',
  }
};

const STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'management', label: 'Dashboard' },
  { id: 'communication', label: 'Communication' },
  { id: 'academics', label: 'Academics' },
  { id: 'success', label: 'Ready to Launch' }
];

export default function Onboarding() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [previewRole, setPreviewRole] = useState<string | null>(null);
  
  const userType = previewRole || user?.userType || 'ADMIN';
  const theme = THEME_MAP[userType as keyof typeof THEME_MAP] || THEME_MAP.ADMIN;
  
  const getLoginRoute = (role: string) => {
      switch (role) {
          case 'ADMIN': return '/login/school-admin';
          case 'TEACHER': return '/login/teacher';
          case 'STUDENT': return '/login/student';
          case 'PARENT': return '/login/parent';
          default: return '/login';
      }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
    } else {
        router.push(getLoginRoute(userType));
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const isSplitScreen = currentStep === 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-500">
      <CheerAnimation duration={6000}>
        <div className="flex w-full min-h-screen">
          {/* Premium Left Sidebar (Always Visible) */}
          <div className={`hidden lg:flex w-[40%] bg-gradient-to-br ${theme.gradientSidebar} flex-col justify-between p-12 text-white relative overflow-hidden transition-colors duration-500 border-r border-white/5`}>
            {/* Glassmorphic decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className={`absolute -top-[30%] -left-[20%] w-[150%] h-[150%] rounded-full bg-gradient-to-tr ${theme.gradientBlob} blur-[100px]`} 
                />
                <motion.div 
                    animate={{ y: [0, -20, 0], rotate: [12, 15, 12] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[15%] right-[10%] size-32 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl"
                />
                <motion.div 
                    animate={{ y: [0, 30, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute bottom-[25%] left-[15%] size-24 rounded-full ${theme.glowClass} backdrop-blur-xl`}
                />
            </div>
            
            <div className="relative z-10 flex items-center gap-3">
                <div className="size-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center p-3 shadow-2xl shadow-black/50">
                    <img src="/logo/favicon.svg" alt="Qefas Hub Logo" className="w-full h-full object-contain drop-shadow-md" />
                </div>
                <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">QEFAS HUB</span>
            </div>
            
            <div className="relative z-10 space-y-8">
                <h1 className="text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight">
                    Transform your <br/>
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.gradientText}`}>
                        {userType === 'STUDENT' ? 'learning.' : userType === 'PARENT' ? 'involvement.' : 'institution.'}
                    </span>
                </h1>
                <p className={`text-slate-300 text-xl font-medium max-w-md leading-relaxed border-l-4 ${theme.borderColor} pl-5 opacity-90`}>
                    Everything you need to run a modern, digital academy—all in one elegant workspace.
                </p>
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
                <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">© 2026 Qefas Hub</p>
                <div className="flex gap-2">
                    <div className={`size-2 rounded-full ${theme.primaryBg} animate-pulse`} />
                    <div className={`size-2 rounded-full ${theme.primaryBg} opacity-40`} />
                    <div className={`size-2 rounded-full ${theme.primaryBg} opacity-40`} />
                </div>
            </div>
          </div>

          {/* Right Content Area (Dynamic Steps) */}
          <div className="flex-1 flex flex-col p-8 lg:p-20 bg-white dark:bg-slate-950 relative transition-colors duration-500 overflow-y-auto">
            
            {/* Minimal Top Stepper (Hidden on Step 0) */}
            {currentStep > 0 && (
              <div className="w-full max-w-xl mx-auto mb-12 flex items-center justify-between">
                  {STEPS.slice(1, -1).map((step, idx) => {
                      const stepIndex = idx + 1;
                      const isActive = currentStep === stepIndex;
                      const isPast = currentStep > stepIndex;
                      return (
                          <React.Fragment key={step.id}>
                              <div className={`flex items-center gap-2 ${isActive ? theme.primaryText : isPast ? 'text-emerald-500' : 'text-slate-400'}`}>
                                  <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isActive ? `${theme.borderColor} ${theme.primaryBgSubtle}` : isPast ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800'}`}>
                                      {isPast ? <CheckCircle2 className="size-4" /> : stepIndex}
                                  </div>
                              </div>
                              {idx < STEPS.slice(1, -1).length - 1 && (
                                  <div className={`flex-1 h-[2px] rounded-full mx-2 ${isPast ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                              )}
                          </React.Fragment>
                      );
                  })}
              </div>
            )}

            <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    {currentStep === 0 ? (
                        <motion.div 
                            key="step-0"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full space-y-8"
                        >
                            <div className="space-y-3 text-center">
                                <div className={`mx-auto size-16 ${theme.primaryBgSubtle} ${theme.primaryTextSubtle} rounded-full flex items-center justify-center mb-6 transition-colors duration-500`}>
                                    <Sparkles className="size-8" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Welcome to Qefas Hub, {user?.name || (userType.charAt(0) + userType.slice(1).toLowerCase())}!
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    {user?.adminRole ? `As a ${user.adminRole.replace('_', ' ').toLowerCase()}, ` : 'Before you dive in, '} let's take a quick tour of what you can accomplish with your new platform.
                                </p>
                            </div>

                            <Button onClick={handleNext} className={`w-full h-14 rounded-2xl text-lg font-bold shadow-xl transition-all flex items-center justify-center group gap-2 border-none ${theme.buttonColor}`}>
                                Start Tour <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </Button>

                        </motion.div>
                    ) : (
                        <motion.div 
                            key={`step-${currentStep}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full space-y-12"
                        >
                            {currentStep === 1 && <ManagementStep theme={theme} userType={userType} />}
                            {currentStep === 2 && <CommunicationStep theme={theme} userType={userType} />}
                            {currentStep === 3 && <AcademicsStep theme={theme} userType={userType} />}
                            {currentStep === 4 && <SuccessStep theme={theme} />}

                            <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800">
                                <Button 
                                    variant="ghost" 
                                    onClick={handleBack}
                                    className={`font-bold rounded-xl ${currentStep === 4 ? 'invisible' : ''}`}
                                >
                                    Previous
                                </Button>
                                <Button 
                                    onClick={handleNext}
                                    className={`h-12 px-8 rounded-xl font-bold shadow-lg border-none ${theme.buttonColor}`}
                                >
                                    {currentStep === 4 ? 'Login to your Dashboard' : 'Continue'}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
          </div>
        </div>
      </CheerAnimation>
    </div>
  );
}

function ManagementStep({ theme, userType }: { theme: any; userType: string }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Total School Management</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Say goodbye to scattered spreadsheets. Qefas Hub gives you complete control over your administrative tasks.
                </p>
            </div>
            <div className="space-y-4 max-w-lg">
                <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl">
                    <Users className={`${theme.primaryText} mt-1 size-6`} />
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">Staff & Student Roster</h4>
                        <p className="text-base text-slate-500">Manage admissions, staff assignments, and detailed user profiles with ease.</p>
                    </div>
                </div>
                {userType === 'ADMIN' && (
                  <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl">
                      <LayoutDashboard className={`${theme.primaryText} mt-1 size-6`} />
                      <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">Custom Subdomains</h4>
                          <p className="text-base text-slate-500">Launch a dedicated website for your school instantly.</p>
                      </div>
                  </div>
                )}
                {userType === 'ADMIN' && (
                  <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl">
                      <CreditCard className={`${theme.primaryText} mt-1 size-6`} />
                      <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">Fee Collection</h4>
                          <p className="text-base text-slate-500">Seamlessly collect tuition, issue digital receipts, and track outstanding balances.</p>
                      </div>
                  </div>
                )}
            </div>
        </motion.div>
    );
}

function CommunicationStep({ theme, userType }: { theme: any; userType: string }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-8">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Connect Everyone</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Build a thriving digital community. Keep teachers, students, and parents in the loop effortlessly.
                </p>
            </div>
             <div className="space-y-4 max-w-lg">
                <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl">
                    <MessageSquare className={`${theme.primaryText} mt-1 size-6`} />
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">Instant Messaging</h4>
                        <p className="text-base text-slate-500">Secure, internal chat systems and announcement broadcasting for all stakeholders.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function AcademicsStep({ theme, userType }: { theme: any; userType: string }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-8">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Academic Excellence</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Modern tools designed to help educators teach better and students learn faster.
                </p>
            </div>
             <div className="space-y-4 max-w-lg">
                <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl">
                    <GraduationCap className={`${theme.primaryText} mt-1 size-6`} />
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">Grades & Exams</h4>
                        <p className="text-base text-slate-500">Generate report cards automatically, manage online assignments, and track attendance.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function SuccessStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="flex flex-col items-center justify-center text-center space-y-6 py-12">
            <div className="mb-4">
                <Lottie
                    animationData={Success}
                    loop={true}
                    className="w-40 h-40"
                />
            </div>
            <div>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">You're ready <br/> to launch!</h3>
                <p className="text-slate-500 text-lg max-w-sm mx-auto">The tour is complete. It's time to take the reins and start building your digital academy.</p>
            </div>
        </motion.div>
    );
}
