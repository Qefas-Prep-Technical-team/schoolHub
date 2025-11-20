import LogoTitle from "./components/LogoTitle";
import VerificationCard from "./components/VerificationCard";



export default function VerifyPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LogoTitle />
        <VerificationCard />
      </div>
    </div>
  );
}
