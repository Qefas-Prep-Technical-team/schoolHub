import CheerAnimation from "../_components/CheerAnimation";
import HeadlineText from "../_components/HeadlineText";
import Lottie from "lottie-react";
import Success from "../../../../lotties/Success.json";



export default function Step1() {
  return (
    <CheerAnimation>
      <div className="w-full min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 shadow-xl backdrop-blur">
            {/* Soft background accents */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/20" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/20" />

            <div className="p-10 sm:p-12 text-center">
              {/* Lottie */}
              <div className="mx-auto mb-6 w-40 sm:w-44">
                <Lottie
                  animationData={Success}
                  loop={false}
                  autoplay
                />
              </div>

              <HeadlineText
                title="Account Verified!"
                subtitle="Your profile is ready. Let’s customize your experience."
              />

              {/* small helper text instead of button */}
              <p className="mt-6 text-sm text-slate-500 dark:text-zinc-400">
                Redirecting you to setup…
              </p>

              {/* subtle loading bar */}
              <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-emerald-500/80" />
              </div>
            </div>
          </div>

          {/* optional footnote */}
          <p className="mt-4 text-center text-xs text-slate-400 dark:text-zinc-500">
            If nothing happens, refresh the page.
          </p>
        </div>
      </div>
    </CheerAnimation>
  );
}
