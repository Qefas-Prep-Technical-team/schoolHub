import { Download } from 'lucide-react';
import Button from './ui/Button';

interface TemplateDownloadProps {
    onDownload: () => void;
}

export default function TemplateDownload({ onDownload }: TemplateDownloadProps) {
    return (
        <Button variant="secondary" onClick={onDownload} className="h-12 px-5">
            <Download size={20} />
            <span className="truncate">Download Template</span>
        </Button>
    );
}