import { MailCheck } from "lucide-react";

interface IconCircleProps {
  icon?: string;
}

export default function IconCircle({ icon }: IconCircleProps) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-500/25 border border-white/20 mb-4 mx-auto">
      <MailCheck className="h-10 w-10" />
    </div>
  );
}
