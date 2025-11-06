export default function HeadlineText({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-text-light dark:text-text-dark font-heading tracking-tight text-3xl font-bold leading-tight text-center pb-2">
      {children}
    </h1>
  );
}
