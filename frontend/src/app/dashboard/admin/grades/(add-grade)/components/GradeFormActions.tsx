import Button from "./ui/Button";


interface GradeFormActionsProps {
    onCancel: () => void;
    submitLabel: string;
    isSubmitting?: boolean;
}

export default function GradeFormActions({
    onCancel,
    submitLabel,
    isSubmitting = false
}: GradeFormActionsProps) {
    return (
        <div className="flex flex-wrap items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 rounded-b-xl">
            <Button
                variant="secondary"
                onClick={onCancel}
                type="button"
                className="min-w-[84px] h-11 px-6"
            >
                <span className="truncate">Cancel</span>
            </Button>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[84px] h-11 px-6"
            >
                <span className="truncate">
                    {isSubmitting ? 'Saving...' : submitLabel}
                </span>
            </Button>
        </div>
    );
}