'use client';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { Box } from '@mui/material';
import React from 'react';

interface CodeInputGroupProps {
  email: string;
  onCodeComplete: (code: string) => void;
}

export default function CodeInputGroup({ 
  email, 
  onCodeComplete
}: CodeInputGroupProps) {

  const handleCodeChange = (value: string) => {
    // This will be called as the user types
    if (value.length === 6) {
      onCodeComplete(value);
    } else {
      onCodeComplete(''); // Reset if not complete
    }
  };

  return (
    <Box component={"section"} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <InputOTP 
        maxLength={6} 
        onChange={handleCodeChange}
        onComplete={(value) => onCodeComplete(value)}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </Box>
  );
}