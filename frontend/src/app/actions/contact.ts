"use server"

export async function submitContactForm(formData: FormData) {
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
    
    if (!accessKey) {
        return { success: false, message: "Server misconfiguration: Missing API key" };
    }

    formData.append("access_key", accessKey);

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        
        return {
            success: data.success,
            message: data.message || (data.success ? "Message sent successfully!" : "Failed to send message.")
        };
    } catch (error) {
        console.error("Web3Forms submission error:", error);
        return { success: false, message: "An unexpected error occurred." };
    }
}
