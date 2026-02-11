import { Reply as ReplyType } from './types';

interface Props {
    reply: ReplyType;
}

export default function ReplyComponent({ reply }: Props) {
    return (
        <div className="flex items-start gap-3">
            <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 shrink-0"
                style={{ backgroundImage: `url("${reply.author.avatarUrl}")` }}
                title={`${reply.author.name}'s profile`}
            ></div>

            <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                    <p className="text-slate-900 dark:text-white font-semibold text-sm">{reply.author.name}</p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs">{reply.timestamp}</p>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm">{reply.content}</p>

                {reply.likes !== undefined && (
                    <div className="flex items-center gap-2 mt-2">
                        <button className="flex items-center gap-1 text-slate-500 hover:text-red-500 text-xs">
                            <span className="material-symbols-outlined text-sm">favorite_border</span>
                            {reply.likes}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}