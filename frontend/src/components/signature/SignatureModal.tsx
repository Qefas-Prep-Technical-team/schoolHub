"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenTool, UploadCloud, Type, Check, X, Loader2, Sparkles, AlertCircle } from "lucide-react";
import DrawSignature from "./tabs/DrawSignature";
import UploadSignature from "./tabs/UploadSignature";
import TypeSignature from "./tabs/TypeSignature";
import SignaturePreview from "./SignaturePreview";
import { signatureService, SignatureRecord } from "@/lib/api/services/signatureService";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
  userRole?: string;
  onSaveSuccess: (signature: SignatureRecord) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName = "Administrator",
  userRole = "Authorized Administrator",
  onSaveSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"draw" | "upload" | "type">("draw");

  // State holding current staged signature data from active tab
  const [stagedSignature, setStagedSignature] = useState<{
    blob: Blob;
    vectorData?: any;
    dataUrl: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Tab switch resets staged signature
  const handleTabChange = (val: string) => {
    setActiveTab(val as "draw" | "upload" | "type");
    setStagedSignature(null);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!stagedSignature?.blob) {
      toast.error("Please provide a signature before saving.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const record = await signatureService.saveSignature({
        blob: stagedSignature.blob,
        method: activeTab === "draw" ? "drawn" : activeTab === "upload" ? "uploaded" : "typed",
        vectorData: stagedSignature.vectorData,
        userId,
      });

      toast.success("Official signature saved and certified!");
      onSaveSuccess(record);
      onClose();
    } catch (err: any) {
      console.error("Save signature error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to save signature.";
      setSaveError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto p-0 rounded-3xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl custom-scrollbar">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-0 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between pb-3">
            <div className="space-y-1">
              <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <PenTool className="text-blue-600 w-5 h-5" />
                <span>Capture Official Signature</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
                Your signature will be converted to a clean, transparent seal for approved academic records.
              </DialogDescription>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl w-full grid grid-cols-3 h-10">
              <TabsTrigger
                value="draw"
                className="rounded-lg text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <PenTool size={13} />
                <span>Draw</span>
              </TabsTrigger>

              <TabsTrigger
                value="upload"
                className="rounded-lg text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <UploadCloud size={13} />
                <span>Upload</span>
              </TabsTrigger>

              <TabsTrigger
                value="type"
                className="rounded-lg text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Type size={13} />
                <span>Type</span>
              </TabsTrigger>
            </TabsList>

            {/* Modal Body */}
            <div className="pt-4 pb-2 space-y-4">
              <TabsContent value="draw" className="m-0 focus-visible:outline-none">
                <DrawSignature onSignatureGenerated={setStagedSignature} />
              </TabsContent>

              <TabsContent value="upload" className="m-0 focus-visible:outline-none">
                <UploadSignature onSignatureGenerated={setStagedSignature} />
              </TabsContent>

              <TabsContent value="type" className="m-0 focus-visible:outline-none">
                <TypeSignature
                  initialName={userName}
                  onSignatureGenerated={setStagedSignature}
                />
              </TabsContent>

              {/* Live Preview on Document Paper Card */}
              <SignaturePreview
                signatureUrl={stagedSignature?.dataUrl || null}
                signerName={userName}
                signerRole={userRole}
              />

              {/* Error Message */}
              {saveError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{saveError}</span>
                </div>
              )}
            </div>
          </Tabs>
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-6 pt-3 bg-slate-50/70 dark:bg-zinc-900/40 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !stagedSignature?.blob}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Certifying & Saving...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>Save Official Signature</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureModal;
