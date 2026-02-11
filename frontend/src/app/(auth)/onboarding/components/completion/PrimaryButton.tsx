"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';


export default function PrimaryButton() {
  const searchParams = useSearchParams();
  const rawType = searchParams.get("type");

  const userType = rawType?.toLowerCase() === "admin" ? "school-admin" : rawType?.toLowerCase(); // 👈 Convert here
  return (
    <div className="flex justify-center">
      <Link href={`/login/${userType}`} passHref>
        <button className="flex w-full max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark transition-colors">
          <span className="truncate">Go to login</span>
        </button>
      </Link>
    </div>
  );
}
