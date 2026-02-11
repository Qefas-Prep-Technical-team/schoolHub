export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  role: "student" | "instructor" | "ta";
}

export interface Reply {
  id: string;
  content: string;
  author: User;
  timestamp: string;
  likes?: number;
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  author: User;
  timestamp: string;
  likes: number;
  replies: number;
  topics: string[];
  repliesPreview?: Reply[];
  hasMoreReplies?: boolean;
  isPinned?: boolean;
  isAnnouncement?: boolean;
}

export interface Topic {
  id: string;
  name: string;
  count?: number;
}

export interface SidebarItem {
  id: string;
  icon: string;
  label: string;
  active: boolean;
  badge?: number;
}

export interface CreatePostData {
  content: string;
  topics: string[];
  isAnnouncement?: boolean;
  isPinned?: boolean;
}
