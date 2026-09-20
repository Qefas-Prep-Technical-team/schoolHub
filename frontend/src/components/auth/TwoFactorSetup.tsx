import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { teacherService } from '@/lib/api/services/teacherService';
import Image from 'next/image';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useToast, useErrorToast } from '@/lib/hooks/useToast';

interface TwoFactorSetupProps {
  isTwoFactorEnabled: boolean;
  onUpdate: (enabled: boolean) => void;
}

export default function TwoFactorSetup({ isTwoFactorEnabled, onUpdate }: TwoFactorSetupProps) {
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'initial' | 'qr' | 'verify'>('initial');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [disableConfirmation, setDisableConfirmation] = useState('');

  const buttonColors: Record<string, string> = {
    TEACHER: "bg-emerald-600 hover:bg-emerald-700 text-white",
    ADMIN: "bg-blue-600 hover:bg-blue-700 text-white",
    STUDENT: "bg-rose-600 hover:bg-rose-700 text-white",
    PARENT: "bg-amber-600 hover:bg-amber-700 text-white",
    USER: "bg-slate-800 hover:bg-slate-900 text-white",
  };
  const themeClass = buttonColors[user?.userType || "USER"] || buttonColors.USER;
  const loaderColor = user?.userType === 'ADMIN' ? 'text-blue-500' : 'text-emerald-500';

  const { success } = useToast();
  const errorToast = useErrorToast();

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      setStep('initial');
      setIsOpen(true);
      await generateQR();
    } else {
      setDisableConfirmation('');
      setIsDisableOpen(true);
    }
  };

  const generateQR = async () => {
    try {
      setIsLoading(true);
      const res = await teacherService.generate2FA();
      if (res.success && res.data) {
        setQrCodeUrl(res.data.qrCodeUrl);
        setSecret(res.data.secret);
        setStep('qr');
      }
    } catch (error: any) {
      errorToast.show(error.response?.data?.message || 'Failed to generate 2FA');
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async () => {
    if (code.length !== 6) {
      errorToast.show('Code must be 6 digits');
      return;
    }
    try {
      setIsLoading(true);
      const res = await teacherService.verify2FA(code);
      if (res.success) {
        success.show('Two-factor authentication enabled successfully!');
        setIsOpen(false);
        onUpdate(true);
      }
    } catch (error: any) {
      errorToast.show(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const disable2FA = async () => {
    try {
      setIsLoading(true);
      const res = await teacherService.disable2FA();
      if (res.success) {
        success.show('Two-factor authentication disabled');
        setIsDisableOpen(false);
        onUpdate(false);
      }
    } catch (error: any) {
      errorToast.show(error.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Require 2FA</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ask for a code on your phone when signing in.</p>
        </div>
        <Switch
          checked={isTwoFactorEnabled}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Setup Two-Factor Authentication</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Scan the QR code with your authenticator app (e.g. Google Authenticator, Authy).
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            {isLoading && step === 'initial' ? (
              <Loader2 className={`h-8 w-8 animate-spin ${loaderColor}`} />
            ) : (
              <>
                {qrCodeUrl && (
                  <div className="bg-white p-2 rounded-lg border">
                    <Image src={qrCodeUrl} alt="2FA QR Code" width={200} height={200} />
                  </div>
                )}
                {secret && (
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Manual entry code:</p>
                    <code className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 px-2 py-1 rounded text-sm font-mono font-bold tracking-widest">{secret}</code>
                  </div>
                )}
                <div className="w-full space-y-2">
                  <Label htmlFor="code" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center font-mono text-lg tracking-widest h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <Button
                  className={`w-full font-semibold ${themeClass}`}
                  onClick={verify2FA}
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Verify and Enable
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDisableOpen} onOpenChange={setIsDisableOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-500">Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Disabling 2FA makes your account significantly less secure. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col space-y-4 py-4">
            <div className="w-full space-y-2 mt-4">
              <Label htmlFor="confirm-disable" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Type <span className="font-bold text-slate-900 dark:text-white">DISABLE</span> to confirm
              </Label>
              <Input
                id="confirm-disable"
                type="text"
                placeholder="DISABLE"
                value={disableConfirmation}
                onChange={(e) => setDisableConfirmation(e.target.value)}
                className="mt-4 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsDisableOpen(false)}
                disabled={isLoading}
                className="border-slate-200 dark:border-slate-800"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                onClick={disable2FA}
                disabled={isLoading || disableConfirmation !== 'DISABLE'}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Turn Off 2FA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
