import ToggleSwitch from "./ToggleSwitch";
import Button from "./ui/Button";


interface ActionsPanelProps {
    onDownload: () => void;
    onShareToggle: (isShared: boolean) => void;
    isSharedWithParents: boolean;
    isDownloading?: boolean;
}

const ActionsPanel: React.FC<ActionsPanelProps> = ({
    onDownload,
    onShareToggle,
    isSharedWithParents,
    isDownloading = false
}) => {
    return (
        <div className="rounded-xl shadow-sm bg-white dark:bg-background-dark/50 border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-6">
                Actions
            </h2>
            <div className="flex flex-col gap-4">
                <Button
                    variant="primary"
                    icon="download"
                    onClick={onDownload}
                    disabled={isDownloading}
                    fullWidth
                >
                    {isDownloading ? 'Downloading...' : 'Download'}
                </Button>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                    <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                        Share with Parents
                    </label>
                    <ToggleSwitch
                        checked={isSharedWithParents}
                        onChange={onShareToggle}
                    />
                </div>
            </div>
        </div>
    );
};

export default ActionsPanel;