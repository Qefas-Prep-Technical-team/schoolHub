'use client';

import ButtonGroup from "./ButtonGroup";
import HeaderImage from "./page1/HeaderImage";
import HeadlineText from "./page1/HeadlineText";

export default function Step1() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* <CheerConfetti /> 🎉 Play animation when page loads */}

      <div className="flex flex-1 justify-center items-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-[#1F2937] rounded-xl shadow-lg p-6 sm:p-8 flex flex-col gap-6">
            {/* <ProgressBar step={2} totalSteps={5} /> */}

            <HeaderImage
              imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBOwMZwFu2GsRa6idc4kN3hkB3pAjN679u2VYq-DuX1s6LycZSB2wQCfcjwvz7xREOeg3ZhXA7E3heiaB2Cc1u17yQO6_GgZIznhQ_XfO-dw7I0EPY8vZyjteJaejJQNaWGw5tnbls93oZ4YEdzhkSf2u2d7LlJidssNwVPikSnGeC0BitxUi6cynb-NaZ92y2UDKnd1MV9TqMYgKRSU8a2Zylc-9CDkPC4qMYEV2bejYLEtFeyHpHbMj6BySgOZNqBOWVgLYtBUJY"
              altText="Illustration of a teacher and student using digital learning tools."
            />

            <HeadlineText

              title="A Smarter Way to Learn and Manage Education."
              subtitle="Track lessons, manage progress, and stay connected — all in one hub."
            />

            <ButtonGroup
              // onBack={() => console.log('Back pressed')}
              // onNext={() => console.log('Next pressed')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
