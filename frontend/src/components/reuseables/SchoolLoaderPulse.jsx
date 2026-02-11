import React from "react";
import { School } from "lucide-react";
import "./schoolLoader.css"; // same file; CSS below supports both variants

export default function SchoolLoaderPulse({ size = 88, label = "Loading" }) {
    return (
        <div className="school-loader-wrap" role="status" aria-live="polite" aria-label={label}>
            <div className="school-pulse-outer">
                <School className="school-icon pulse" size={size} strokeWidth={1.6} />
            </div>
            <p className="loader-text">Loading…</p>
            <span className="sr-only">{label}…</span>
        </div>
    );
}
