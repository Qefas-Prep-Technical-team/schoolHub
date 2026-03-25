To attach the AI-generated questions to an actual exam or subject paper, you will use the existing route that we previously built for injecting questions: POST /api/v1/exams/:id/papers/:paperId/questions/ai

Here is the exact step-by-step process of how this works in Postman (or from your frontend application):

Step 1: Generate or Parse the Questions
You hit the new AI endpoints we just created.

POST /api/v1/exams/ai/generate or /api/v1/exams/ai/parse-text
Once the AI finishes thinking, it will return a massive JSON response containing an array of perfectly structured questions inside data.questions.
Step 2: Copy the Generated Questions Array
From the response body in Step 1, copy the entire array of questions.

Step 3: Attach them to the Exam Paper
You now send those exact questions to your actual database endpoint to securely lock them into the Subject Paper.

Method: POST
URL: /api/v1/exams/{{examId}}/papers/{{subjectPaperId}}/questions/ai
Headers: Authorization: Bearer <TEACHER_OR_ADMIN_TOKEN>
Body JSON:
json
{
  "questions": [
     // ---> PASTE THE ENTIRE AI ARRAY FROM STEP 1 HERE <---
     {
       "type": "MULTIPLE_CHOICE",
       "question": "What is force?",
       "optionA": "Push",
       "optionB": "Pull",
       // ... etc 
     }
  ]
}
Because the OpenAI schema we provided physically forces the AI to output the exact properties (type, question, optionA, marks, correctAnswer, etc.) that your database expects, your addAIQuestionsToPaperService will accept them instantly and save them to the SubjectExamQuestion table without throwing any validation errors!


Postman Testing Guide: AI Exam Parsing & Generation
This document maps out the endpoints and required payloads for the new OpenAI-powered functionality. Ensure you have OPENAI_API_KEY and OPENAI_MODEL configured in your .env file before testing.

Base URL Context: http://localhost:<PORT>/api/v1/exams/ai

Important Authorization Note: Only users with a TEACHER or ADMIN role can access these AI features. Attempting to use a STUDENT Bearer token will strictly result in a 403 Forbidden response!

1. Parse Raw Exam Text into API JSON
Converts unstructured, pasted exam text into formatted JSON questions perfectly matching the database structure.

Method: POST
URL Path: /api/v1/exams/ai/parse-text
Headers:
Authorization: Bearer <TEACHER_OR_ADMIN_TOKEN>
Content-Type: application/json
Body (Raw JSON):
json
{
  "examTitle": "Physics Mock 2026",
  "subjectName": "Physics",
  "rawText": "1. What is force? A. Push B. Pull C. Both D. None\nAnswer: Both\n2. The SI unit of force is Newton. True or False? Answer: True"
}
Expected Outcome: The AI engine structures the raw text and returns a valid JSON payload containing a questions array with correct answers flagged and choices formatted cleanly.
2. Generate Brand New Questions from a Prompt
Instructs the AI to generate a brand new set of exam questions purely based on a given prompt and topic guidance.

Method: POST
URL Path: /api/v1/exams/ai/generate
Headers:
Authorization: Bearer <TEACHER_OR_ADMIN_TOKEN>
Content-Type: application/json
Body (Raw JSON):
json
{
  "examTitle": "Chemistry Mock",
  "subjectName": "Chemistry",
  "questionCount": 5,
  "prompt": "Generate WAEC-style chemistry objective questions on acids, bases, and salts with correct answers."
}
Expected Outcome: The API returns an array of questionCount generated questions with the MULTIPLE_CHOICE, TRUE_FALSE, or SHORT_ANSWER types mapped seamlessly to your schema.
3. Saving the Generated Results
Once you get a successful response back containing the parsed or generated questions from the endpoints above, you can take that data.questions array and POST it straight to your Database endpoints to permanently lock them in.

Method: POST
URL Path: /api/v1/exams/{{examId}}/papers/{{subjectPaperId}}/questions/ai
Headers:
Authorization: Bearer <TEACHER_OR_ADMIN_TOKEN>

