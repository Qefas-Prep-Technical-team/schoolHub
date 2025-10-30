"use client";

import FeatureCard from "./FeatureCard";
import SectionHeader from "./SectionHeader";

import ButtonGroup from "../ButtonGroup";

const features = [
  {
    icon: "calendar_month",
    title: "Smart Timetable Management",
    description: "Easily create and manage class schedules.",
  },
  {
    icon: "play_circle",
    title: "Video Lessons & Resources",
    description: "Access a rich library of educational content.",
  },
  {
    icon: "bar_chart",
    title: "Student Progress Insights",
    description: "Track and analyze student performance data.",
  },
  {
    icon: "forum",
    title: "Parent–Teacher Communication",
    description: "Facilitate seamless communication.",
  },
];

export default function FeatureSection() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 sm:gap-8">
        <SectionHeader />
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
        {/* <ProgressBar step={4} total={5} /> */}
        <ButtonGroup />
      </div>
    </div>
  );
}
