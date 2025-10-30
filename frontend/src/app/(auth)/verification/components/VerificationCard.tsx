'use client';
import React from 'react';
import CodeInputGroup from './CodeInputGroup';
import VerifyButton from './VerifyButton';
import MetaText from './MetaText';

export default function VerificationCard() {
  return (
    <div className="w-full rounded-xl bg-white dark:bg-gray-800 p-8 shadow-lg dark:shadow-2xl dark:shadow-black/20">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Verify Your Email Address
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          We’ve sent a 6-digit confirmation code to your email address at{' '}
          <strong className="font-medium text-gray-800 dark:text-gray-100">
            johndoe@email.com
          </strong>
          .
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Wrong email?{' '}
          <a className="font-medium text-primary hover:underline" href="#">
            Change email
          </a>
        </p>
      </div>

      <div className="mt-8">
        <CodeInputGroup />
      </div>

      <div className="mt-8">
        <VerifyButton label="Verify Account" disabled />
      </div>

      <MetaText />
    </div>
  );
}
