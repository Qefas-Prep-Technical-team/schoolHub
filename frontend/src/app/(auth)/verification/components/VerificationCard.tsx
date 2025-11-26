'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRequestCode, useVerifyCode, useResendCode } from '../services/useVerificationMutations';
import CodeInputGroup from './CodeInputGroup';
import VerifyButton from './VerifyButton';
import MetaText from './MetaText';

export default function VerificationCard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get('email');
  const userType = searchParams.get('userType');



  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeComplete, setIsCodeComplete] = useState(false);

  const { mutate: requestCode, isPending: isRequesting } = useRequestCode();
  const { mutate: verifyCode, isPending: isVerifying } = useVerifyCode();
  const { mutate: resendCode, isPending: isResending } = useResendCode();

  // Request verification code automatically when component mounts
  const hasRequested = React.useRef(false);

  useEffect(() => {
    if (!hasRequested.current && email && userType) {
      hasRequested.current = true;
      requestCode({ email, userType });
    }
  }, [email, userType]);

  const handleCodeComplete = (code: string) => {
    setVerificationCode(code);
    setIsCodeComplete(code.length === 6);
  };

  const handleVerify = () => {
    if (email && verificationCode.length === 6 && userType) {
      verifyCode(
        { email, code: verificationCode, userType },
        {
          onSuccess: (response) => {
            // Redirect to login or dashboard after successful verification
            setTimeout(() => {
              router.push(`/onboarding?type=${userType}`);
            }, 2000);
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
    <div className="w-full rounded-xl bg-white dark:bg-gray-800 p-8 shadow-lg dark:shadow-2xl dark:shadow-black/20">
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
          disabled={!isCodeComplete || isVerifying}
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