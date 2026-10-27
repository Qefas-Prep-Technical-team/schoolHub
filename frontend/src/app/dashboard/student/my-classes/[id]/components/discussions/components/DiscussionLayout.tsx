import { ReactNode } from 'react';
import { User } from './types';


interface Props {
    user: User;
    children: ReactNode;
}

export default function DiscussionLayout({ user, children }: Props) {
    return (
        <div className="relative flex h-auto w-full flex-col group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">


                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}