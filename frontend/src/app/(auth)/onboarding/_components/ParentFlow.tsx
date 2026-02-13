/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ParentFlow({ user }: { user: any }) {
  const [step, setStep] = useState(1);

  const steps = [
    { title: "Welcome", description: `Hi ${user?.name}, let's link your child.` },
    { title: "Student Code", description: "Enter the code provided by the school." },
    { title: "Verification", description: "Almost done!" }
  ];

  return (
    <div className="max-w-lg mx-auto mt-20 p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
        >
          <span className="text-blue-600 font-bold text-sm uppercase">Step {step} of 3</span>
          <h1 className="text-2xl font-bold mt-2">{steps[step-1].title}</h1>
          <p className="text-slate-500 mt-2">{steps[step-1].description}</p>
          
          {/* Your specific inputs for Parents go here */}
          <div className="mt-8">
            {step === 2 && <input type="text" placeholder="e.g. SCH-123" className="w-full p-3 border rounded-xl" />}
          </div>

          <div className="mt-10 flex justify-between">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1}>Back</button>
            <button 
                onClick={() => setStep(s => s + 1)}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl"
            >
                {step === 3 ? "Complete Setup" : "Continue"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}