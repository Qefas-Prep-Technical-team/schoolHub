import ButtonGroup from "./ButtonGroup";
import ImageGrid from "./page2/ImageGrid";
import PageHeading from "./page2/PageHeading";


export default function Step2() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      {/* <ConfettiEffect /> 🎉 Cheer animation on load */}
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* <ProgressBar step={3} totalSteps={5} percentage={60} /> */}
            <PageHeading
              title="Tell Us Who You Are."
              subtitle="We’ll personalize your dashboard experience."
            />
            <ImageGrid />
            <ButtonGroup />
          </div>
        </div>
      </div>
    </div>
  );
}
