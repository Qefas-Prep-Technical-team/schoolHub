import { Bell, HelpCircle } from 'lucide-react';
import Button from './ui/Button';

interface HeaderProps {
    userAvatar?: string;
    onNotifications?: () => void;
    onHelp?: () => void;
}

export default function Header({ userAvatar, onNotifications, onHelp }: HeaderProps) {
    return (
        <header className="sticky top-0 z-10 w-full bg-card-background/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between whitespace-nowrap px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-16">
                {/* Logo and Brand */}
                <div className="flex items-center gap-4 text-primary-text dark:text-white">
                    <svg className="h-6 w-6 text-primary-action" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" />
                    </svg>
                    <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">SchoolHub</h2>
                </div>

                {/* Navigation */}
                <div className="hidden md:flex flex-1 justify-center items-center gap-9">
                    <a className="text-primary-text dark:text-gray-300 text-sm font-medium leading-normal hover:text-primary-action dark:hover:text-primary" href="#">
                        Dashboard
                    </a>
                    <a className="text-primary-text dark:text-gray-300 text-sm font-medium leading-normal hover:text-primary-action dark:hover:text-primary" href="#">
                        Courses
                    </a>
                    <a className="text-primary-action dark:text-primary text-sm font-bold leading-normal" href="#">
                        Exams
                    </a>
                    <a className="text-primary-text dark:text-gray-300 text-sm font-medium leading-normal hover:text-primary-action dark:hover:text-primary" href="#">
                        Grades
                    </a>
                </div>

                {/* User Actions */}
                <div className="flex items-center gap-3">
                    <Button variant="icon" onClick={onNotifications}>
                        <Bell size={20} />
                    </Button>
                    <Button variant="icon" onClick={onHelp}>
                        <HelpCircle size={20} />
                    </Button>
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                        style={{
                            backgroundImage: userAvatar || 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBsY9WHXTcKbvO0hd3gE2D9hog1BgBJ_e_EBV-u9u3NLra73qx12qNqChXmQ-0fy7tTqfjZfYWEoap7lH8D6VK_dWIev6azGkgrFyMHb2ted3ZmbEjJ2JjyRApYdNg9j2bOZX4TuYB1ELtowQd_RKNa1T6dAdAgVEUDqFEJhTkY5j2GKITjXxdRqbmppsqT64q5IGUnMYwU4GFn1v-0mkHcXeD5MBENM7Q4ORKJBxOqk6jccz2UY0rt6dkVvfwjIWIqDWjNIysk88M")'
                        }}
                    />
                </div>
            </div>
        </header>
    );
}