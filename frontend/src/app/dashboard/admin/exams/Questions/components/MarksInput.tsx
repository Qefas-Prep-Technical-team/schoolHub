interface MarksInputProps {
    marks: number;
    onMarksChange: (marks: number) => void;
}

const MarksInput: React.FC<MarksInputProps> = ({ marks, onMarksChange }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="marks">
                Marks
            </label>
            <input
                className="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-primary/50 focus:border-primary"
                id="marks"
                type="number"
                value={marks}
                onChange={(e) => onMarksChange(Number(e.target.value))}
            />
        </div>
    );
};

export default MarksInput;