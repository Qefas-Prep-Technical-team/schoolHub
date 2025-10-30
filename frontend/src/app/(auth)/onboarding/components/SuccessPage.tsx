import CheerAnimation from "./success/CheerAnimation";
import SuccessCard from "./success/SuccessCard";


export default function SuccessPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center  overflow-x-hidden">
      <div className="layout-container flex flex-col items-center justify-center w-full">
        <CheerAnimation>
          <SuccessCard />
        </CheerAnimation>
      </div>
    </div>
  );
}
