"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CheckCircle2, ChevronRight, Mail, Shield, UploadCloud, Settings, Sparkles, Users, CreditCard, MessageSquare, GraduationCap, LayoutDashboard, Calendar, Layers, BookOpen, FileSpreadsheet, Maximize2, X, Info } from 'lucide-react';
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

const getSteps = (userType: string) => {
    if (userType === 'ADMIN') {
        return [
          { id: 'welcome', label: 'Welcome' },
          { id: 'setup', label: 'Initial Setup' },
          { id: 'academic', label: 'Academic Structure' },
          { id: 'staff', label: 'Staff & Students' },
          { id: 'assessments', label: 'Records' },
          { id: 'finance', label: 'Finance' },
          { id: 'success', label: 'Ready to Launch' }
        ];
    }
    return [
      { id: 'welcome', label: 'Welcome' },
      { id: 'management', label: 'Dashboard' },
      { id: 'communication', label: 'Communication' },
      { id: 'academics', label: 'Academics' },
      { id: 'success', label: 'Ready to Launch' }
    ];
};

export default function Onboarding() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [previewRole, setPreviewRole] = useState<string | null>(null);
  
  const userType = previewRole || user?.userType || 'ADMIN';
  const theme = THEME_MAP[userType as keyof typeof THEME_MAP] || THEME_MAP.ADMIN;
  const currentSteps = getSteps(userType);
  
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
    if (currentStep < currentSteps.length - 1) {
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
                  {currentSteps.slice(1, -1).map((step, idx) => {
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
                              {idx < currentSteps.slice(1, -1).length - 1 && (
                                  <div className={`flex-1 h-[2px] rounded-full mx-2 ${isPast ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                              )}
                          </React.Fragment>
                      );
                  })}
              </div>
            )}

            <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
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
                            {userType === 'ADMIN' ? (
                                <>
                                    {currentStep === 1 && <SetupStep theme={theme} />}
                                    {currentStep === 2 && <AcademicStructureStep theme={theme} />}
                                    {currentStep === 3 && <StaffStudentStep theme={theme} />}
                                    {currentStep === 4 && <AssessmentsStep theme={theme} />}
                                    {currentStep === 5 && <FinanceStep theme={theme} />}
                                    {currentStep === 6 && <SuccessStep theme={theme} />}
                                </>
                            ) : (
                                <>
                                    {currentStep === 1 && <ManagementStep theme={theme} userType={userType} />}
                                    {currentStep === 2 && <CommunicationStep theme={theme} userType={userType} />}
                                    {currentStep === 3 && <AcademicsStep theme={theme} userType={userType} />}
                                    {currentStep === 4 && <SuccessStep theme={theme} />}
                                </>
                            )}

                            <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800">
                                <Button 
                                    variant="ghost" 
                                    onClick={handleBack}
                                    className={`font-bold rounded-xl ${currentStep === currentSteps.length - 1 ? 'invisible' : ''}`}
                                >
                                    Previous
                                </Button>
                                <Button 
                                    onClick={handleNext}
                                    className={`h-12 px-8 rounded-xl font-bold shadow-lg border-none ${theme.buttonColor}`}
                                >
                                    {currentStep === currentSteps.length - 1 ? 'Login to your Dashboard' : 'Continue'}
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
                <p className="text-slate-500 text-lg max-w-md mx-auto">The tour is complete. It's time to take the reins and start building your digital academy.</p>
                
                <div className="mt-8 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 max-w-md mx-auto flex gap-3 items-start text-left">
                    <Info className="text-orange-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        <strong>Need a refresher?</strong> You can always revisit this onboarding tour by clicking the <strong>"Revisit Onboarding"</strong> button on your dashboard's <strong>Settings</strong> page.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function PreviewableImage({ src, alt, theme }: { src: string, alt: string, theme: any }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div 
                onClick={() => setIsOpen(true)}
                className="relative group cursor-pointer rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0 w-full sm:w-48 h-32 bg-slate-100 dark:bg-slate-900 flex items-center justify-center"
            >
                {src ? (
                    <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <UploadCloud size={24} className="mb-2" />
                        <span className="text-[10px] uppercase tracking-wider font-bold">Add Image Here</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" size={24} />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    >
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        {src ? (
                            <motion.img 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                src={src} 
                                alt={alt} 
                                className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl border border-white/10"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="w-full max-w-2xl aspect-video rounded-2xl shadow-2xl border border-white/10 bg-slate-800 flex flex-col items-center justify-center text-white"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <UploadCloud size={48} className="mb-4 opacity-50" />
                                <p className="text-lg font-medium opacity-80">No image provided yet</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function PreviewableImageSlider({ images, alt, theme }: { images: string[], alt: string, theme: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <>
            <div 
                onClick={() => images.length > 0 && setIsOpen(true)}
                className="relative group cursor-pointer rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0 w-full sm:w-48 h-32 bg-slate-100 dark:bg-slate-900 flex items-center justify-center"
            >
                {images.length > 0 && images[currentIndex] ? (
                    <>
                        <img src={images[currentIndex]} alt={`${alt} ${currentIndex + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        {images.length > 1 && (
                            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 z-10">
                                {images.map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`} />
                                ))}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" size={24} />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <UploadCloud size={24} className="mb-2" />
                        <span className="text-[10px] uppercase tracking-wider font-bold">Add Images</span>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    >
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                        >
                            <X size={24} />
                        </button>
                        
                        {images.length > 1 && (
                            <>
                                <button 
                                    onClick={handlePrev}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                                >
                                    <ChevronRight className="rotate-180" size={32} />
                                </button>
                                <button 
                                    onClick={handleNext}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                                >
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}

                        {images.length > 0 && images[currentIndex] && (
                            <div className="relative max-w-full max-h-[90vh] flex flex-col items-center">
                                <motion.img 
                                    key={currentIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    src={images[currentIndex]} 
                                    alt={`${alt} ${currentIndex + 1}`}
                                    className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {images.length > 1 && (
                                    <div className="absolute -bottom-8 flex justify-center gap-2 z-50" onClick={(e) => e.stopPropagation()}>
                                        {images.map((_, i) => (
                                            <button 
                                                key={i} 
                                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                                                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`} 
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function SetupStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Initial Setup</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Set up your school's foundational identity, contact details, and custom login URL.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Building2 className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">School Profile</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>School Profile</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Edit Profile</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Add and edit your school's information.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Upload your school's logo and motto.</li>
                            <li>Add official phone numbers and emails.</li>
                            <li>This data is used automatically on student report cards and invoices.</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/admin%20onboarding%202%20(2).png" alt="School Profile Settings" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <LayoutDashboard className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Custom Subdomain</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Core Management</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Sub Domain</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Redesign your custom domain to match your taste.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Build and personalize your own public landing page.</li>
                            <li>Outsiders can visit your custom domain to view your beautifully designed custom website.</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/admin%20onboarding%202%20(1).png" alt="Custom Subdomain Setup" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function AcademicStructureStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Academic Structure</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Define how your school operates by setting up sessions, terms, and departments.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Calendar className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Sessions & Terms</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Core Management</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Session Management</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Configure your academic calendar.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Add the start and end dates for your academic sessions.</li>
                            <li>Define terms within each session so that results and assessments can be properly categorized.</li>
                            <li><strong>Important:</strong> You cannot create exams or records without an active session!</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/admin%20onboarding%203.png" alt="Sessions and Terms Management" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Layers className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Departments & Classes</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Academics</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Departments</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Core Management</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Classes & Timetable</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Set up classes and sections.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Create departments like "Science", "Arts", or "Primary".</li>
                            <li>Create individual classes within the <strong>Classes & Timetable</strong> section.</li>
                            <li>Inside those individual classes, you can manage the timetable, students, subjects, teachers, exams, attendance, final results, and analytics.</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/admin%20onboarding%204.png" alt="Departments and Classes" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StaffStudentStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Staff & Students</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Bring your team on board, enroll students, and connect families.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Users className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Linking Admins</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span className="font-bold mr-1">Admin:</span>
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Core Management</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Team</span>
                        </div>


                            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
                            <div>
                                <strong className="text-slate-800 dark:text-slate-200 block mb-1">1. Linking Admins</strong>
                                <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
                                    <li>Go to the school admin register page and click <strong>Join existing school</strong>.</li>
                                    <li>Fill out the form and add the <strong>School Code</strong> from the Linking Hub page.</li>
                                    <li>Once registered, the name appears on the Team page under <em>Pending</em>, where existing admins can accept/reject and assign a role.</li>
                                </ul>
                            </div>
                        </div>






                    </div>
                    <PreviewableImageSlider images={["/onboarding/admin onboarding 4 - linking admin -1.png", "/onboarding/admin onboarding 4 - linking admin -2.png", "/onboarding/admin onboarding 4 - linking admin -3.png", "/onboarding/admin onboarding 4 - linking admin -4.png"]} alt="Linking Admins" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>


                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Users className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Linking Teachers</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span className="font-bold mr-1">Teacher:</span>
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Core Management</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Linking Hub</span>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
                            <ul className="list-disc list-inside space-y-2 text-slate-500 dark:text-slate-400">
                                <li><strong>During Registration:</strong> On the teacher register page, select optional information, enter data, and add the school code from the Linking Hub. A request will be sent to the school admins. Alternatively, teachers can scan the QR code from the Linking Hub or use a copied link for auto sign-up.</li>
                                <li><strong>After Registration:</strong> Registered teachers can go to their own Linking Hub, click <strong>Connect with Code</strong>, select "School to Teacher", and paste the code. School admins will then accept the connection.</li>
                            </ul>
                        </div>
                    </div>
                    <PreviewableImageSlider images={["/onboarding/admin onboarding 4 - Linking Teachers -1.png", "/onboarding/admin onboarding 4 - Linking Teachers -2.png", "/onboarding/admin onboarding 4 - Linking Teachers -3.png", "/onboarding/admin onboarding 4 - Linking Teachers -4.png", "/onboarding/admin onboarding 4 - Linking Teachers -5.png"]} alt="Linking Teachers" theme={theme} />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <GraduationCap className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Linking Students</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Students can be linked to your school in two ways:
                        </p>











                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li><strong>During Registration:</strong> On the student register page, select optional information, enter data, and add the school code from the Linking Hub. A request will be sent to the school admins. Alternatively, students can scan the QR code from the Linking Hub or use a copied link for auto sign-up.</li>
                            <li><strong>After Registration:</strong> Registered students can go to their own Linking Hub, click Connect with Code, select "School to Student", and paste the code. School admins will then accept the connection.</li>
                        </ul>
                    </div>
                    <PreviewableImageSlider images={["/onboarding/admin onboarding 4 - Linking Students -1.png", "/onboarding/admin onboarding 4 - Linking Students -2.png", "/onboarding/admin onboarding 4 - Linking Students -3.png", "/onboarding/admin onboarding 4 - Linking Students -4.png", "/onboarding/admin onboarding 4 - Linking Students -5.png"]} alt="Linking Students" theme={theme} />
                </div>

                {/* Linking Parents */}
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 mt-6">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Users className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Linking Parents</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Parents can only connect to students. This can be done during registration or after:
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li><strong>During Registration:</strong> On the parent register page, select optional information, enter data, and add the student code from the student's Linking Hub. A request will be sent to the student to accept.</li>
                            <li><strong>After Registration:</strong> Registered parents can go to their own Linking Hub, click Connect with Code, select "Student to Parent", and paste the student's code. The student will then accept the connection.</li>
                        </ul>
                    </div>
                    <PreviewableImageSlider images={["/onboarding/admin onboarding 4 - Linking parents -1.png", "/onboarding/admin onboarding 4 - Linking parents -2.png", "/onboarding/admin onboarding 4 - Linking parents -3.png", "/onboarding/admin onboarding 4 - Linking parents - 4.png", "/onboarding/admin onboarding 4 - Linking parents - 5.png"]} alt="Linking Parents" theme={theme} />
                </div>

            </div>
        </motion.div>
    );
}

function AssessmentsStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Assessments & Records</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Understand the grading system and how to publish results.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <BookOpen className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Exam Setup</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Academics</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Exams</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Design and deploy formal assessments and Computer-Based Tests (CBT).
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Create structured, timed exams with customizable question banks.</li>
                            <li>Set strict grading logic, time limits, and automated scoring parameters.</li>
                            <li>Monitor active exam sessions and track student submission statuses.</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/aadmin- Assessments & Records - exam setup.png" alt="Exam Setup" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <GraduationCap className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Grades</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Academics</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Grades</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Comprehensively track and manage student academic performance.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Review detailed scores for individual students across all enrolled subjects.</li>
                            <li>Monitor term-long performance trends, including continuous assessments.</li>
                            <li>Identify areas for improvement and analyze class-wide averages.</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/aadmin- Assessments & Records - grades.png" alt="Grades" theme={theme} />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Layers className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Assignments</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Academics</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Assignments</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Orchestrate day-to-day continuous assessments and homework.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Empower teachers to assign and grade daily or weekly tasks.</li>
                            <li>Set clear submission deadlines and provide direct feedback on student work.</li>
                            <li>Assignment scores automatically compile and weight toward final records.</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/aadmin- Assessments & Records - asignment.png" alt="Assignments" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 mt-6">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <FileSpreadsheet className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Final Result (Records)</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Academics</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Records</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Aggregate, verify, and publish official end-of-term academic results.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Automatically compile all Continuous Assessment (CA) and Exam scores.</li>
                            <li>Generate comprehensive report cards and performance analytics for each class.</li>
                            <li>Administrators must explicitly verify and click "Publish" to make results visible to parents and students.</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/aadmin- Assessments & Records -  final result.png" alt="Final Result" theme={theme} />
                </div>
            </div>
        </motion.div>
    );
}

function FinanceStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Billing & Finance</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Manage your subscription, usage limits, and financial transactions.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <CreditCard className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Subscription & Usage Limits</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Finance</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Billing</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Manage school billing from your dashboard.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Access full subscription details (plan, usage, and transaction limits) from the sidebar.</li>
                            <li>Click "Change Plan" or "Upgrade Plan" to browse and select a new plan.</li>
                            <li>Review your plan breakdown, apply a coupon, and proceed through checkout.</li>
                            <li>Payments trigger automatic subscription activation (and deactivation upon expiry).</li>

                        </ul>
                    </div>
                    <PreviewableImageSlider images={["/onboarding/Billing & Finance - Subscription & Usage Limits-1.png", "/onboarding/Billing & Finance - Subscription & Usage Limits-2.png", "/onboarding/Billing & Finance - Subscription & Usage Limits- 3.png", "/onboarding/Billing & Finance - Subscription & Usage Limits- 4.png"]} alt="Billing and Subscription" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 mt-6">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <CreditCard className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Pricing on Landing Page</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Website</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Pricing</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Pay directly from the landing page.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Click the "Pricing" link on the top navigation bar to see a list of plans we offer.</li>
                            <li>Select a plan to view a payment breakdown and apply any coupon codes. Unauthenticated users will be prompted for their email.</li>
                            <li>First-time registrations receive a free trial, which is activated upon completing the payment process.</li>
                            <li>Subscriptions are automatically activated and deactivated based on their expiration date.</li>
                        </ul>
                    </div>
                    <PreviewableImageSlider images={["/onboarding/Billing & Finance - pricing -1.png", "/onboarding/Billing & Finance - pricing -2.png"]} alt="Pricing on Landing Page" theme={theme} />
                </div>
            </div>
        </motion.div>
    );
}
