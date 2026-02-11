
import TimelineItem from "./TimelineItem";
import { BehaviourNote } from "./type";


interface BehaviourTimelineProps {
  notes: BehaviourNote[];
}

const BehaviourTimeline: React.FC<BehaviourTimelineProps> = ({ notes }) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
      <h3 className="text-slate-900 dark:text-slate-50 text-base font-medium leading-normal">
        Behaviour Timeline
      </h3>
      <div className="flex flex-col">
        {notes.map((note, index) => (
          <TimelineItem
            key={note.id}
            note={note}
            isLast={index === notes.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default BehaviourTimeline;