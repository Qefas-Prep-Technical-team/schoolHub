'use client';


import PageHeader from './components/PageHeader';
import CountdownCard from './components/CountdownCard';
import AssessmentGroup from './components/AssessmentGroup';
import {
    userInfo,
    featuredAssessment,
    assessmentGroups,
} from './components/data';

export default function Home() {
    return (
        <div className="relative flex min-h-screen w-full flex-col">
            <div className="flex h-full w-full grow">

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-4xl">
                        <PageHeader />
                        <CountdownCard
                            title={featuredAssessment.title}
                            date={featuredAssessment.date}
                            subject={featuredAssessment.subject}
                            image={featuredAssessment.image}
                            initialCountdown={featuredAssessment.countdown}
                        />

                        <div className="flex flex-col gap-8">
                            {assessmentGroups.map((group) => (
                                <AssessmentGroup key={group.id} group={group} />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}