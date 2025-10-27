// fetch fetch pricing

import { useQuery } from "@tanstack/react-query";
import { PricingData } from "../Types/Pricing";
import { FrequentlyAskedQuestions } from "../Types/Home";

const fetchPricing = async (): Promise<PricingData[]> => {
    const res = await fetch("/json/PricingPlans.json");
    return res.json();
};
export const useFetchPricing = () => {
    const { data, isLoading, error } = useQuery<PricingData[]>({
        queryKey: ["fetchPricing"],
        queryFn: fetchPricing,
    })
    return { data, isLoading, error };
}
// fetch fetch pricing faq



const fetchPricingFAQ = async (): Promise<FrequentlyAskedQuestions[]> => {
    const res = await fetch("/json/PricingFAQ.json");
    return res.json();
};
export const useFetchPricingFAQ = () => {
    const { data, isLoading, error } = useQuery<FrequentlyAskedQuestions[]>({
        queryKey: ["fetchPricingFAQ"],
        queryFn: fetchPricingFAQ,
    })
    return { data, isLoading, error };
}