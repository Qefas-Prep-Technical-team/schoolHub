"use client";
import { useState } from "react";

export default function PasswordField() {
    const [show, setShow] = useState(false);

    return (
        <div className="flex w-full flex-1 items-stretch rounded-xl border border-[#cfd7e7] bg-background-light dark:border-gray-600 dark:bg-background-dark/50">
            <input
                type={show ? "text" : "password"}
                placeholder="Enter your password"
                className="flex-1 rounded-l-xl border-none bg-transparent p-[15px] text-base text-[#0d121b] placeholder:text-[#4c669a] dark:text-white dark:placeholder-gray-400 focus:outline-0"
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="px-[15px] text-[#4c669a] dark:text-gray-400"
            >
                <span className="material-symbols-outlined">{show ? "visibility_off" : "visibility"}</span>
            </button>
        </div>
    );
}
