import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import { examService } from "@/lib/api/services/examService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, Trash2, X, Loader2, Save } from "lucide-react";

export default function ManualAddForm({ 
  paperId, 
  examId,
  onCancel,
  initialData // NEW: For editing
}: { 
  paperId: string;
  examId: string;
  onCancel: () => void;
  initialData?: any;
}) {
  const queryClient = useQueryClient();
  const [type, setType] = useState(initialData?.type || "MULTIPLE_CHOICE");
  const [question, setQuestion] = useState(initialData?.question || "");
  const [marks, setMarks] = useState(initialData?.marks || 1);
  const [correctAnswer, setCorrectAnswer] = useState(initialData?.correctAnswer || "A");
  const [options, setOptions] = useState({
    A: initialData?.optionA || "",
    B: initialData?.optionB || "",
    C: initialData?.optionC || "",
    D: initialData?.optionD || ""
  });
  const [explanation, setExplanation] = useState(initialData?.explanation || "");

  const isEditing = !!initialData;

  const addQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        return examService.updateQuestion(initialData.id, data);
      }
      const response = await apiClient.post(`/exams/${examId}/papers/${paperId}/questions/manual`, {
        questions: [data]
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success(isEditing ? "Question updated successfully!" : "Question added successfully!");
      onCancel(); // Close form
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} question`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (type === "MULTIPLE_CHOICE") {
      if (!options.A.trim() || !options.B.trim()) {
        toast.error("At least two options (A and B) are required");
        return;
      }
    }

    const questionData = {
      type: type === "ESSAY" ? "SHORT_ANSWER" : type,
      question,
      marks,
      correctAnswer,
      explanation,
      ...(type === "MULTIPLE_CHOICE" ? {
        optionA: options.A,
        optionB: options.B,
        optionC: options.C,
        optionD: options.D,
      } : {})
    };

    addQuestionMutation.mutate(questionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <h3 className="text-lg font-bold">{isEditing ? 'Edit Question' : 'New Question'}</h3>
        <Button variant="ghost" size="icon" onClick={onCancel} type="button">
          <X size={20} />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="TRUE_FALSE">True / False</option>
              <option value="SHORT_ANSWER">Short Answer</option>
              <option value="ESSAY">Essay / Theory</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Marks</Label>
            <Input 
              type="number" 
              value={marks} 
              onChange={(e) => setMarks(parseInt(e.target.value) || 1)}
              min={1}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Question Text</Label>
          <Textarea 
            placeholder="Enter the question here..." 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[100px]"
            required
          />
        </div>

        {type === "MULTIPLE_CHOICE" && (
          <div className="space-y-4 pt-2">
            <Label>Options & Correct Answer</Label>
            <div className="grid grid-cols-1 gap-3">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <div key={opt} className="flex gap-3 items-center">
                  <div 
                    onClick={() => setCorrectAnswer(opt)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all ${
                      correctAnswer === opt 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "bg-gray-50 border-gray-200 text-gray-400 hover:border-emerald-200"
                    }`}
                  >
                    {correctAnswer === opt ? <Check size={18} /> : opt}
                  </div>
                  <Input 
                    placeholder={`Option ${opt}`} 
                    value={(options as any)[opt]}
                    onChange={(e) => setOptions({...options, [opt]: e.target.value})}
                    className={correctAnswer === opt ? "border-emerald-200 ring-emerald-100" : ""}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {type === "TRUE_FALSE" && (
           <div className="space-y-3 pt-2">
             <Label>Correct Answer</Label>
             <div className="flex gap-4">
               {['TRUE', 'FALSE'].map((val) => (
                 <button
                   key={val}
                   type="button"
                   onClick={() => setCorrectAnswer(val)}
                   className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${
                     correctAnswer === val 
                       ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" 
                       : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                   }`}
                 >
                   {val}
                 </button>
               ))}
             </div>
           </div>
        )}

        {(type === "SHORT_ANSWER" || type === "ESSAY") && (
           <div className="space-y-2">
             <Label>Model Answer / Key</Label>
             <Textarea 
               placeholder="Enter the correct answer or key points..." 
               value={correctAnswer}
               onChange={(e) => setCorrectAnswer(e.target.value)}
             />
           </div>
        )}

        <div className="space-y-2 pt-2 border-t mt-6">
          <Label className="text-gray-500">Explanation (Optional)</Label>
          <Textarea 
            placeholder="Explain why this answer is correct..." 
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button variant="outline" type="button" onClick={onCancel} className="rounded-xl">
          Cancel
        </Button>
        <Button disabled={addQuestionMutation.isPending} className="rounded-xl gap-2 min-w-[140px]">
          {addQuestionMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {isEditing ? 'Saving...' : 'Adding...'}
            </>
          ) : (
            <>
              {isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isEditing ? 'Update Question' : 'Save Question'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
