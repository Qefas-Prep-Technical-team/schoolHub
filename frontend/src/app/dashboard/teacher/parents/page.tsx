'use client';

import { useState, useMemo } from 'react';
import { ParentT } from './components/types';
import PageHeader from './components/PageHeader';
import SearchBar from './components/SearchBar';
import ParentGrid from './components/ParentGrid';


const ParentListPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const initialParents: ParentT[] = useMemo(() => [
        {
            id: 1,
            name: 'Jane Doe',
            avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-YWtzZfwwlIYk7iSihwnRTaFiZCjS2uGHLWcLea23L7kQ3S7oyIEJL0sk5lQ19NDyUMR6R7bVg-bZOBc_3FTVig17zKPRsG_kywPO1H-D1bUVQZyrdG6ctUqDjw5NQsLjJSrXKoSaYaz8BHGtRBqDbQ2UwHzaKrtNBplSs7mCUb_tPxmC8zr-mGVPbMh3FC7qOfKLb5jq1elOElSxWSLAkwwOk2DcsJepOrPzhfYhNLgDiGmJ_IUlHpd1ytQ5FdBdMk-DkWEpyxc',
            studentName: 'John Doe',
            studentGrade: 'Grade 5',
            studentClass: 'B'
        },
        {
            id: 2,
            name: 'Michael Smith',
            avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGH8RcgaULMmC993XnmG8JFy4yJ8j7K1NL1wYrmRRUjRck-w-Fofw5YRN5seAqdol-EHuYu76PqlVK85q_2C4hZf-LfBN7NCBuYFzL0uBnFkDcgRHN6RuQU1h1cUkGPFqV3BdYZi2HuIdQEetaLPvinGAfmr0ELFGuCLoQbm-Zoq9w1Z63QXUWXbaBeIbIcLtg7q1kb9JI5FsaA8LB0srPnx3IBt9FE_92oSdOmSUxkZIxBsymQtYmq9kUKg-CMd7rrw1sAgM-gY4',
            studentName: 'Emily Smith',
            studentGrade: 'Grade 5',
            studentClass: 'A'
        },
        {
            id: 3,
            name: 'Sarah Johnson',
            avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlWO8RPoWo9DiOkvU7S3GxF0CPuw0Dv7TTZ7I68HacpVL3lB5Rt2EmCCvC1SN9JG7qT4jM75Gp8MxB2DjxjURa_ng1MfxhMohfsvw499qqgs4Y2o1s6e1qw-WtfjRID2g_PGgi6pQVqSz1iVPe06fIa87gdnKOfMKeWlMprUFuN_eXJTRsfP1eA0kcQwVboTmZBYrJlFdkn9LrWDZw7Lw3Jbc7LH7mOcy0p1344Krb1eqIyqJHd0GB4X6DVWMBGAVi1mLJ7pC7tII',
            studentName: 'Chris Johnson',
            studentGrade: 'Grade 5',
            studentClass: 'B'
        },
        {
            id: 4,
            name: 'David Chen',
            avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtJ6j-yWk_HVUzIwQnk7rZe3P2pPXV6sExiR1wc0wXBHRdDBr4W9gXIv01QJzuHVsBjO6NxK62tw1MRjeMinfew3DwM6R_COKbSRdAUY8WITzVOjkGuIUeQBsJFwYM34sEMZy1d2u7FI77hCMlMvK1rJsocvn0rWX_nBrtOHdH3YZ2fnIaAI72XdwsxsI6Lc2RfvQR1EOhA3f1-dbI0lMjBgOOJL5gMdgskW65DeBuyAMfWHDTJVY9xS9XDJw39J-4tw2E2BBMmA4',
            studentName: 'Olivia Chen',
            studentGrade: 'Grade 5',
            studentClass: 'C'
        },
        {
            id: 5,
            name: 'Maria Garcia',
            avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl716_qGgomKYMjjnq93wBjKjiyKufYAqB8KLBHkmXsevZn1d7p-nWPYNu8kBs9uTNV3zgVgyhw2vFSs2o_Nwj6TYYccNLPiP3XL1vNB-5BUoHxdnxJy-SHCou4D63zJxf3rscab7y6PYb_qdN05BjmDn9yPrW7LKzDdCv-m58Bo5fi11KF4nvSKd-h-GiWGRjsVMndvbHrOVkaCQQGkVHGy4BynyNQHCU6AcN-1Cw3ebtiU3jzK2FuvGFkelWAqqUM3b8DemzX-s',
            studentName: 'Leo Garcia',
            studentGrade: 'Grade 5',
            studentClass: 'A'
        },
        {
            id: 6,
            name: 'James Williams',
            avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGYzP9aXW0QiZONw2xwdTCLtaoGi5fc1WFzE0MSPk_953CrgxrptUIo41UGFS0Xfzp6F4jNfhnJHQhAE18W81PS2CY93sJgKbuMg2n6NT3JGi9MBYu_R-bai3Zl_b60DnbpEMe-lTzSPgD9OSiWBP3kaWwCC4KjLg4FcKQMt4jECNp0iZ1ybOoTAm3oHhWcaQhN_tSoVIt8fFYuJVzzV8XM_1J821lbwLdovmB7qVIUxkVdm99KfKLbYMk1A38nwDhOoFefRC4-aU',
            studentName: 'Ava Williams',
            studentGrade: 'Grade 5',
            studentClass: 'C'
        }
    ], []);

    const filteredParents = useMemo(() => {
        if (!searchQuery.trim()) return initialParents;

        const query = searchQuery.toLowerCase();
        return initialParents.filter(parent =>
            parent.name.toLowerCase().includes(query) ||
            parent.studentName.toLowerCase().includes(query) ||
            `${parent.studentGrade}${parent.studentClass}`.toLowerCase().includes(query)
        );
    }, [searchQuery, initialParents]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleMessageParent = (parentName: string) => {
        console.log(`Opening message dialog for ${parentName}`);
        // Implement messaging logic
    };

    const handleCallParent = (parentName: string) => {
        console.log(`Initiating call to ${parentName}`);
        // Implement calling logic
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                {/* <Header
          schoolName="Teacher Dashboard"
          teacherName="Mr. Johnson"
          teacherAvatarUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuCwmk4UywY_TAJIWFAdh9sASrPJmLNoOYQhcEHXr56XqVrIFmWtcrQMPfh0oTrJAJhQUgkG_o3HXOA_IlAjN9ms-dSw3AQcjBX8pFn3t1jjeSi2DrS7uJlrCQAnqZAr0YLRRS8pOqolwduolIYWJ-rycu8xZ3Dsb4e49Ftg6eOresoE0MSXbepI4gNbvKvbQOTgPX_lqmXHCTJH6da9X-Ge6yN-J_h5bpisAP5PVYmWFlM4P_ee-H1YQr-7FiyWCQSTphYpVfDAbI0"
        /> */}

                <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
                    <div className="flex flex-col gap-8">
                        <PageHeader title="Parent Directory" />
                        <SearchBar onSearch={handleSearch} />
                        <ParentGrid parents={filteredParents} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ParentListPage;