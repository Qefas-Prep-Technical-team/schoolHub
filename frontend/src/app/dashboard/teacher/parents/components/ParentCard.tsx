
import ActionButton from "./ActionButton";
import { ParentT } from "./types";

interface ParentCardProps {
    parent: ParentT;
}

const ParentCard: React.FC<ParentCardProps> = ({ parent }) => {
    const studentInfo = `${parent.studentName} - ${parent.studentGrade}${parent.studentClass}`;

    return (
        <div className="flex flex-col gap-4 bg-white dark:bg-slate-900/70 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-4">
                <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14"
                    style={{ backgroundImage: `url("${parent.avatarUrl}")` }}
                />
                <div className="flex flex-col justify-center">
                    <p className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-normal line-clamp-1">
                        {parent.name}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal line-clamp-2">
                        Parent of {studentInfo}
                    </p>
                </div>
            </div>

            <div className="flex flex-1 gap-3 flex-wrap justify-end items-end pt-2">
                <ActionButton
                    variant="primary"
                    icon="mail"
                    label="Message"
                    onClick={() => console.log(`Message ${parent.name}`)}
                />
                <ActionButton
                    variant="secondary"
                    icon="call"
                    label="Call"
                    onClick={() => console.log(`Call ${parent.name}`)}
                />
            </div>
        </div>
    );
};

export default ParentCard;