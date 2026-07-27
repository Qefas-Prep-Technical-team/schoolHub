export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    REFRESH: "/auth/refresh-token",
  },
  USERS: {
    BASE: "/users",
    PROFILE: "/users/profile",
  },
  TODOS: {
    BASE: "/todos",
    BY_ID: (id: string) => `/todos/${id}`,
  },
  NOTIFICATIONS: {
    BASE: "/notifications",
    MARK_READ: "/notifications/mark-read",
  },
  MESSAGES: {
    BASE: "/messages",
    CONVERSATION: (userId: string) => `/messages/conversation/${userId}`,
  },
  SETTINGS: {
    BASE: "/settings",
  },
  SYNC: {
    PULL: "/sync/pull",
    PUSH: "/sync/push",
  },
};
