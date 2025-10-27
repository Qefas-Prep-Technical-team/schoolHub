import { useQuery } from "@tanstack/react-query";
import { WhatUsersSay, InAction, FrequentlyAskedQuestions } from "../Types/Home";

const fetchInAction = async (): Promise<InAction[]> => {
    const res = await fetch("/json/InAction.json");
    return res.json();
};

export const useFetchInAction = () => {
    const { data, isLoading, error } = useQuery<InAction[]>({
        queryKey: ["FetchInAction"],
        queryFn: fetchInAction,
    })
    return { data, isLoading, error };
}
// what users say 

const fetchWhatUsersSay = async (): Promise<WhatUsersSay[]> => {
    const res = await fetch("/json/WhatUsersSay.json");
    return res.json();
};
export const useFetchWhatUsersSay = () => {
    const { data, isLoading, error } = useQuery<WhatUsersSay[]>({
        queryKey: ["fetchWhatUsersSay"],
        queryFn: fetchWhatUsersSay,
    })
    return { data, isLoading, error };
}

// fetch frequently asked question

const fetchFrequentlyAsked = async (): Promise<FrequentlyAskedQuestions[]> => {
    const res = await fetch("/json/FrequentlyAsked.json");
    return res.json();
};
export const useFetchFrequentlyAsked = () => {
    const { data, isLoading, error } = useQuery<FrequentlyAskedQuestions[]>({
        queryKey: ["fetchFrequentlyAsked"],
        queryFn: fetchFrequentlyAsked,
    })
    return { data, isLoading, error };
}