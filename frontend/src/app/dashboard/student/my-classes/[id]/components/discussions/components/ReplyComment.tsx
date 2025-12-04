'use client';

import { useState } from 'react';
import { User } from './types';

interface ReplyCommentProps {
    currentUser: User;
    onReply: (content: string) => Promise<void>;
    isSubmitting?: boolean;
    placeholder?: string;
    autoFocus?: boolean;
    onCancel?: () => void;
}

export default function ReplyComment({
    currentUser,
    onReply,
    isSubmitting = false,
    placeholder = 'Write a reply...',
    autoFocus = false,
    onCancel
}: ReplyCommentProps) {
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await onReply(content);
            setContent('');
            if (onCancel) onCancel();
        } catch (error) {
            console.error('Error posting reply:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-start gap-3 ml-11 mt-4">
            <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 shrink-0"
                style={{ backgroundImage: `url("${currentUser.avatarUrl}")` }}
                title={`${currentUser.name}'s profile`}
            ></div>

            <div className="flex-1">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-transparent focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
                    placeholder={placeholder}
                    rows={2}
                    autoFocus={autoFocus}
                    disabled={isSubmitting}
                />

                <div className="flex justify-end gap-2 mt-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-1.5 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={!content.trim() || isSubmitting}
                        className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin rounded-full size-3 border-2 border-white border-t-transparent"></span>
                                Posting...
                            </span>
                        ) : (
                            'Reply'
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}