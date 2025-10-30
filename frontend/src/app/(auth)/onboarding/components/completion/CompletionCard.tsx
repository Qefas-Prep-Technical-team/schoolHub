"use client";

// import ProgressBar from "./ProgressBar";
import RocketIllustration from "./RocketIllustration";
import CompletionText from "./CompletionText";
import PrimaryButton from "./PrimaryButton";
// import ConfettiEffect from "./ConfettiEffect";

export default function CompletionCard() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* <ConfettiEffect /> */}
      <main className="w-full max-w-lg">
        <div className="flex flex-col rounded-xl bg-card-light dark:bg-card-dark shadow-sm">
          <div className="p-8 sm:p-10 md:p-12">
            {/* <ProgressBar step={5} total={5} /> */}
            <RocketIllustration />
            <CompletionText />
            <PrimaryButton />
          </div>
        </div>
      </main>
    </div>
  );
}
