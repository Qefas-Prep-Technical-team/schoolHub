// app/components/TeacherComments.jsx
export default function TeacherComments() {
  const comments = [
    {
      name: 'Mrs. Davis',
      subject: 'Mathematics',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDl19pgRfxe_DQnYopiZM6lSHPDkbt-TWWhEmL3loc7EbrvSx8XIKlWhN0Ng-Hc98c6AbnR7W2X8RhvrHcurwKZe3z1GHYqKPaX7aDhPEZJuM819UZXkp1KQEi377RA6H5PVPz59X6DOfoCrIP77WvXoQyq67xawKC-9NJDcnoTpWBz0aHnMdJPzDTtYQjLrl2KWZvs-WFOcqXxuzUGf6lcb9HfDV43GV931NObPlruNvYdOxtolAUv0-W0NuDVxrixYmhwmVegwOY',
      comment: '"Amelia has shown great improvement this term, especially in algebra. Her dedication to solving complex problems is commendable. Keep up the excellent work!"'
    },
    {
      name: 'Mr. Carter',
      subject: 'Physics',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYxIMvREuNY4Lm__w0J29l1KdgUKcj4mfE_WM7CQO4TJk98NHomX5HTbOAvEf3nOpgOlUzZOyMkPBb9NjSAKwOw5JhC_R_fmpb-s8Xv2ZwZqzucxMFNZX1qdsbVDGDJeqqyPhsblP4FP6lNTixcNcBSXweS8-CaXoKRro43jU668VYXL9w8l8E2s7J6Malwidb1EkuInDxbORWUHns0qvKY_Q5PMenGwz47AUx8hi29quaJbPgh9u64G2-M9vDKxrfV_L3gn9zU4s',
      comment: '"An outstanding student in Physics. Amelia grasps new concepts quickly and her lab work is consistently top-notch. A pleasure to have in class."'
    }
  ]

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-4 text-text-light dark:text-text-dark">
        Teacher Comments
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {comments.map((comment, index) => (
          <div key={index} className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-10 h-10 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url('${comment.avatar}')` }}
              ></div>
              <div>
                <p className="font-bold text-sm text-text-light dark:text-text-dark">
                  {comment.name}
                </p>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                  {comment.subject}
                </p>
              </div>
            </div>
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark leading-relaxed">
              {comment.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}