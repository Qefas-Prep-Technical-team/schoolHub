import { CalendarPlus as CalendarEdit } from 'lucide-react';

interface QuickContactProps {
    title?: string;
    description?: string;
    buttonText?: string;
    onButtonClick?: () => void;
}

export default function QuickContact({
    title = "Need to report an absence?",
    description = "Quickly notify the school office if Alex will be absent.",
    buttonText = "Submit Absence Note",
    onButtonClick = () => console.log('Report absence'),
}: QuickContactProps) {
    return (
        <div className="bg-orange-500 rounded-[20px] p-6 shadow-sm border border-orange-600 text-white">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-base font-semibold mb-1">{title}</h3>
                    <p className="text-orange-50 text-xs mb-4">{description}</p>
                </div>
                <CalendarEdit className="h-8 w-8 opacity-50" />
            </div>

            <button
                onClick={onButtonClick}
                className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
            >
                {buttonText}
            </button>
        </div>
    );
}
