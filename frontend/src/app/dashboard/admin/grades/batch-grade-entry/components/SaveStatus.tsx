import { CheckCircle, Loader, AlertCircle } from 'lucide-react';

interface SaveStatusProps {
    status: 'saved' | 'saving' | 'error';
    lastSaved?: Date;
    errorMessage?: string;
}

export default function SaveStatus({ status, lastSaved, errorMessage }: SaveStatusProps) {
    const getStatusConfig = () => {
        switch (status) {
            case 'saved':
                return {
                    icon: CheckCircle,
                    text: 'All changes saved',
                    color: 'text-green-600 dark:text-green-400',
                    iconColor: 'text-green-500'
                };
            case 'saving':
                return {
                    icon: Loader,
                    text: 'Saving changes...',
                    color: 'text-blue-600 dark:text-blue-400',
                    iconColor: 'text-blue-500 animate-spin'
                };
            case 'error':
                return {
                    icon: AlertCircle,
                    text: errorMessage || 'Error saving changes',
                    color: 'text-red-600 dark:text-red-400',
                    iconColor: 'text-red-500'
                };
            default:
                return {
                    icon: Loader,
                    text: 'All changes saved',
                    color: 'text-gray-600 dark:text-gray-400',
                    iconColor: 'text-gray-500'
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div className="flex items-center gap-2 text-sm">
            <Icon size={16} className={config.iconColor} />
            <span className={config.color}>{config.text}</span>
            {lastSaved && status === 'saved' && (
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {lastSaved.toLocaleTimeString()}
                </span>
            )}
        </div>
    );
}