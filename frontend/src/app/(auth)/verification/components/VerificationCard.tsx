'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRequestCode, useVerifyCode, useResendCode } from '../services/useVerificationMutations';
import { useLoginMutation } from '../../login/services/use-auth-mutations';
import CodeInputGroup from './CodeInputGroup';
import VerifyButton from './VerifyButton';
import MetaText from './MetaText';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function VerificationCard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get('email');
  const userType = searchParams.get('userType');

  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: requestCode, isPending: isRequesting } = useRequestCode();
  const { mutate: verifyCode, isPending: isVerifying } = useVerifyCode();
  const { mutate: resendCode, isPending: isResending } = useResendCode();
  const loginMutation = useLoginMutation();

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
      router.replace(newUrl);
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
          onSuccess: (response: any) => {
            setIsSuccess(true);
            const isNewUser = response?.data?.isNewUser ?? false;
            
            const preAuthToken = sessionStorage.getItem("preAuthToken");
            
            if (preAuthToken) {
              // Auto-login using secure preAuthToken
              loginMutation.mutate({
                email: email,
                userType: userType as any,
                isNewUser: isNewUser,
                preAuthToken: preAuthToken
              });
              sessionStorage.removeItem("preAuthToken");
            } else {
              // Fallback to manual login redirect (e.g., brand new registration without login attempt)
              setTimeout(() => {
                router.push(`/login/${userType.toLowerCase()}?new=${isNewUser}`);
              }, 3000);
            }
          }
        }
      );
    }
  };

  const handleResendCode = async () => {
    if (email && userType) {
      try {
        await resendCode({ email, userType });
      } catch (error) {
        // Error is handled in the mutation
        console.error('Resend failed:', error);
      }
    }
  };

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      router.push('/register/parent');
    }
  }, [email, router]);

  if (!email) {
    return (
      <div className="w-full rounded-xl bg-white dark:bg-gray-800 p-8 shadow-lg text-center">
        <p className="text-gray-600 dark:text-gray-300">
          No email provided for verification.
        </p>
        <button
          onClick={() => router.push('/register/parent')}
          className="mt-4 text-primary hover:underline"
        >
          Go to Registration
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden w-full rounded-xl bg-white dark:bg-gray-800 p-8 shadow-lg dark:shadow-2xl dark:shadow-black/20">
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-800/95 backdrop-blur-sm p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              Verification Successful!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-gray-600 dark:text-gray-300"
            >
              Redirecting you to onboarding...
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex items-center gap-2 text-primary font-medium"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Please wait</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Verify Your Email Address
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          We&apos;ve sent a 6-digit confirmation code to your email address at{' '}
          <strong className="font-medium text-gray-800 dark:text-gray-100">
            {email}
          </strong>
          .
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Wrong email?{' '}
          <a
            className="font-medium text-primary hover:underline"
            href="/register/parent"
          >
            Go back to registration
          </a>
        </p>
      </div>

      <div className="mt-8">
        <CodeInputGroup
          email={email}
          onCodeComplete={handleCodeComplete}
        />
      </div>

      <div className="mt-8">
        <VerifyButton
          label={isVerifying ? "Verifying..." : "Verify Account"}
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

