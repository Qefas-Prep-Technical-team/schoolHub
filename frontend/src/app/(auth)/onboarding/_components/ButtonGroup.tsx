import { useSwiper } from 'swiper/react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

interface Props {
  nextLabel?: string;
  isLastStep?: boolean;
}

export default function ButtonGroup({ nextLabel = "Continue", isLastStep = false }: Props) {
  const swiper = useSwiper();
  const router = useRouter();
  const { userType } = useAuthStore();

  const handleNext = () => {
    if (isLastStep) {
      // 1. You would hit your API here to set onboardingComplete = true
      // 2. Then redirect
      router.push(`/dashboard/${userType?.toLowerCase()}`);
    } else {
      swiper.slideNext();
    }
  };

  return (
    <div className="flex items-center gap-4 w-full">
      {!isLastStep && (
        <button 
          onClick={() => swiper.slidePrev()}
          className="px-6 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Back
        </button>
      )}
      <button 
        onClick={handleNext}
        className="flex-1 bg-slate-900 dark:bg-white dark:text-black text-white py-4 px-8 rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
      >
        {nextLabel}
      </button>
    </div>
  );
}