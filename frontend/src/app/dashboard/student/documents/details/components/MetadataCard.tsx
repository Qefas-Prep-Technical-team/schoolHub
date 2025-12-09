import { Card, CardContent } from './ui/Card';

interface MetadataItem {
  label: string;
  value: string | React.ReactNode;
}

interface MetadataCardProps {
  items: MetadataItem[];
  title?: string;
  className?: string;
}

export default function MetadataCard({ 
  items, 
  title, 
  className = '' 
}: MetadataCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        {title && (
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            {title}
          </h3>
        )}
        
        <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-5">
          {items.map((item, index) => (
            <div key={index} className="contents">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.label}
              </p>
              <p className="text-sm text-gray-900 dark:text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}