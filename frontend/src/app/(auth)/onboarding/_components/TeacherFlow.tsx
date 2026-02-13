/* eslint-disable @typescript-eslint/no-explicit-any */
// app/onboarding/_components/TeacherFlow.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Sparkles } from "lucide-react";

export default function TeacherFlow({ user }: { user: any }) {
  const [step, setStep] = useState(1);

  return (
    <div className="space-y-8">
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-emerald-500" : "bg-slate-200"}`} />
        ))}
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-emerald-50 p-3 rounded-2xl w-fit mb-4">
            <BookOpen className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">What do you teach?</h2>
          <p className="text-slate-500 mb-6">This helps us organize your subjects and gradebooks.</p>
          <input className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 outline-none" placeholder="e.g. Advanced Mathematics" />
          <button onClick={() => setStep(2)} className="w-full mt-6 bg-emerald-600 text-white p-4 rounded-2xl font-bold">Next Step</button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-emerald-50 p-3 rounded-2xl w-fit mb-4">
            <Users className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold">Invite your students</h2>
          <p className="text-slate-500 mb-6">Generate a class code or upload a CSV file.</p>
          <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center cursor-pointer hover:border-emerald-400">
            Click to upload Roster
          </div>
          <button onClick={() => setStep(3)} className="w-full mt-6 bg-emerald-600 text-white p-4 rounded-2xl font-bold">Continue</button>
        </motion.div>
      )}
    </div>
  );
}