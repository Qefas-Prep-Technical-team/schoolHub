'use client';

import Input from "./ui/Input";
import Toggle from "./ui/Toggle";



interface SettingsProps {
    allowLateSubmissions: boolean;
    onAllowLateSubmissionsChange: (allow: boolean) => void;
    maxScore: number;
    onMaxScoreChange: (score: number) => void;
}

export default function Settings({
    allowLateSubmissions,
    onAllowLateSubmissionsChange,
    maxScore,
    onMaxScoreChange
}: SettingsProps) {

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-xl border border-[#E4E4E7] dark:border-[#2D2D2F]">
            <h2 className="text-[#0e121b] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-6 pt-5 pb-3 border-b border-[#E4E4E7] dark:border-[#2D2D2F]">
                Settings
            </h2>

            <div className="p-6 space-y-6">
                <Toggle
                    label="Allow late submissions"
                    description="Students can submit after the due date."
                    checked={allowLateSubmissions}
                    onChange={(e) => onAllowLateSubmissionsChange(e.target.checked)}
                />

                <div className="w-full md:w-1/2">
                    <Input
                        label="Maximum Score"
                        type="number"
                        min="1"
                        max="1000"
                        placeholder="e.g., 100"
                        value={maxScore.toString()}
                        onChange={(e) => onMaxScoreChange(parseInt(e.target.value) || 0)}
                    />
                </div>
            </div>
        </div>
    );
}
