"use client"

interface Comment {
  type: string
  content: string
  author: string
  authorRole?: string
  signature?: string
}

interface Skill {
  name: string
  score: number
  maxScore: number
}

export default function RemarksSection() {
  const comments: Comment[] = [
    {
      type: "Class Teacher's Comment",
      content: '"Alex is a delight to have in class. He shows great enthusiasm for Mathematics and Art. However, he should dedicate a bit more time to his French vocabulary exercises. Keep up the great work!"',
      author: 'Mrs. H. Wilson',
      signature: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHxSwm4jdovtIp-YCIZ8nPS05x31NNpL60UgC6SdJ8xaY7F-wmVYSiaQCHDHk_ocuyJBHwX3FIIJIklWqtHq64x7NR2ZsfdsVdjYnySAy0Cw4hRrlhbUTKGN6gs2xIxfG8MuBf8f2JtZuHljwXqGDULmD5LjzVutN1wTGzQ2JnFMr4wpx7kX8qaqWaSnYFM8BO4YsW1Mq0xy1Bvl8l5OONZrdiP827M3hh1gGdqP_fIVpp2eRogNCTaWDxUzoifuCKIuqR0vvUeBs'
    },
    {
      type: "Principal's Comment",
      content: '"An excellent result. Alex has maintained a high standard of academic performance this term."',
      author: 'Principal',
      signature: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlQ2N3Uy1Ir56mUGZsV83Ar3MRad8bNzndYhKKemLs6PKuw-1SRS-JVzSK5s8pTxkwIpX1s0P5dfOwePpN6jEtmGEaDhPS7hhIkW6RicxY0iXFtNt2G_yN2wk6hC4xFyIKrzYHTzs5Oy-PwjDdoXnNiThM_a_UJddyJ7A143C6xaJ_LBC3f6VNRWtnjm-T3S6pV2Lp1wpIQeOK8Fu_3EZoIe4BuBjOlUirX20HDeR21yqqyG11S5Bxr-iao6T91myH-rcLk6SHEoQ'
    }
  ]

  const skills: Skill[] = [
    { name: 'Punctuality', score: 5, maxScore: 5 },
    { name: 'Neatness', score: 4, maxScore: 5 },
    { name: 'Politeness', score: 5, maxScore: 5 },
    { name: 'Participation', score: 4, maxScore: 5 }
  ]

  const getWidthPercentage = (score: number, maxScore: number) => {
    return (score / maxScore) * 100
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Remarks Column */}
      <div className="flex flex-col gap-6">
        <h4 className="font-bold text-slate-900 dark:text-white border-l-4 border-primary pl-3">
          Official Remarks
        </h4>
        
        {comments.map((comment, index) => (
          <div
            key={index}
            className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 relative"
          >
            <span className="material-symbols-outlined absolute top-4 right-4 text-slate-200 dark:text-slate-700 text-4xl">
              format_quote
            </span>
            
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
              {comment.type}
            </p>
            
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
              {comment.content}
            </p>
            
            <div className="mt-4 flex items-center gap-2">
              {comment.signature && (
                <div 
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center"
                  style={{ backgroundImage: `url('${comment.signature}')` }}
                />
              )}
              <span className="text-xs font-medium text-slate-500">
                {comment.author}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Behavioral Skills Column */}
      <div className="flex flex-col gap-6">
        <h4 className="font-bold text-slate-900 dark:text-white border-l-4 border-primary pl-3">
          Affective Domain
        </h4>
        
        <div className="bg-white dark:bg-card-dark p-4">
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-300">
                    {skill.name}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {skill.score}/{skill.maxScore}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${getWidthPercentage(skill.score, skill.maxScore)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Verdict */}
        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Next Term Begins
            </span>
            <span className="font-bold text-slate-800 dark:text-white">
              Jan 12, 2024
            </span>
          </div>
          
          <div className="px-6 py-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full text-green-700 dark:text-green-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined">verified</span>
            Promoted to Grade 6
          </div>
        </div>
      </div>
    </div>
  )
}