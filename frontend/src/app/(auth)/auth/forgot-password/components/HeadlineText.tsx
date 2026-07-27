export default function HeadlineText({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
      {children}
    </h1>
  );
}
