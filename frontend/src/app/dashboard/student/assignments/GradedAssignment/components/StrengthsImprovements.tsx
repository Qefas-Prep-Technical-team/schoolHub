import { Check, ArrowRight, ThumbsUp, Lightbulb } from 'lucide-react';

interface ListItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  items: ListItem[];
  className?: string;
}

function Section({ title, icon, items, className }: SectionProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 ${className}`}>
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#333333] dark:text-white">
        {icon}
        {title}
      </h3>
      <ul className="space-y-3 text-gray-600 dark:text-gray-300">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            {item.icon}
            <div>
              <strong className="font-semibold text-[#333333] dark:text-gray-100">
                {item.title}:
              </strong>{' '}
              {item.description}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StrengthsImprovements() {
  const strengths: ListItem[] = [
    {
      icon: <Check className="mt-0.5 h-5 w-5 text-[#7ED321]" />,
      title: 'Strong Thesis',
      description: 'Clear and arguable central claim.',
    },
    {
      icon: <Check className="mt-0.5 h-5 w-5 text-[#7ED321]" />,
      title: 'Evidence Integration',
      description: 'Quotes were well-chosen and supported arguments effectively.',
    },
    {
      icon: <Check className="mt-0.5 h-5 w-5 text-[#7ED321]" />,
      title: 'Clarity & Flow',
      description: 'The essay was well-organized and easy to follow.',
    },
  ];

  const improvements: ListItem[] = [
    {
      icon: <ArrowRight className="mt-0.5 h-5 w-5 text-[#F5A623]" />,
      title: 'Conclusion',
      description: 'Could be more robust by exploring broader implications.',
    },
    {
      icon: <ArrowRight className="mt-0.5 h-5 w-5 text-[#F5A623]" />,
      title: 'Citation Formatting',
      description: 'Minor inconsistencies in MLA citation style.',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <Section
        title="Strengths"
        icon={<ThumbsUp className="h-5 w-5 text-[#7ED321]" />}
        items={strengths}
      />
      <Section
        title="Areas for Improvement"
        icon={<Lightbulb className="h-5 w-5 text-[#F5A623]" />}
        items={improvements}
      />
    </div>
  );
}