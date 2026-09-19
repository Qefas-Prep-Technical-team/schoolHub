import TeacherCard from "./components/TeacherCard";

export default function TeacherRegisterPage() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 lg:p-10 relative overflow-hidden transition-colors duration-300
                 bg-[#e8f5e9] dark:bg-slate-950"
    >
      {/* Light mode — soft emerald ambient blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[100px] opacity-40 pointer-events-none bg-emerald-200 dark:bg-emerald-900/30" />
      <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full blur-[120px] opacity-30 pointer-events-none bg-green-200 dark:bg-green-900/20" />

      {/* Dark mode — subtle grid texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-[1180px] mt-24">
        <TeacherCard />
      </div>
    </div>
  );
}
