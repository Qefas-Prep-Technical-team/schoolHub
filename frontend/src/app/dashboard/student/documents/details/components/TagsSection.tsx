'use client';

import { Card, CardContent } from './ui/Card';
import { Tag } from './types';

interface TagsSectionProps {
  tags: Tag[];
  onTagClick?: (tagId: string) => void;
}

const tagColors = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
  pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200',
};

export default function TagsSection({ tags, onTagClick }: TagsSectionProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Tags
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onTagClick?.(tag.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors hover:opacity-80 ${
                tagColors[tag.color]
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}