'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import EmailVerificationCard from './EmailVerificationCard';
import DeviceVerificationCard from './DeviceVerificationCard';

export default function VerificationCard() {
  const searchParams = useSearchParams();
  const reasonParam = searchParams.get('reason');

  // Check if session or URL explicitly marks this as a device authorization check
  const isDeviceCheck =
    reasonParam === 'device' ||
    searchParams.get('isDevice') === 'true' ||
    (typeof window !== 'undefined' && Boolean(sessionStorage.getItem('preAuthToken')));

  if (isDeviceCheck) {
    return <DeviceVerificationCard />;
  }

  return <EmailVerificationCard />;
}
