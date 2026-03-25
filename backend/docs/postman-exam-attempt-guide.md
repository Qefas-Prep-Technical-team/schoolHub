# Postman Testing Guide: Exam Attempt Lifecycle

This guide outlines the complete flow for testing the Exam Attempt features in Postman. It covers starting an attempt, retrieving the ongoing attempt, saving answers, submitting the exam, and checking the final score. 

**Base URL Context:** `http://localhost:<PORT>/api/v1/exams` *(replace `<PORT>` and `/api/v1` with your actual local configuration).*

---

## 1. Start Exam Attempt
Initializes an attempt for the student and returns the exam paper along with all the questions they need to answer.

- **Method:** `POST`
- **Path:** `/api/v1/exams/{{examId}}/start`
- **Headers:** 
  - `Authorization: Bearer <STUDENT_TOKEN>`
- **Body:** None
- **Expected Outcome:** The API creates an `ExamAttempt` database record (if one doesn't exist) and returns all questions for the subjects.

---

## 2. Get Current Exam Attempt
Retrieves the ongoing attempt. This is particularly useful if the student refreshes the browser mid-exam and you need to fetch their existing attempt without creating a new one.

- **Method:** `GET`
- **Path:** `/api/v1/exams/{{examId}}/attempt`
- **Headers:** 
  - `Authorization: Bearer <STUDENT_TOKEN>`

---

## 3. Save Exam Answer
Saves the student's answer for a specific question. You will call this each time a student answers a question during the exam.

- **Method:** `POST`
- **Path:** `/api/v1/exams/{{examId}}/answers`
- **Headers:** 
  - `Authorization: Bearer <STUDENT_TOKEN>`
  - `Content-Type: application/json`
- **Body (Raw JSON):**
  ```json
  {
    "subjectPaperId": "<SUBJECT_PAPER_ID>",
    "questionId": "<QUESTION_ID>",
    "answer": "A"
  }
  ```
- **Notes:** 
  - This endpoint acts as an "upsert" mechanism. If the student changes their mind, calling this again with the same `questionId` updates their answer.
  - You MUST have started the exam attempt (using Endpoint #1) before saving answers.

---

## 4. Submit Exam Attempt
Submits the exam once the student is finished. This finalizes the attempt and automatically triggers the scoring logic, evaluating correct/incorrect answers.

- **Method:** `POST`
- **Path:** `/api/v1/exams/{{examId}}/submit`
- **Headers:** 
  - `Authorization: Bearer <STUDENT_TOKEN>`
- **Body:** None

---

## 5. Get Exam Result
Fetches the detailed breakdown of the scores after the exam has been submitted and graded.

- **Method:** `GET`
- **Path:** `/api/v1/exams/{{examId}}/result`
- **Headers:**
  - *If checking own result:* `Authorization: Bearer <STUDENT_TOKEN>`
  - *If checking student result:* `Authorization: Bearer <TEACHER_OR_ADMIN_TOKEN>`
- **Query Params (For Teachers/Admins only):**
  - `?studentId=<STUDENT_ID>`

> **Important Checklist for Testing:**
> 1. The exam must be set to `PUBLISHED` status to start an attempt.
> 2. Ensure your `Bearer` tokens represent the correct `UserRole` (Student vs Admin/Teacher) depending on the endpoint requirements.
