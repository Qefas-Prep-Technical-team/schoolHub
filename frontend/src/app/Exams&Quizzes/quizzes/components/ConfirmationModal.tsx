// src/components/Modal/ConfirmationModal.tsx
'use client';

import React from 'react';
import ModalPortal from './ModalPortal';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <ModalPortal>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                onClick={handleBackdropClick}
            >
                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <span className="material-symbols-outlined !text-4xl">
                                rocket_launch
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Are you ready to begin?
                        </h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            The quiz timer will start immediately once you proceed.
                        </p>
                    </div>
                    <div className="mt-8 flex justify-center gap-4">
                        <button
                            onClick={onClose}
                            className="rounded-full bg-gray-100 px-8 py-2.5 cursor-pointer font-semibold text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            Not Yet
                        </button>
                        <button
                            onClick={onConfirm}
                            className="rounded-full bg-primary px-8 py-2.5 cursor-pointer font-semibold text-white transition hover:bg-primary/90"
                        >
                            Let&apos;s Go!
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
};

export default ConfirmationModal;