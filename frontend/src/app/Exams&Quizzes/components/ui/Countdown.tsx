interface CountdownProps {
    hours: number;
    minutes: number;
    seconds: number;
    className?: string;
}

export default function Countdown({ hours, minutes, seconds, className = '' }: CountdownProps) {
    const formatTime = (time: number) => time.toString().padStart(2, '0');

    return (
        <div className={`text-xl sm:text-2xl font-bold text-primary-action ${className}`}>
            {formatTime(hours)}h : {formatTime(minutes)}m : {formatTime(seconds)}s
        </div>
    );
}