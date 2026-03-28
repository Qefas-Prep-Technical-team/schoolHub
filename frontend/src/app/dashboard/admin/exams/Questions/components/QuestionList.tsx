import QuestionListItem from "./QuestionListItem";
import { QuestionListItemT } from "./type";




const questionList: QuestionListItemT[] = [
    { id: 1, title: 'Question 1', type: 'Multiple Choice', marks: 10, active: true },
    { id: 2, title: 'Question 2', type: 'True/False', marks: 5, active: false },
    { id: 3, title: 'Question 3', type: 'Essay', marks: 15, active: false },
];

const QuestionList: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Question List
            </h3>
            <ul className="space-y-3">
                {questionList.map((question) => (
                    <QuestionListItem key={question.id} question={question} />
                ))}
            </ul>
        </div>
    );
};

export default QuestionList;