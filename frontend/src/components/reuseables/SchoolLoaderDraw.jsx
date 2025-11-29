import React from "react";
import { School } from "lucide-react";
import "./schoolLoader.css";

export default function SchoolLoaderDraw({ size = 96, label = "Loading" }) {
    return (
        <div className="school-loader-wrap" role="status" aria-live="polite" aria-label={label}>
            <School className="school-icon draw" size={size} strokeWidth={1.8} />
            <span className="sr-only">{label}…</span>
        </div>
    );
}
