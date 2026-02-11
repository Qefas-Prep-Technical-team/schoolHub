import * as yup from 'yup';

export const gradeFormSchema = yup.object({
  classwork: yup
    .number()
    .min(0, 'Score cannot be negative')
    .max(20, 'Score cannot exceed 20')
    .required('Classwork score is required'), // Yup requires explicit .required()

  assignment: yup
    .number()
    .min(0, 'Score cannot be negative')
    .max(50, 'Score cannot exceed 50')
    .required('Assignment score is required'),

  exam: yup
    .number()
    .min(0, 'Score cannot be negative')
    .max(100, 'Score cannot exceed 100')
    .required('Exam score is required'),

  comment: yup
    .string()
    .optional(),

  notifyParent: yup
    .boolean()
    .default(false),
});

export type GradeFormValues = yup.InferType<typeof gradeFormSchema>;