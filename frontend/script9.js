const fs = require('fs');
const file = 'c:\\\\Users\\\\HP\\\\Documents\\\\GitHub\\\\Qefas Project\\\\schoolHub\\\\frontend\\\\src\\\\app\\\\dashboard\\\\student\\\\grades\\\\page.tsx';
let code = fs.readFileSync(file, 'utf8');

// The backend returns an array of groups (session/term). We want to extract ALL subjectResults.
// Old logic:
//   const filteredFinalResults = useMemo(() => {
//     let filtered = finalResults;
//     if (selectedSession !== 'ALL') {
//       filtered = filtered.filter((r: any) => r.sessionId === selectedSession);
//     }
//     if (selectedTerm !== 'ALL') {
//       filtered = filtered.filter((r: any) => r.term === selectedTerm);
//     }
//     return filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
//   }, [finalResults, selectedTerm, selectedSession]);

const oldFilterRegex = /const filteredFinalResults = useMemo\(\(\) => \{[\s\S]*?return filtered\.sort.*?;\s*\}, \[finalResults, selectedTerm, selectedSession\]\);/m;

const newFilterLogic = `const filteredFinalResults = useMemo(() => {
    // backend returns an array of groups: { sessionId, term, subjectResults: [] }
    // Flatten them out
    let allSubjects: any[] = [];
    (finalResults || []).forEach((group: any) => {
      if (group && group.subjectResults) {
        allSubjects.push(...group.subjectResults);
      }
    });

    let filtered = allSubjects;
    if (selectedSession !== 'ALL') {
      filtered = filtered.filter((r: any) => r.sessionId === selectedSession);
    }
    if (selectedTerm !== 'ALL') {
      filtered = filtered.filter((r: any) => r.term === selectedTerm);
    }
    return filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [finalResults, selectedTerm, selectedSession]);`;

code = code.replace(oldFilterRegex, newFilterLogic);

// Now update the table body for the Final Result Grades tab
// Find the map function inside the tbody
const oldMapRegex = /filteredFinalResults\.map\(\(result: any, index: number\) => \{[\s\S]*?const percent = .*?;[\s\S]*?let grade = "C";[\s\S]*?return \([\s\S]*?<\/tr>[\s\S]*?\);[\s\S]*?\}\)/m;

const newMapLogic = `filteredFinalResults.map((result: any, index: number) => {
                        const scoreSources = result.scoreSources || {};
                        const behavior = scoreSources.behavior || {};
                        
                        const isRevealed = result.scoresRevealed;
                        
                        let totalScore: number | string = '-';
                        let percent: number | string = '-';
                        let grade = "-";
                        let color = "text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400"; 
                        
                        if (isRevealed) {
                          totalScore = (result.assignmentScore || 0) + (result.quizScore || 0) + (result.caScore || 0) + (result.examScore || 0);
                          percent = result.classSubjectResult?.examMax ? Math.round((totalScore / 100) * 100) : totalScore;
                          
                          if (percent >= 75) { grade = "A"; color = "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400"; }
                          else if (percent >= 65) { grade = "B"; color = "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400"; }
                          else if (percent >= 50) { grade = "C"; color = "text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400"; }
                          else { grade = "F"; color = "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400"; }
                        }

                        return (
                          <tr key={result.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                            <td className="px-6 py-5 text-sm font-semibold text-slate-400">
                              <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">{index + 1}</span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="font-bold text-slate-800 dark:text-white text-base line-clamp-1">{result.subject?.name || 'Unknown'}</div>
                              <div className="text-xs font-medium text-slate-400 mt-0.5">{result.subject?.code}</div>
                            </td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-300">
                              {result.class?.name || 'Unknown'}
                            </td>
                            <td className="px-6 py-5">
                              <div className="font-semibold text-slate-700 dark:text-slate-200">{result.term} TERM</div>
                              <div className="text-xs text-slate-400">{result.session?.name}</div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm mb-1", color)}>
                                  {grade}
                                </span>
                                {isRevealed ? (
                                  <span className="font-bold text-slate-800 dark:text-white">{totalScore}%</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1">Pending</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-xs text-slate-500 space-y-1">
                              <div>Politeness: <span className="font-semibold text-slate-700 dark:text-slate-300">{isRevealed ? (behavior.politeness || '-') : '-'}</span>/5</div>
                              <div>Punctuality: <span className="font-semibold text-slate-700 dark:text-slate-300">{isRevealed ? (behavior.punctuality || '-') : '-'}</span>/5</div>
                              <div>Handwriting: <span className="font-semibold text-slate-700 dark:text-slate-300">{isRevealed ? (behavior.handwriting || '-') : '-'}</span>/5</div>
                            </td>
                          </tr>
                        );
                      })`;

code = code.replace(oldMapRegex, newMapLogic);

fs.writeFileSync(file, code);
console.log("Updated page.tsx with flattened structure and reveal masking.");
