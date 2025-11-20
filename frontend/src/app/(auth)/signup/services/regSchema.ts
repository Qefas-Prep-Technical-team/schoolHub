import * as yup from 'yup'

export const parentSchema = yup.object({
  fullName: yup
    .string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      'Password must contain at least one letter and one number'
    ),
  
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  
  studentCode: yup
    .string()
    .optional()
    .test('studentCode-format', 'Student code must be in format: stu-123456', (value) => {
      // If no value provided, it's valid (optional field)
      if (!value || value.trim() === '') return true;
      
      // If value provided, validate the format
      return /^stu-\d{6}$/.test(value);
    })
})

export type ParentFormData = yup.InferType<typeof parentSchema>