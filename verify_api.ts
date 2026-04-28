import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api'; // Adjust if necessary
const TOKEN = 'YOUR_PLATFORM_TOKEN'; // Need to manually test or mock

async function verifyStudentDetails(id: string) {
    try {
        const response = await axios.get(`${BASE_URL}/platform/support/students/${id}`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log('Success:', response.data);
    } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
    }
}

// verifyStudentDetails('some-student-id');
console.log('Script ready for manual execution if service is running.');
