// components/ButtonGroup.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "./Button";
import { useRequestPasswordResetMutation } from "../../services/mutations";


export default function ButtonGroup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  const { mutate: requestReset } = useRequestPasswordResetMutation();

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleOpenEmail = () => {
    // Open default email client
    window.location.href = "mailto:";
  };

  const handleResendLink = () => {
    if (cooldown > 0 || !email) return;

    setIsResending(true);
    
    requestReset(email, {
      onSuccess: () => {
        // Start 60-second cooldown
        setCooldown(60);
        setIsResending(false);
      },
      onError: () => {
        setIsResending(false);
      },
    });
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  const getResendButtonText = () => {
    if (isResending) return "Sending...";
    if (cooldown > 0) return `Resend Link (${cooldown}s)`;
    return "Resend Link";
  };

  const isResendDisabled = cooldown > 0 || isResending || !email;

  return (
    <div className="flex w-full flex-col items-stretch gap-3">
      <Button 
        text="Open Email App" 
        variant="primary" 
        onClick={handleOpenEmail}
      />
      
      <Button 
        text={getResendButtonText()}
        variant="secondary" 
        onClick={handleResendLink}
        disabled={isResendDisabled}
        loading={isResending}
      />
      
      <Button 
        text="Back to Login" 
        variant="ghost" 
        onClick={handleBackToLogin}
      />
    </div>
  );
}