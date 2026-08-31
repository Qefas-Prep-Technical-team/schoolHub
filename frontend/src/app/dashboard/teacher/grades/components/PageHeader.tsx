import { Plus, Camera, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PageHeaderProps {
  onAddGrade: () => void;
  onOCRClick: () => void;
  onUploadClick: () => void;
  hasOCRAccess: boolean;
  hasCSVAccess: boolean;
  selectedSchoolName: string;
  isPersonal: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  onAddGrade, 
  onOCRClick, 
  onUploadClick, 
  hasOCRAccess, 
  hasCSVAccess,
  selectedSchoolName, 
  isPersonal 
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-slate-900 dark:text-white text-3xl sm:text-5xl font-black leading-tight tracking-tight">
            Academic Grades
          </h1>
          <p className="text-slate-800 dark:text-slate-200 mt-2 font-bold text-sm bg-primary/5 dark:bg-primary/10 px-3 py-1 rounded-full w-fit">
            {isPersonal 
              ? "All Connected Schools"
              : selectedSchoolName}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* AI Vision Scanner */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={onOCRClick}
              variant="outline" 
              className="relative rounded-xl h-12 w-12 p-0 font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 flex items-center justify-center group cursor-pointer"
              title={hasOCRAccess ? 'AI Vision Grade Scanner' : 'Upgrade to unlock AI Vision Scanner'}
            >
              {hasOCRAccess ? (
                <Camera size={18} className="text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
              ) : (
                <>
                  <Camera size={18} className="text-slate-400 dark:text-slate-600" />
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="white">
                      <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
                    </svg>
                  </span>
                </>
              )}
            </Button>
          </motion.div>

          {/* Batch CSV Upload */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={onUploadClick}
              variant="outline" 
              className="relative rounded-xl h-12 w-12 p-0 font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 flex items-center justify-center group cursor-pointer"
              title={hasCSVAccess ? 'Batch Upload' : 'Upgrade to unlock Batch Upload'}
            >
              {hasCSVAccess ? (
                <FileUp size={18} className="text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
              ) : (
                <>
                  <FileUp size={18} className="text-slate-400 dark:text-slate-600" />
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="white">
                      <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
                    </svg>
                  </span>
                </>
              )}
            </Button>
          </motion.div>

          {/* Record New Grade */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-sm transition-all duration-300 font-semibold text-sm"
              onClick={onAddGrade}
            >
              <Plus className="mr-2 h-5 w-5" />
              Record Grade
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
