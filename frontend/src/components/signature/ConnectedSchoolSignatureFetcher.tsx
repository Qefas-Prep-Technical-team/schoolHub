"use client";

import React from 'react';
import { Award, CheckCircle2, AlertCircle, FileCheck, ShieldCheck } from 'lucide-react';
import { useConnectedSchoolSignature, ConnectedSignatory } from '@/lib/api/hooks/useConnectedSchoolSignature';
import { cn } from '@/lib/utils';

export interface ConnectedSchoolSignatureFetcherProps {
  schoolId?: string;
  schoolProfile?: {
    name?: string;
    principalName?: string;
    primarySignature?: string;
    signatureUrl?: string;
    admins?: Array<{
      id?: string;
      adminId?: string;
      role?: string;
      admin?: { id?: string; name?: string; role?: string };
    }>;
  };
  teacherContext?: {
    name?: string;
    signatureUrl?: string;
  };
  variant?: 'badge' | 'card' | 'endorsement-strip';
  onSignaturesResolved?: (signatures: {
    headOfSchool: ConnectedSignatory;
    secondarySignatory: ConnectedSignatory;
  }) => void;
  className?: string;
}

export const ConnectedSchoolSignatureFetcher: React.FC<ConnectedSchoolSignatureFetcherProps> = ({
  schoolId,
  schoolProfile,
  teacherContext,
  variant = 'badge',
  onSignaturesResolved,
  className,
}) => {
  const { isLoading, headOfSchool, secondarySignatory } = useConnectedSchoolSignature(
    schoolId,
    schoolProfile,
    teacherContext
  );

  React.useEffect(() => {
    if (!isLoading && onSignaturesResolved) {
      onSignaturesResolved({ headOfSchool, secondarySignatory });
    }
  }, [isLoading, headOfSchool, secondarySignatory, onSignaturesResolved]);

  if (variant === 'badge') {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-sm",
          headOfSchool.isImage
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300"
            : "bg-amber-50/80 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-300",
          className
        )}
      >
        {headOfSchool.isImage ? (
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        )}
        <div className="flex flex-col">
          <span className="font-semibold leading-tight">
            {headOfSchool.isImage ? "Verified Endorsement" : "Pending Signature Setup"}
          </span>
          <span className="text-[10px] opacity-80 leading-tight">
            {headOfSchool.name} ({headOfSchool.title})
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={cn(
          "p-4 rounded-xl border bg-card/60 backdrop-blur-sm shadow-sm space-y-3",
          className
        )}
      >
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Connected School Endorsement
            </span>
          </div>
          <span
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-semibold",
              headOfSchool.isImage
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
            )}
          >
            {headOfSchool.isImage ? "Active Digital Signatures" : "Fallback Signatures"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <SignatoryMiniCard signatory={headOfSchool} />
          <SignatoryMiniCard signatory={secondarySignatory} />
        </div>
      </div>
    );
  }

  // variant === 'endorsement-strip'
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg border bg-muted/40",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <FileCheck className="w-5 h-5 text-primary" />
        <div>
          <p className="text-xs font-semibold text-foreground">
            Official Endorsements Resolved
          </p>
          <p className="text-[11px] text-muted-foreground">
            {headOfSchool.name} &bull; {secondarySignatory.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {headOfSchool.signatureUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={headOfSchool.signatureUrl}
            alt="Head Signature"
            className="h-8 max-w-[100px] object-contain border-b border-border"
          />
        )}
        {secondarySignatory.signatureUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={secondarySignatory.signatureUrl}
            alt="Secondary Signature"
            className="h-8 max-w-[100px] object-contain border-b border-border"
          />
        )}
      </div>
    </div>
  );
};

const SignatoryMiniCard: React.FC<{ signatory: ConnectedSignatory }> = ({ signatory }) => {
  return (
    <div className="p-2.5 rounded-lg border bg-background/50 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs font-semibold truncate text-foreground">{signatory.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{signatory.title}</p>
      </div>
      {signatory.signatureUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={signatory.signatureUrl}
          alt={signatory.name}
          className="h-7 max-w-[80px] object-contain border-b border-muted-foreground/30"
        />
      ) : (
        <span className="text-[10px] italic text-muted-foreground">Manual Line</span>
      )}
    </div>
  );
};

