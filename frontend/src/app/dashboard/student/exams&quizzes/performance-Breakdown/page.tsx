'use client';

import Breadcrumbs from './components/Breadcrumbs';
import PageHeader from './components/PageHeader';
import SummaryCard from './components/SummaryCard';
import MetricsGrid from './components/MetricsGrid';
import ScoreDistribution from './components/ScoreDistribution';
import TopicPerformance from './components/TopicPerformance';
import FeedbackCard from './components/FeedbackCard';
import {
    breadcrumbs,
    assessmentInfo,
    metrics,
    topicPerformances,
    scoreDistribution,
    feedback,
} from './components/data';

export default function Home() {
    const handleReviewQuestions = () => {
        console.log('Reviewing questions...');
        // Navigate to questions review page or open modal
    };

    return (
        <div className="relative flex min-h-screen w-full">
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Breadcrumbs */}
                    <Breadcrumbs items={breadcrumbs} />

                    {/* Page Header */}
                    <PageHeader
                        assessment={assessmentInfo}
                        onReviewQuestions={handleReviewQuestions}
                    />

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Summary Card */}
                            <SummaryCard assessment={assessmentInfo} />

                            {/* Metrics Grid */}
                            <MetricsGrid metrics={metrics} />

                            {/* Score Distribution */}
                            <ScoreDistribution scores={scoreDistribution} />
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Topic Performance */}
                            <TopicPerformance topics={topicPerformances} />

                            {/* Feedback Card */}
                            <FeedbackCard feedback={feedback} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}