"use client"
import Box from '@mui/material/Box';
import React, { FC } from 'react';
import { Switch } from '@mui/material';
import PricingTab from './PricingTab';
import { useBillingStore } from '@/utils/PricingPage';
import { useTheme } from 'next-themes';


const PricingCard: FC = () => {
    const { billingType, setBillingType } = useBillingStore();
    const { theme } = useTheme();
    return (
        <Box className="container mx-auto md:p6 ">
            <div className="mt-12 flex items-center justify-center gap-2">
                <span className="text-base font-medium text-[var(--text-secondary)]">Monthly</span>
                <Switch
                    className={`peer ${theme === "dark" ? "bg-gray-500" : "bg-black-100"}rounded-full p-0`}
                    onChange={() => billingType === 'monthly' ? setBillingType('yearly') : setBillingType('monthly')}
                    checked={billingType === 'yearly'}
                    color="primary"

                />
                <span className="text-base font-medium text-[var(--text-secondary)]">Yearly</span>
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">Save 20%</span>
            </div>
            <PricingTab billingType={billingType} setBillingType={setBillingType} />
        </Box>
    );
};

export default PricingCard;