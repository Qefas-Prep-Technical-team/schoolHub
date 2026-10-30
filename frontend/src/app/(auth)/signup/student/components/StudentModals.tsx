'use client';

import React from 'react';
import { ROSE, ROSE_DARK } from './StudentFormFields';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-none dark:ring-1 dark:ring-slate-800 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ icon, title, onClose }: { icon: string; title: string; onClose: () => void }) {
  return (
    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]" style={{ color: ROSE }}>{icon}</span>
        {title}
      </h3>
      <button
        onClick={onClose}
        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>
  );
}

function ModalFooter({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
      <button
        onClick={onClose}
        className="w-full py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
        style={{ background: `linear-gradient(135deg, ${ROSE_DARK} 0%, ${ROSE} 100%)` }}
      >
        {label}
      </button>
    </div>
  );
}

export const PrivacyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <ModalShell onClose={onClose}>
      <ModalHeader icon="security" title="Privacy Policy" onClose={onClose} />
      <div className="p-6 max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-slate-600 dark:text-slate-400 space-y-3">
        <p className="font-semibold text-slate-900 dark:text-white">Last Updated: May 9, 2026</p>
        <p>Your privacy is important to us. We collect minimal data required for school management, including your name, email, and institutional details.</p>
        <p>We do not sell your data to third parties. All data is encrypted and stored securely on our servers.</p>
        <p>We use your information to:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Provide and maintain our Service</li>
          <li>Notify you about changes to our Service</li>
          <li>Provide customer support</li>
          <li>Gather analysis to improve our Service</li>
        </ul>
        <p>By using Qefas Hub, you consent to our data collection practices as outlined in this policy.</p>
      </div>
      <ModalFooter label="I Understand" onClose={onClose} />
    </ModalShell>
  );
};

export const TermsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <ModalShell onClose={onClose}>
      <ModalHeader icon="gavel" title="Terms of Service" onClose={onClose} />
      <div className="p-6 max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-slate-600 dark:text-slate-400 space-y-3">
        <p className="font-semibold text-slate-900 dark:text-white">Last Updated: May 9, 2026</p>
        <p>By using Qefas Hub, you agree to provide accurate information and use the platform for educational management purposes only.</p>
        <p>Unauthorized use, data scraping, or any attempt to compromise the security of the platform is strictly prohibited.</p>
        <p>Users are responsible for maintaining the confidentiality of their account and password. You agree to accept responsibility for all activities that occur under your account.</p>
        <p>We reserve the right to terminate accounts that violate these terms or engage in behavior harmful to other users or the platform.</p>
        <p>Qefas Hub is provided &ldquo;as is&rdquo; without any warranties of any kind, either express or implied.</p>
      </div>
      <ModalFooter label="Accept Terms" onClose={onClose} />
    </ModalShell>
  );
};
