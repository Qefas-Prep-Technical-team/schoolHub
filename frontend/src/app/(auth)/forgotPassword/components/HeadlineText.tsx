export default function HeadlineText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-text-light dark:text-text-dark text-3xl font-black leading-tight tracking-[-0.033em]">
      {children}
    </p>
  );
}
