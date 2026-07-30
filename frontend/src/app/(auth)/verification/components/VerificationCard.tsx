'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRequestCode, useVerifyCode, useResendCode } from '../services/useVerificationMutations';
import CodeInputGroup from './CodeInputGroup';
import VerifyButton from './VerifyButton';
import MetaText from './MetaText';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

import { getRoleTheme } from '@/lib/theme/roleTheme';

export default function VerificationCard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get('email');
  const userType = searchParams.get('userType');
  const roleTheme = getRoleTheme(userType);

  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: requestCode } = useRequestCode();
  const { mutate: verifyCode, isPending: isVerifying } = useVerifyCode();
  const { mutateAsync: resendCode } = useResendCode();

  // Request verification code automatically when component mounts
  const hasRequested = React.useRef(false);

  useEffect(() => {
    const shouldRequest = searchParams.get('requestCode') === 'true';

    if (shouldRequest && !hasRequested.current && email && userType) {
      hasRequested.current = true;
      requestCode({ email, userType });

      // Clean up URL to prevent resending on manual refresh/reload
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('requestCode');
      const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    }
  }, [email, userType, searchParams, router, requestCode]);

  const handleCodeComplete = (code: string) => {
    setVerificationCode(code);
    setIsCodeComplete(code.length === 6);
  };


  const handleVerify = () => {
    if (email && verificationCode.length === 6 && userType) {
      verifyCode(
        { email, code: verificationCode, userType },
        {
          onSuccess: () => {
            setIsSuccess(true);
            // Clear any pre-auth token from registration flow
            sessionStorage.removeItem("preAuthToken");
            // Always redirect to sign-in after verification
            setTimeout(() => {
              router.push(`/login?email=${encodeURIComponent(email)}&userType=${encodeURIComponent(userType)}`);
            }, 1500);
          },
        }
      );
    }
  };

  const handleResendCode = async () => {
    if (email && userType) {
      try {
        await resendCode({ email, userType });
      } catch (error) {
        console.error('Resend failed:', error);
      }
    }
  };

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  if (!email) {
    return (
      <div className="w-full rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          No email provided for verification.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden w-full rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-200/50 dark:shadow-none">
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-4"
            >
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-black text-slate-900 dark:text-white"
            >
              Verification Successful!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium"
            >
              Redirecting you to sign in...
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Please wait</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center space-y-3">
        {userType && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className={`h-2 w-2 rounded-full ${roleTheme.accentBg}`}></span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${roleTheme.activeNavText}`}>
              {roleTheme.label} Portal
            </span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Verify Email Address
        </h1>
        <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
          We&apos;ve sent a 6-digit confirmation code to{' '}
          <span className="font-bold text-slate-900 dark:text-slate-100 underline decoration-indigo-500/30">
            {email}
          </span>
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <CodeInputGroup
          email={email}
          onCodeComplete={handleCodeComplete}
        />
      </div>

      <div className="mt-8">
        <VerifyButton
          label={isVerifying ? "Verifying Code..." : "Verify & Continue"}
          userType={userType}
          disabled={!isCodeComplete || isVerifying || isSuccess}
          onClick={handleVerify}
        />
      </div>

      <MetaText
        initialSeconds={60}
        onResend={handleResendCode}
      />
    </div>
  );
}

