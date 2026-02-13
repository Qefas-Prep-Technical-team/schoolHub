/* eslint-disable @typescript-eslint/no-explicit-any */
// app/onboarding/_components/StudentFlow.tsx
import { motion } from "framer-motion";
export default function StudentFlow({ user }: { user: any }) {
  return (
    <div className="text-center">
      <motion.div 
        animate={{ rotate: [0, 10, -10, 0] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-6xl mb-6"
      >
        👋
      </motion.div>
      <h2 className="text-3xl font-black text-slate-900 mb-2">Hey {user?.name.split(' ')[0]}!</h2>
      <p className="text-slate-500 mb-8">Let&apos;s get your profile ready for the new term.</p>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        {['Sports', 'Art', 'Science', 'Music'].map(interest => (
          <button key={interest} className="p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 font-medium transition-all">
            {interest}
          </button>
        ))}
      </div>
      
      <button className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-200">
        Enter My Classroom
      </button>
    </div>
  );
}