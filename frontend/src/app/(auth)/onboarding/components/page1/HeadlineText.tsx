interface HeadlineTextProps {
  title: string;
  subtitle: string;
}

export default function HeadlineText({ title, subtitle }: HeadlineTextProps) {
  return (
    <div className="text-center">
      <h1 className="text-text-light dark:text-text-dark tracking-tight text-2xl sm:text-3xl font-bold leading-tight font-heading">
        {title}
      </h1>
      <p className="text-slate-600 dark:text-slate-300 text-base font-normal leading-relaxed -mt-2">
        {subtitle}
      </p>
    </div>
  );
}
