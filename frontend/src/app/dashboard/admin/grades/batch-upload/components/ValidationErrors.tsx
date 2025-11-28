import { AlertCircle } from 'lucide-react';
import Alert from './ui/Alert';

interface ValidationErrorsProps {
    errorCount: number;
    totalRows: number;
    onShowDetails?: () => void;
}

export default function ValidationErrors({
    errorCount,
    totalRows,
    onShowDetails
}: ValidationErrorsProps) {
    if (errorCount === 0) return null;

    return (
        <Alert variant="error">
            <AlertCircle size={20} />
            <p>
                <span className="font-semibold">{errorCount} errors found in {totalRows} rows.</span>{' '}
                Please correct the highlighted issues before processing.
            </p>
        </Alert>
    );
}