interface ModalHeaderProps {
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between gap-2 p-4 border-b border-slate-200 dark:border-white/10">
      <div className="flex flex-col gap-1">
        <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
          Upload Document
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
          Share documents with students and parents across your classes.
        </p>
      </div>
      <button 
        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full"
        onClick={onClose}
      >
        <span className="material-symbols-outlined !text-2xl">close</span>
      </button>
    </div>
  );
};

export default ModalHeader;