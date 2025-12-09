import { Card, CardContent } from './ui/Card';
import { RelatedMaterial } from './types';
import Link from 'next/link';
import {FileSliders as FileSlides, FileQuestion, ChevronRight } from 'lucide-react';

interface RelatedMaterialsProps {
  materials: RelatedMaterial[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  slideshow: FileSlides,
  quiz: FileQuestion,
};

export default function RelatedMaterials({ materials }: RelatedMaterialsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Related Materials
        </h3>
        
        <div className="flex flex-col gap-3">
          {materials.map((material) => {
            const Icon = iconMap[material.icon];
            
            return (
              <Link
                key={material.id}
                href={material.href}
                className="flex items-center justify-between gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 group"
              >
                <div className="flex items-center gap-3">
                  {Icon && (
                    <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                  <p className="text-sm font-medium text-primary group-hover:underline">
                    {material.title}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}