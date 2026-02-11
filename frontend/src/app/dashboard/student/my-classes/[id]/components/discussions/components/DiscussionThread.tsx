import { useState } from 'react';
import { Discussion, User, Reply } from './types';
import ReplyComponent from './Reply';


interface Props {
    discussion: Discussion;
    onLike: () => void;
    currentUser: User;
}

export default function DiscussionThread({ discussion, onLike, currentUser }: Props) {
    const [showReplies, setShowReplies] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [newReply, setNewReply] = useState('');
    const [replies, setReplies] = useState<Reply[]>(discussion.repliesPreview || []);

    const handleLike = () => {
        if (!isLiked) {
            onLike();
            setIsLiked(true);
        }
    };

    const handleReply = () => {
        if (!newReply.trim()) return;

        const reply: Reply = {
            id: Date.now().toString(),
            content: newReply,
            author: currentUser,
            timestamp: 'Just now'
        };

        setReplies([...replies, reply]);
        setNewReply('');
        setShowReplies(true);
    };

    const getRoleBadge = (role: string) => {
        if (role === 'instructor') {
            return (
                <div className="flex items-center gap-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-xs font-medium px-2 py-0.5">
                    <span className="material-symbols-outlined text-sm">school</span>
                    <span>Instructor</span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="p-5 md:p-6">
                <div className="flex items-center gap-3">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                        style={{ backgroundImage: `url("${discussion.author.avatarUrl}")` }}
                        title={`${discussion.author.name}'s profile`}
                    ></div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <p className="text-slate-900 dark:text-white font-semibold">{discussion.author.name}</p>
                            {getRoleBadge(discussion.author.role)}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{discussion.timestamp}</p>
                    </div>

                    <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                        <span className="material-symbols-outlined text-xl">more_horiz</span>
                    </button>
                </div>

                <div className="mt-4 text-slate-700 dark:text-slate-300 space-y-3">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{discussion.title}</p>
                    <p className="leading-relaxed">{discussion.content}</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="flex items-center gap-1.5 group"
                        >
                            <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">forum</span>
                            <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                {discussion.replies} {discussion.replies === 1 ? 'Reply' : 'Replies'}
                            </span>
                        </button>

                        <button
                            onClick={handleLike}
                            className="flex items-center gap-1.5 group"
                        >
                            <span className={`material-symbols-outlined text-xl ${isLiked ? 'fill text-red-500' : 'group-hover:text-red-500'
                                } transition-colors`}>
                                favorite
                            </span>
                            <span className={`text-sm font-medium ${isLiked ? 'text-red-500' : 'group-hover:text-red-500'
                                } transition-colors`}>
                                {discussion.likes + (isLiked ? 1 : 0)} Likes
                            </span>
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {discussion.topics.map((topic, index) => (
                            <div
                                key={index}
                                className="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3"
                            >
                                <p className="text-slate-700 dark:text-slate-300 text-xs font-medium leading-normal">{topic}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Replies Section */}
            {(showReplies || replies.length > 0) && (
                <div className="border-t border-slate-200 dark:border-slate-800 px-5 md:px-6 py-4 flex flex-col gap-4">
                    {replies.map((reply) => (
                        <ReplyComponent key={reply.id} reply={reply} />
                    ))}

                    {discussion.hasMoreReplies && !showReplies && (
                        <button
                            onClick={() => setShowReplies(true)}
                            className="text-sm font-semibold text-primary text-left ml-11 mt-1 hover:underline"
                        >
                            View all {discussion.replies} replies
                        </button>
                    )}

                    {/* Reply Input */}
                    <div className="flex items-start gap-3 ml-11">
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 shrink-0"
                            style={{ backgroundImage: `url("${currentUser.avatarUrl}")` }}
                            title={`${currentUser.name}'s profile`}
                        ></div>
                        <div className="flex-1">
                            <textarea
                                value={newReply}
                                onChange={(e) => setNewReply(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-transparent focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
                                placeholder="Write a reply..."
                                rows={2}
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handleReply}
                                    disabled={!newReply.trim()}
                                    className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}