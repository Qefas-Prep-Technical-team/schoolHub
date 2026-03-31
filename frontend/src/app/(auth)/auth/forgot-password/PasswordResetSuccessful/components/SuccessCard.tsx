import SuccessIcon from "./SuccessIcon";
import SuccessMessage from "./SuccessMessage";
import RedirectNotice from "./RedirectNotice";

export default function SuccessCard() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 sm:p-10">
      <SuccessIcon />
      <SuccessMessage />

      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex w-full justify-center">
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-primary text-base font-bold text-white shadow-sm transition-colors hover:bg-primary/90">
            <span className="truncate">Go to Login</span>
          </button>
        </div>
        <RedirectNotice />
      </div>
    </div>
  );
}
