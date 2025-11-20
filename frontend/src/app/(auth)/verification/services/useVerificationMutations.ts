/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { verificationAPI } from './verification-api'
import { useToast } from '@/lib/hooks/useToast'


export const useRequestCode = () => {
  const { auth } = useToast()

  return useMutation({
    mutationFn: verificationAPI.requestCode,
    onSuccess: (response) => {
      auth.success(response.data?.message || 'Verification code sent successfully!')
      console.log('Verification code requested:', response.data)
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to send verification code'
      auth.error(errorMessage)
      console.error('Request code failed:', error)
      throw error
    }
  })
}

export const useVerifyCode = () => {
  const { auth, loading: toastLoading } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => 
      verificationAPI.verifyCode(email, code),
    onSuccess: (response) => {
      auth.success(response.data?.message || 'Email verified successfully!')
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      console.log('Verification successful:', response.data)
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Verification failed'
      auth.error(errorMessage)
      console.error('Verification failed:', error)
      throw error
    },
    onMutate: () => {
      return toastLoading.show('Verifying your code...')
    }
  })
}

export const useResendCode = () => {
  const { auth } = useToast()

  return useMutation({
    mutationFn: verificationAPI.resendCode,
    onSuccess: (response) => {
      auth.success(response.data?.message || 'New code sent successfully!')
      console.log('Code resent:', response.data)
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to resend code'
      auth.error(errorMessage)
      console.error('Resend code failed:', error)
      throw error
    }
  })
}