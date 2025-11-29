import React from "react";
import { School } from "lucide-react";
import "./schoolLoaderIOS.css";

export default function SchoolLoaderIOS({ size = 54 }) {
    return (
        <div className="ios-loader-wrapper">
            <div className="ios-spinner">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className="ios-spinner-line"
                        style={{ transform: `rotate(${i * 30}deg)` }}
                    />
                ))}
            </div>

            {/* Icon in the middle */}
            {/* <School className="ios-loader-icon" size={size} strokeWidth={1.8} /> */}
        </div>
    );
}
