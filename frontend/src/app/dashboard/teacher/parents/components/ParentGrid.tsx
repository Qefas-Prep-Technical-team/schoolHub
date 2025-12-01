
import ParentCard from "./ParentCard";
import { ParentT } from "./types";


interface ParentGridProps {
    parents: ParentT[];
}

const ParentGrid: React.FC<ParentGridProps> = ({ parents }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {parents.map((parent) => (
                <ParentCard key={parent.id} parent={parent} />
            ))}
        </div>
    );
};

export default ParentGrid;