Advanced Exams & Notifications Guide
This document maps out testing the new advanced exams endpoints in Postman and outlines how to securely connect your frontend to listen for the pushed notifications.

1. Postman Endpoints: Subjective Marking
Used by Teachers / Admins to view all pending SHORT_ANSWER answers across the system and manually award them marks.

View the Review Queue
Retrieves all requiresManualReview responses that have not been scored yet.

Method: GET
URL: /api/v1/exams/review/queue?examId=optional-exam-uuid
Headers: Authorization: Bearer <TEACHER_OR_ADMIN_TOKEN>
Expected Outcome: Returns a list of subjectExamAnswer objects awaiting review, complete with the student's text and the questionId.
Mark an Answer
Once you pick an answer from the queue above, you score it.

Method: PATCH
URL: /api/v1/exams/review/answers/:answerId
Headers: Authorization: Bearer <TEACHER_OR_ADMIN_TOKEN>
Body:
json
{
  "scoreAwarded": 2,
  "reviewNote": "Good attempt, but you missed the primary unit of measurement."
}
Expected Outcome: Database applies the marks, recalculates the student's total test score under the hood automatically, and fires a live socket ping to the student.
2. Postman Endpoints: Answer Review UI
Used by Students to see their entire marked paper after submission, or by Teachers auditing a student's paper.

Fetch Complete Exam Review
Method: GET
URL: /api/v1/exams/:id/review?studentId=optional-student-id-if-teacher
Headers: Authorization: Bearer <ANY_ROLE_TOKEN> (Role-gated automatically)
Expected Outcome: Returns an elegantly flattened layout of subjects containing arrays of questions where every question is joined with the studentAnswer, correctAnswer, scoreAwarded, and manual reviewNote. Perfect for mapping out an Exam Dashboard.
3. Postman Endpoints: Rankings & Analytics
Used by Teachers/Admins to observe the class/department performance curve.

Ranking Board: GET /api/v1/exams/:id/ranking Returns all participant scores deeply sorted from highest to lowest.

Class Analytics: GET /api/v1/exams/:id/analytics/class?classId=CLASS-UUID Returns the class average, highest score, lowest score, and class-specific board.

Department Analytics: GET /api/v1/exams/:id/analytics/department?departmentId=DEPT-UUID Returns the department average and department-specific board.

Session Overviews: GET /api/v1/exams/analytics/session?sessionId=SESSION-UUID Returns all exams conducted within a session and their high-level metadata (total attempts, marks limits).

4. Frontend Notification Architecture
The backend currently uses Socket.io hooked into getIO().emit("notification:new", notificationData). To catch these live pushes in your frontend (e.g. Next.js / React), do the following:

Step 1: Initialize the Socket globally
In your main layout or auth-provider:

javascript
import { useEffect } from 'react';
import { io } from 'socket.io-client';
export const useSocketProvider = (userId) => {
  useEffect(() => {
    if (!userId) return;
    // Connect to the backend
    const socket = io('http://localhost:<PORT>', {
       // Pass token if your socket checks auth
       auth: { token: 'YOUR_JWT_HERE' }
    });
    
    // Crucial: The backend emits directly to `user:{id}` rooms!
    // So make sure your backend socket.io connection logic joins the user to their ID room:
    // io.on('connection', (s) => s.join(`user:${userId}`));
    // Listen for the exam broadcasts
    socket.on('notification:new', (notification) => {
      console.log('New Live Notification: ', notification.title);
      console.log('Message: ', notification.message);
      
      // Fire a toast UI
      // toast.success(notification.title, { description: notification.message });
      
      // E.g., if (notification.title === "Exam Submitted") mutate('/api/my-exams');
    });
    return () => {
      socket.disconnect();
    };
  }, [userId]);
};
Note on Fetching History
The socket triggers real-time UI flashes, but you should also have a dedicated fetching hook (e.g., SWR or React Query) hitting your persistent notifications database (e.g., GET /api/v1/notifications) to load past unread ones into a bell icon dropdown.