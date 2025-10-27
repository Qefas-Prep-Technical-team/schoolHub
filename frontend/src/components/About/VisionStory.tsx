import React, { FC } from 'react';

const VisionStory: FC = () => {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl font-bold leading-tight tracking-tighter sm:text-4xl">Our Vision</h2>
            <p className="mt-4 text-lg text-[var(--text-secondary)]">
              SchoolHub envisions a future where every school in Africa, regardless of location or resources, has access to cutting-edge technology that enhances educational
              outcomes. We believe that by providing a comprehensive, user-friendly platform, we can bridge the digital divide and empower educators to focus on what matters
              most: nurturing the next generation of leaders.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold leading-tight tracking-tighter sm:text-4xl">Our Story</h2>
            <p className="mt-4 text-lg text-[var(--text-secondary)]">
              SchoolHub began with a simple observation: many schools in Africa lacked the digital tools necessary to manage their operations effectively. Founded by a team of
              passionate educators and technologists, SchoolHub was created to address this gap. We started by listening to the needs of schools, understanding their
              challenges, and developing a platform that is both powerful and easy to use. Today, SchoolHub is a trusted partner for schools across the continent, helping them
              streamline their processes, improve communication, and ultimately, provide a better educational experience for their students.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionStory;