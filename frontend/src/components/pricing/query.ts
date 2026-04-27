// fetch fetch pricing

import { useQuery } from "@tanstack/react-query";
import { PricingData } from "../Types/Pricing";
import { FrequentlyAskedQuestions } from "../Types/Home";
import { paymentService } from "@/lib/api/services/paymentService";

export const useFetchPricing = () => {
    const { data, isLoading, error } = useQuery<PricingData[]>({
        queryKey: ["fetchPricing"],
        queryFn: paymentService.getPlans,
    })
    return { data, isLoading, error };
}

// fetch fetch pricing faq
export const useFetchPricingFAQ = () => {
    const { data, isLoading, error } = useQuery<FrequentlyAskedQuestions[]>({
        queryKey: ["fetchPricingFAQ"],
        queryFn: paymentService.getFAQ,
    })
    return { data, isLoading, error };
}
