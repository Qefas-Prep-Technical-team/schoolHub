interface PageHeadingProps {
  title: string;
  subtitle: string;
}

export default function PageHeading({ title, subtitle }: PageHeadingProps) {
  return (
    <div className="flex flex-wrap justify-between gap-3 p-4 text-center">
      <div className="flex w-full flex-col items-center gap-3">
        <p className="text-[#0e121b] dark:text-white text-4xl font-black leading-tight">
          {title}
        </p>
        <p className="text-[#4d6599] dark:text-gray-400 text-base font-normal">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
