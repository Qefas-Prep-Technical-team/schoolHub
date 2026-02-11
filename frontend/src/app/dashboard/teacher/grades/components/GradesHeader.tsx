

interface GradesHeaderProps {
  onAddGrade: () => void;
}

const GradesHeader: React.FC<GradesHeaderProps> = ({ onAddGrade }) => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3 bg-white dark:bg-background-dark sticky top-0 z-10">
      <div className="flex items-center gap-4 text-slate-900 dark:text-slate-100">
        <div className="size-6 text-primary">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
          </svg>
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em]">
          School Platform
        </h2>
      </div>
      <div className="flex flex-1 justify-end items-center gap-4 sm:gap-8">
        <nav className="flex items-center gap-4 sm:gap-9">
          {['Dashboard', 'Classes', 'Students', 'Grades'].map((item) => (
            <a
              key={item}
              href="#"
              className={`text-sm font-medium leading-normal ${
                item === 'Grades'
                  ? 'text-primary font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-bold leading-normal tracking-[0.015em]">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-bold leading-normal tracking-[0.015em]">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDHdQXFaZWwcULd2CKZgF4n0PQyPknFNoc2oonkfcWlWgfZG1SuSx7rJXbLXcbeedDz_hPSstLw1tXf7NhbbSy0W93ahMd8GaIRASupKZ0ztdbx9vLiVkwdyVi-bGP1ejxVhRoyXm6c0gL9N_dfxW2Sfy3g1kJGQuipkp8OG0vSUESVM_NIHfiA-pw9J76osapJLoUwdcNwjR__9CHdijXZoo8L1gOb3vcfP71YzzK99fzpXmU_6xpKff-3k8pTVGvyNS-OoL4rE7Q")'
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default GradesHeader;