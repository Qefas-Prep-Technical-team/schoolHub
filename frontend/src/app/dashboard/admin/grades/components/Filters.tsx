/* eslint-disable @typescript-eslint/no-explicit-any */
interface FiltersProps {
    filters: {
        class: string;
        term: string;
        subject: string;
    };
    onFilterChange: (filters: any) => void;
}

export default function Filters({ filters, onFilterChange }: FiltersProps) {
    const handleFilterChange = (key: string, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <label htmlFor="class-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Class
                </label>
                <select
                    id="class-filter"
                    value={filters.class}
                    onChange={(e) => handleFilterChange('class', e.target.value)}
                    className="h-9 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1C1C2D] text-sm focus:ring-primary focus:border-primary"
                >
                    <option>All Classes</option>
                    <option>Class 7A</option>
                    <option>Class 7B</option>
                    <option>Class 8A</option>
                </select>
            </div>

            <div className="flex items-center gap-2">
                <label htmlFor="term-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Term
                </label>
                <select
                    id="term-filter"
                    value={filters.term}
                    onChange={(e) => handleFilterChange('term', e.target.value)}
                    className="h-9 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1C1C2D] text-sm focus:ring-primary focus:border-primary"
                >
                    <option>Fall 2024</option>
                    <option>Spring 2024</option>
                    <option>Fall 2023</option>
                </select>
            </div>

            <div className="flex items-center gap-2">
                <label htmlFor="subject-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subject
                </label>
                <select
                    id="subject-filter"
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                    className="h-9 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1C1C2D] text-sm focus:ring-primary focus:border-primary"
                >
                    <option>All Subjects</option>
                    <option>Mathematics</option>
                    <option>History</option>
                    <option>Science</option>
                </select>
            </div>
        </div>
    );
}