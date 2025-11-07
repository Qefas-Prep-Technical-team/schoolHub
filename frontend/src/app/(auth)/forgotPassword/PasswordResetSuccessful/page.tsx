import SuccessCard from "./components/SuccessCard";

export default function ResetSuccessPage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
          <SuccessCard />
        </div>
      </div>
    </div>
  );
}
