export default function BodyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-normal">
      {children}
    </p>
  );
}
