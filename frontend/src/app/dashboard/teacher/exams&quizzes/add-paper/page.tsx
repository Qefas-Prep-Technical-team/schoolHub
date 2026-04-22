'use client';

import { useRouter } from 'next/navigation';
import CreatePaperForm from "../components/CreatePaperForm";
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AddPaperPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 lg:p-12">
      <div className="max-w-[80vw] mx-auto">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="mb-8"
        >
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-4 group"
            >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Back to Assessments</span>
            </button>
        </motion.div>

        <CreatePaperForm 
            onSuccess={(paperId) => {
                router.push(`/dashboard/teacher/exams&quizzes/add-question?paperId=${paperId}`);
            }}
        />
      </div>
    </div>
  );
}
