'use client';

import Button from "../../components/ui/Button";
import { SubmissionsOverviewT } from "./types";
import ProgressBar from "./ui/ProgressBar";


interface SubmissionsOverviewProps {
    overview: SubmissionsOverviewT
    onGradeSubmissions?: () => void;
    onExportSubmissions?: () => void;
}

export default function SubmissionsOverview({
    overview,
    onGradeSubmissions,
    onExportSubmissions
}: SubmissionsOverviewProps) {
    const percentageGraded = overview.totalStudents > 0
        ? (overview.graded / overview.totalStudents) * 100
        : 0;

    return (
        <div className="bg-white dark:bg-[#191e2b] rounded-xl p-6 sticky top-8">
            <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
                Submissions Overview
            </h2>

            <ProgressBar
                value={overview.graded}
                max={overview.totalStudents}
                showLabels={true}
                label={`${overview.graded} / ${overview.totalStudents} Graded`}
                className="mb-4"
            />

            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span>{overview.submitted} Submitted</span>
                <span>{overview.missing} Missing</span>
            </div>

            {overview.averageScore !== null && (
                <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Average Score</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {overview.averageScore.toFixed(1)} / 100
                        </span>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <Button
                    icon="edit_document"
                    onClick={onGradeSubmissions}
                >
                    Grade Submissions
                </Button>

                <Button
                    variant="secondary"
                    icon="download"
                    onClick={onExportSubmissions}
                >
                    Export Submissions
                </Button>
            </div>
        </div>
    );
}