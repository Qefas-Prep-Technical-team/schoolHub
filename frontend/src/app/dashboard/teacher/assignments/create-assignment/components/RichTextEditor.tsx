'use client';

import { useState } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Add instructions for your students...'
}: RichTextEditorProps) {
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderlined, setIsUnderlined] = useState(false);

    const handleFormat = (format: 'bold' | 'italic' | 'underline' | 'bullet' | 'number' | 'link') => {
        const textarea = document.getElementById('instructions-textarea') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);

        let newText = value;

        switch (format) {
            case 'bold':
                newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
                setIsBold(!isBold);
                break;
            case 'italic':
                newText = value.substring(0, start) + `*${selectedText}*` + value.substring(end);
                setIsItalic(!isItalic);
                break;
            case 'underline':
                newText = value.substring(0, start) + `<u>${selectedText}</u>` + value.substring(end);
                setIsUnderlined(!isUnderlined);
                break;
            case 'bullet':
                newText = value.substring(0, start) + `\n• ${selectedText}` + value.substring(end);
                break;
            case 'number':
                newText = value.substring(0, start) + `\n1. ${selectedText}` + value.substring(end);
                break;
            case 'link':
                const url = prompt('Enter URL:');
                if (url) {
                    newText = value.substring(0, start) + `[${selectedText}](${url})` + value.substring(end);
                }
                break;
        }

        onChange(newText);

        // Restore cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start, end);
        }, 0);
    };

    return (
        <div className="w-full bg-[#f6f6f8] dark:bg-[#111721] rounded-lg border border-[#d1d8e6] dark:border-[#374151]">
            <div className="p-2 border-b border-[#d1d8e6] dark:border-[#374151] flex items-center gap-2 text-[#506795] dark:text-[#A1A1AA]">
                <button
                    onClick={() => handleFormat('bold')}
                    className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 ${isBold ? 'bg-black/20 dark:bg-white/20' : ''}`}
                    title="Bold"
                >
                    <span className="material-symbols-outlined text-base">format_bold</span>
                </button>
                <button
                    onClick={() => handleFormat('italic')}
                    className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 ${isItalic ? 'bg-black/20 dark:bg-white/20' : ''}`}
                    title="Italic"
                >
                    <span className="material-symbols-outlined text-base">format_italic</span>
                </button>
                <button
                    onClick={() => handleFormat('underline')}
                    className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 ${isUnderlined ? 'bg-black/20 dark:bg-white/20' : ''}`}
                    title="Underline"
                >
                    <span className="material-symbols-outlined text-base">format_underlined</span>
                </button>
                <button
                    onClick={() => handleFormat('bullet')}
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                    title="Bullet List"
                >
                    <span className="material-symbols-outlined text-base">format_list_bulleted</span>
                </button>
                <button
                    onClick={() => handleFormat('number')}
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                    title="Numbered List"
                >
                    <span className="material-symbols-outlined text-base">format_list_numbered</span>
                </button>
                <button
                    onClick={() => handleFormat('link')}
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                    title="Insert Link"
                >
                    <span className="material-symbols-outlined text-base">link</span>
                </button>
            </div>
            <textarea
                id="instructions-textarea"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="form-textarea w-full h-40 resize-y p-3 bg-transparent border-0 focus:ring-0 placeholder:text-[#506795] text-base"
                placeholder={placeholder}
            />
        </div>
    );
}