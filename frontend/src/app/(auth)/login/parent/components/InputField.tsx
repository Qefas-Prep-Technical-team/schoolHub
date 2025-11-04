interface InputFieldProps {
    label: string;
    icon: string;
    type: string;
    placeholder: string;
}

export default function InputField({ label, icon, type, placeholder }: InputFieldProps) {
    return (
        <label className="flex flex-col min-w-40 flex-1">
            <p className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">{label}</p>
            <div className="flex w-full items-stretch rounded-lg">
                <div className="flex items-center justify-center pl-4 border border-input-border-light dark:border-input-border-dark bg-input-light dark:bg-input-dark rounded-l-lg border-r-0 text-gray-400 dark:text-placeholder-dark">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
                </div>
                <input
                    type={type}
                    placeholder={placeholder}
                    className="flex w-full h-12 p-3 border border-input-border-light dark:border-input-border-dark bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary/50 rounded-r-lg border-l-0 text-base"
                />
            </div>
        </label>
    );
}
