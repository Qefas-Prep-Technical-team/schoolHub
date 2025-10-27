import { useQuery } from "@tanstack/react-query";
import { FeatureFromFeaturesPage } from "../Types/Features";

const fetchFeatuersinFeaturesPage = async (): Promise<FeatureFromFeaturesPage[]> => {
    const res = await fetch("/json/FeaturesPage.json");
    return res.json();
};

export const useFetchFeatuersinFeaturesPage = () => {
    const { data, isLoading, error } = useQuery<FeatureFromFeaturesPage[]>({
        queryKey: ["fetchFeatuersinFeaturesPage"],
        queryFn: fetchFeatuersinFeaturesPage,
    })
    return { data, isLoading, error };
}