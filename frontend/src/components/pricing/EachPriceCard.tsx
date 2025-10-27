"use client";
import React, { FC, useEffect } from 'react';
import { PricingTab } from '../Types/Pricing';
import { useBillingStore } from '@/utils/PricingPage';
import AOS from 'aos';
import { usePricingFocusStore } from '@/utils/PricingFocusStore';
import { useTheme } from 'next-themes';

const EachPriceCard: FC<PricingTab> = ({ name, description, pricing, type, trialDays, features, hasTrial, isPopular }) => {
    const {
        focusedCardId,
        setFocusedCardId,
        hoveredCardId,
        setHoveredCardId,
        activeCardIds,
        toggleActiveCardId,
        focusMode,
        setFocusMode
    } = usePricingFocusStore();

    const isActive = activeCardIds.includes(type);
    const isFocused = focusedCardId === type;
    const isHovered = hoveredCardId === type;
    const { theme } = useTheme();
    const { billingType } = useBillingStore();
    useEffect(() => {
        AOS.init();

    }, []);
    return (
        <div className={` cursor-pointer relative flex flex-col rounded-2xl border ${theme === "dark" ? "bg-black " : "bg-white border-gray-300 "} px-5 py-10  md:p-5  shadow-lg ${isActive ? 'border-blue-600' : `${theme === "dark" ? "" : 'border-gray-300'}`}
        ${isFocused ? 'ring-2 ring-blue-400' : ''}
        ${isHovered ? `${theme === "dark" ? "bg-back-500" : "bg-gray-100"} scale-110 z-10` : ''} transition-all duration-300 ease-in-out`}
            onMouseEnter={() => {
                setHoveredCardId(type);
                setFocusMode('hover');
            }}
            onMouseLeave={() => {
                setHoveredCardId(null);
                setFocusMode('none');
            }}
            onClick={() => {
                setFocusedCardId(type);
                toggleActiveCardId(type);
                setFocusMode('click');
            }}
        >
            <div className="flex-grow">
                {isPopular && <div data-aos="zoom-in" className="absolute top-0 -translate-y-1/2 rounded-full bg-blue-400 px-4 py-1 text-sm font-semibold text-white">Most Popular</div>}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl md:tex-txl font-bold ">{type}</h2>
                    {hasTrial && <span className="inline-flex items-center rounded-full bg-gray-200 px-4  text-sm font-semibold text-blue-500">Free {trialDays}-day trial</span>}
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-xl md:text-2xl font-extrabold tracking-tight text-black-500">₦{billingType == "monthly" ? pricing?.monthly : pricing?.yearly}</span>
                    <span className="text-xl md:text-2xl font-semibold text-gray-500">/{billingType == "monthly" ? "monthly" : "yearly"}</span>
                </div>
                <p className="mt-2 text-base text-[var(--text-secondary)]">{description}</p>
                <ul className="mt-8 space-y-4">
                    {features?.map((feature) => (<li key={feature} className="flex items-center gap-3">
                        <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 12.75l6 6 9-13.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        <span className="text-base text-[var(--text-primary)]">{feature}</span>
                    </li>))}

                </ul>
            </div>
            <a className="mt-8 block w-full rounded-md bg-gray-200 px-6 py-3 text-center text-base font-semibold text-blue-500 hover:bg-blue-200 transition-colors" href="#">Start Free Trial</a>
        </div>
    );
};

export default EachPriceCard;