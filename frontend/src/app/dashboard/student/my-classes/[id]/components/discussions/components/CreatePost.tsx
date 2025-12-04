'use client';

import { useState } from 'react';
import { User } from './types';

interface Props {
    user: User;
    onPost: (content: string) => void;
}

export default function CreatePost({ user, onPost }: Props) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            onPost(content);
            setContent('');
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-start p-4 gap-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 @container">
            <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0"
                style={{ backgroundImage: `url("${user.avatarUrl}")` }}
                title={`${user.name}'s profile`}
            ></div>

            <div className="flex flex-col w-full">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden bg-transparent focus:outline-0 focus:ring-0 border-0 p-0 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base font-normal leading-relaxed"
                    placeholder="Ask a question or share something..."
                    rows={3}
                    disabled={isSubmitting}
                />

                <div className="flex items-center gap-4 justify-between mt-3">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <button
                            type="button"
                            className="flex items-center justify-center p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Add tag"
                        >
                            <span className="material-symbols-outlined text-xl">sell</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Attach file"
                        >
                            <span className="material-symbols-outlined text-xl">attach_file</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Add emoji"
                        >
                            <span className="material-symbols-outlined text-xl">mood</span>
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={!content.trim() || isSubmitting}
                        className="min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary text-white text-sm font-medium leading-normal hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin rounded-full size-4 border-2 border-white border-t-transparent"></span>
                                Posting...
                            </span>
                        ) : (
                            <span className="truncate">Post</span>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}