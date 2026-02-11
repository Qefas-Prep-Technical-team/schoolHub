interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export default function CommentsSection({
  value,
  onChange,
  placeholder = 'Type any notes for your teacher here...',
  maxLength = 2000,
}: Props) {
  const remainingChars = maxLength - value.length;
  
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[#0e121b] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
          Comments/Notes
        </h2>
        <span className={`text-sm ${remainingChars < 100 ? 'text-orange-500' : 'text-[#506795] dark:text-white/60'}`}>
          {remainingChars} characters remaining
        </span>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= maxLength) {
            onChange(e.target.value);
          }
        }}
        className="w-full rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-background-dark/50 p-3 text-base text-[#0e121b] dark:text-white/90 placeholder:text-[#506795] dark:placeholder:text-white/50 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-colors resize-none"
        placeholder={placeholder}
        rows={4}
      />
      
      <div className="flex items-center gap-2 text-sm text-[#506795] dark:text-white/60">
        <span className="material-symbols-outlined text-base">info</span>
        <p>Optional: Add any context or questions for your teacher about this submission.</p>
      </div>
    </div>
  );
}