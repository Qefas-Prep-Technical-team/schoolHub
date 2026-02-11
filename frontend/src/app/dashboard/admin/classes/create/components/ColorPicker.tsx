import React from 'react';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorSelect }) => {
  const colors = [
    { value: 'red', bg: 'bg-red-500' },
    { value: 'orange', bg: 'bg-orange-500' },
    { value: 'amber', bg: 'bg-amber-500' },
    { value: 'green', bg: 'bg-green-500' },
    { value: 'sky', bg: 'bg-sky-500' },
    { value: 'purple', bg: 'bg-purple-500' },
    { value: 'pink', bg: 'bg-pink-500' },
  ];

  return (
    <div className="flex items-center gap-2 h-11">
      {colors.map((color) => (
        <button
          key={color.value}
          onClick={() => onColorSelect(color.value)}
          className={`size-7 rounded-full ${color.bg} ${
            selectedColor === color.value
              ? 'ring-2 ring-offset-2 ring-primary bg-background-light dark:bg-background-dark ring-offset-background-light dark:ring-offset-background-dark'
              : 'border-2 border-slate-300 dark:border-slate-700'
          }`}
          aria-label={`Select ${color.value} color`}
        />
      ))}
    </div>
  );
};

export default ColorPicker;