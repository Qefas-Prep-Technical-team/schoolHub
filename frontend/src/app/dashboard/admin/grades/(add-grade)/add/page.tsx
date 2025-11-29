'use client';
import { useRouter } from 'next/navigation';
import { GradeFormData } from '../components/types';
import GradeForm from '../components/GradeForm';


export default function AddGradePage() {
    const router = useRouter();

    const handleSubmit = async (formData: GradeFormData) => {
        try {
            // Simulate API call
            console.log('Submitting grade:', formData);
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Redirect back to grades page or show success message
            router.push('/grades');
        } catch (error) {
            console.error('Error saving grade:', error);
            // Handle error (show toast, etc.)
        }
    };

    const handleClose = () => {
        router.back();
    };

    return (
        <GradeForm
            onClose={handleClose}
            onSubmit={handleSubmit}
        />
    );
}