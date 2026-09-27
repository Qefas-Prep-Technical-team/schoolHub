import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PricingTab } from '../Types/Pricing';

interface PlanComparisonTableProps {
    plans?: PricingTab[];
}

const PlanComparisonTable: React.FC<PlanComparisonTableProps> = ({ plans = [] }) => {
    // Dynamically extract all unique features across all plans
    const allFeatures = Array.from(new Set(plans.flatMap(plan => plan.features || [])));

    const renderCell = (hasFeature: boolean) => {
        if (hasFeature) {
            return (
                <div className="w-5 h-5 rounded-full bg-[#111827] dark:bg-white flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-3 h-3 text-white dark:text-[#111827]" />
                </div>
            );
        }
        return <span className="text-slate-300 dark:text-slate-600 font-bold">-</span>;
    };

    if (plans.length === 0) return null;

    return (
        <div className="w-[98%] max-w-none mx-auto mt-20 mb-32 bg-white dark:bg-slate-900 rounded-3xl p-2 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr>
                            <th className="w-2/5 p-4 bg-[#111827] dark:bg-slate-800 rounded-l-2xl"></th>
                            {plans.map((plan, index) => (
                                <th 
                                    key={plan.type} 
                                    className={`p-4 bg-[#111827] dark:bg-slate-800 text-center text-xs font-semibold text-white ${index === plans.length - 1 ? 'rounded-r-2xl' : ''}`}
                                >
                                    {plan.name || plan.type}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {allFeatures.map((feature, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="p-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                                    {feature}
                                </td>
                                {plans.map(plan => {
                                    const hasFeature = plan.features?.includes(feature) ?? false;
                                    return (
                                        <td key={plan.type} className="p-4 text-center">
                                            {renderCell(hasFeature)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PlanComparisonTable;
