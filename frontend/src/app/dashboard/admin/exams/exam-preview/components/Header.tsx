import { Download, Share, Eye, Settings, LogOut } from 'lucide-react';
import Button from './ui/Button';

interface HeaderProps {
    onEdit: () => void;
    onDownload: () => void;
    onShare: () => void;
    onPublish: () => void;
    onPreview: () => void;
    onSettings?: () => void;
    onLogout?: () => void;
    userAvatar?: string;
}

export default function Header({
    onEdit,
    onDownload,
    onShare,
    onPublish,
    onPreview,
    onSettings,
    onLogout,
    userAvatar
}: HeaderProps) {
    return (
        <header className="sticky top-0 z-10 flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3">
            {/* Left Side - Logo and Brand */}
            <div className="flex items-center gap-4 text-gray-900 dark:text-white">
                <div className="size-6 text-primary">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor" />
                    </svg>
                </div>
                <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                    Exams & Quizzes
                </h2>
            </div>

            {/* Right Side - Actions and User Menu */}
            <div className="flex flex-1 justify-end gap-4 md:gap-6">
                {/* Action Buttons - Visible on larger screens */}
                <div className="hidden sm:flex items-center gap-2">
                    <Button variant="secondary" onClick={onPreview}>
                        <Eye size={16} />
                        <span className="truncate">Preview</span>
                    </Button>
                    <Button variant="secondary" onClick={onEdit}>
                        <span className="truncate">Edit Exam</span>
                    </Button>
                    <Button variant="secondary" onClick={onDownload} className="px-2.5">
                        <Download size={16} />
                    </Button>
                    <Button variant="secondary" onClick={onShare} className="px-2.5">
                        <Share size={16} />
                    </Button>
                    <Button onClick={onPublish}>
                        <span className="truncate">Publish Exam</span>
                    </Button>
                </div>

                {/* Mobile Menu Button - Visible on small screens */}
                <div className="sm:hidden">
                    <Button variant="secondary" className="px-2.5">
                        <Settings size={16} />
                    </Button>
                </div>

                {/* User Avatar with Dropdown Menu */}
                <div className="relative group">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer"
                        style={{
                            backgroundImage: userAvatar || 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuARTkIc_15QhPURe-mr8ZXrXqml1goWeYGxFJc6_NSdIvKvdxIG01htA6IJP_ZbfMKJ1XId0pjg4m0m1q_ial7EOEelMPZpNc4BCp3VWZtCYgNTPh_AjuT-ui3xTlSanAuu8lyT398FihspLKByUBEXm3n07aeokbJm-SMRn5-eZ2iEqhjvci-SLZRKp3USWS7tgQD63a5Xv8ci7KkBClifAeE3r4V_RzZWge6ekrIb9OL0N4dYvFhf-DP34M2TztcMjF8UDp21tEk")'
                        }}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="p-2">
                            <button
                                onClick={onPreview}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            >
                                <Eye size={16} />
                                Preview Exam
                            </button>
                            <button
                                onClick={onEdit}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            >
                                <span>Edit Exam</span>
                            </button>
                            <button
                                onClick={onDownload}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            >
                                <Download size={16} />
                                Download
                            </button>
                            <button
                                onClick={onShare}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            >
                                <Share size={16} />
                                Share
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-gray-600" />
                            <button
                                onClick={onSettings}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            >
                                <Settings size={16} />
                                Settings
                            </button>
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}