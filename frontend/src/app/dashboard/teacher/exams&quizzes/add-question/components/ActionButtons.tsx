interface ActionButtonsProps {
  onSave: (action: 'save' | 'save-and-another') => void;
}

export default function ActionButtons({ onSave }: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-3 p-4 mt-6 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={() => onSave('save-and-another')}
        className="flex items-center justify-center rounded-lg h-12 px-6 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-base font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
      >
        Save & Add Another
      </button>
      <button
        onClick={() => onSave('save')}
        className="flex items-center justify-center rounded-lg h-12 px-6 bg-primary text-white text-base font-bold hover:bg-primary/90 transition-colors whitespace-nowrap"
      >
        Save Question
      </button>
    </div>
  );
}