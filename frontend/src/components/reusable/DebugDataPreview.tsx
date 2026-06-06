"use client";

import React from "react";

interface DebugDataPreviewProps {
    data: any;
    label?: string;
    isVisible?: boolean;
}

export function DebugDataPreview({ data, label = "DEBUG RAW DATA", isVisible = process.env.NODE_ENV === "development" }: DebugDataPreviewProps) {
    if (!isVisible) return null;

    return (
        <div className="mt-8 p-4 bg-slate-900 text-green-400 font-mono text-xs overflow-auto max-h-96 rounded-xl border border-slate-800 shadow-xl">
            <p className="font-bold mb-2 uppercase tracking-widest text-slate-500">{label}:</p>
            <pre className="whitespace-pre-wrap word-break">{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
