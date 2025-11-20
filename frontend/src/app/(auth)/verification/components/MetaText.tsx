'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  initialSeconds?: number;
  onResend?: () => Promise<void> | void;
};

export default function MetaText({ initialSeconds = 45, onResend }: Props) {
  const [seconds, setSeconds] = useState<number>(initialSeconds);
  const [sending, setSending] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (seconds <= 0) return;

    intervalRef.current = window.setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [seconds]);

  const handleResend = useCallback(async () => {
    // prevent resend while counting down or already sending
    if (seconds > 0 || sending) return;

    try {
      setSending(true);
      if (onResend) await onResend();
    } catch (err) {
      // log error so lint/typecheck doesn't complain; consumers can handle errors via onResend
      // optionally add toast/error handling here
      console.error(err);
    } finally {
      setSending(false);
      // restart the timer
      setSeconds(initialSeconds);
    }
  }, [seconds, sending, onResend, initialSeconds]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeLabel = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Didn't receive the code?{' '}
        <button
          type="button"
          disabled={seconds > 0 || sending}
          onClick={handleResend}
          className={`font-medium text-primary hover:underline ${seconds > 0 || sending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {sending ? 'Resending...' : 'Resend Code'}
        </button>
      </p>

      {seconds > 0 ? (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Resend available in {timeLabel}</p>
      ) : (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">You can resend now.</p>
      )}
    </div>
  );
}