'use client';

import { useState } from 'react';
import { Discussion, SidebarItem, Topic, User } from './components/types';
import DiscussionLayout from './components/DiscussionLayout';
import Sidebar from './components/Sidebar';
import DiscussionThread from './components/DiscussionThread';
import CreatePost from './components/CreatePost';


// Mock data
const mockUser: User = {
    id: '1',
    name: 'Alex Johnson',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSvAyGKqqJdXI4irlLtUfD7bd5qIP-qEiAdxUtb2UBfoxZPqCUeKLRXj1g9Un4kKsHsCMW3vo6WvFYXi7J_pkOcoSrRpPuyu5Lv37xicoUNckrzazYJ64mpYILAJ2TuDlgeEzrh7p6HOqGJD3mpru_IWgXIiwu3stRboTLci3TqydxejJzx02lwg2n3fMm98KsWa_Nbo1gxjUiLCRO1yRSjYoNfaCoQyL0DDffDuWTCNRWbHmUlknyHJfZd4EUa9KxWmI4YzSEcYg',
    role: 'student'
};

const mockDiscussions: Discussion[] = [
    {
        id: '1',
        title: 'Welcome & Week 1 Discussion',
        content: "Hello everyone, and welcome to PSY101! I'm excited to have you in the class. To get started, please introduce yourself and share one thing you hope to learn about psychology this semester. Also, make sure to read Chapter 1 before our first lecture on Wednesday.",
        author: {
            id: '2',
            name: 'Dr. Angela Webb',
            avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_IBdqg3xLQUbwpW1V5WstNWfS_-5yOi1DZvYapOsBs3GvjDyA7hDxMA1VDdxDOMbaI7dnB_XtHbnI_R7HZp-KvD4wJN559q3TraxSLyumuHv1chOpsFte0vVXFdf5Q5hp_4HGesKPTWT25ae35wzlIDbechDwUvYS03OVLjpofxgc8DYPgmGSA4AYyIuIvFLtsOypGl7vQ83fLIRd6IA5my4EbQLWo1gicPiT9RW_l_EYRmtNeQKycEJ9pLfgxIZjeOUOt_jFE2k',
            role: 'instructor'
        },
        timestamp: '2 hours ago',
        likes: 12,
        replies: 3,
        topics: ['#general'],
        repliesPreview: [
            {
                id: 'r1',
                content: "Hi everyone! I'm Liam. I'm really interested in learning more about cognitive biases.",
                author: {
                    id: '3',
                    name: 'Liam Carter',
                    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFUsMFNsv119MzcCb-v8Zo-zTyOd-r7skB0_P28jn2NMwDsuOBs25AQ1PQvqu-8-QTHw8axJhtgxWiNplBSq254Pd4NeVzjmUKiId3cqjKjUBJHfCHH7vNlgO-UbfxpdYqWjppQRh-RGeO2_PlJHTbdItjy8YZPg6pFnZUAMYnZWSp4oa6Xbv13enHapZfWma2ZdRiEi9e-xAftiEkxtAZb4Bom_Q_s3UdF6QA8VuHnbpceb2NUeksuzABBd-hgyI5QyJh3ocU5yw',
                    role: 'student'
                },
                timestamp: '2 hours ago'
            },
            {
                id: 'r2',
                content: "Hey! I'm Olivia. Looking forward to understanding social psychology better. Chapter 1 was interesting!",
                author: {
                    id: '4',
                    name: 'Olivia Chen',
                    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjQpWkdvOIYfQSME-ekT4HDmfgKuMUfTfknhgcL-qTrl5wDtzyyH9b3ORmgiPwqQ-p1HWF_ZDz8hhzINsCYT8Q_0w58tWFliibVfCdLogxxjZpfPX9IYoVBfYcFl1lqwTnjwzoUry8OpUT2JZP38QWuEEA3z7lpN1DrZHtvsrSBehxmRYohwLj-tBVxhVn3evnlDY7kXwvufZfr9mJzhYSBsKS_aBBDFbRwThhReMLd3YjQ-gO626OpuKVmYrLooRD4P4-GarIyeQ',
                    role: 'student'
                },
                timestamp: '1 hour ago'
            }
        ],
        hasMoreReplies: true
    },
    {
        id: '2',
        title: 'Question about Homework 1',
        content: "For question 3 on the first homework, are we supposed to cite our sources using APA or MLA format? The syllabus wasn't clear on this. Thanks!",
        author: {
            id: '5',
            name: 'Mason Garcia',
            avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbCluGVKEum0DGElQCqWGyhTiFAHzHC5L4J9VQQly8muo_Qs-dNmzlQvb5sMgROL8A7zmQIoMsn4KCbyuw1zaDPRsSv8zUDgpry_yuPPBoJquD7LTXOp1LRXXdwgG6PuDna3qZXP6h9bkjigxM-Gg1vD0RfRZtFdQkvvenpqv94WxhVL02WAz5Q_qeOvkVMR1k6zXbr6XPKJvWz4EkwtE8I_u1G-p4jFcFE8mAxdarjuA3rVD8gEcc7OPcynle4puzUOXgbhpRbDI',
            role: 'student'
        },
        timestamp: '1 day ago',
        likes: 2,
        replies: 1,
        topics: ['#homework']
    }
];

const mockTopics: Topic[] = [
    { id: '1', name: '#homework', count: 5 },
    { id: '2', name: '#lecture3', count: 3 },
    { id: '3', name: '#general', count: 12 },
    { id: '4', name: '#final-exam', count: 8 },
    { id: '5', name: '#project-ideas', count: 4 }
];

const mockSidebarItems: SidebarItem[] = [
    { id: '1', icon: 'chat_bubble', label: 'All Posts', active: true },
    { id: '2', icon: 'campaign', label: 'Announcements', active: false },
    { id: '3', icon: 'push_pin', label: 'Pinned Posts', active: false }
];

export default function DiscussionsPage() {
    const [discussions, setDiscussions] = useState<Discussion[]>(mockDiscussions);
    const [activeFilter, setActiveFilter] = useState('all');

    const handleNewPost = (content: string) => {
        const newDiscussion: Discussion = {
            id: Date.now().toString(),
            title: content.split('.')[0] || 'New Post',
            content: content,
            author: mockUser,
            timestamp: 'Just now',
            likes: 0,
            replies: 0,
            topics: ['#general']
        };
        setDiscussions([newDiscussion, ...discussions]);
    };

    const handleLike = (discussionId: string) => {
        setDiscussions(discussions.map(discussion =>
            discussion.id === discussionId
                ? { ...discussion, likes: discussion.likes + 1 }
                : discussion
        ));
    };

    return (
        <DiscussionLayout user={mockUser}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <aside className="lg:col-span-3">
                    <Sidebar
                        items={mockSidebarItems}
                        topics={mockTopics}
                        onFilterChange={setActiveFilter}
                    />
                </aside>

                <section className="lg:col-span-9 flex flex-col gap-6">
                    <CreatePost user={mockUser} onPost={handleNewPost} />

                    <div className="flex flex-col gap-6">
                        {discussions.map((discussion) => (
                            <DiscussionThread
                                key={discussion.id}
                                discussion={discussion}
                                onLike={() => handleLike(discussion.id)}
                                currentUser={mockUser}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </DiscussionLayout>
    );
}