import { toast } from "react-toastify";

/**
 * Copies text to the clipboard and shows a success toast.
 * @param text The text to copy
 * @param label Optional label for the toast message (e.g., "Parent link")
 */
export const copyToClipboard = async (text: string, label?: string) => {
  if (!text) return;
  
  try {
    await navigator.clipboard.writeText(text);
    const message = label ? `${label} copied to clipboard!` : "Copied to clipboard!";
    toast.success(message);
  } catch (err) {
    console.error("Failed to copy!", err);
    toast.error("Failed to copy to clipboard");
  }
};
