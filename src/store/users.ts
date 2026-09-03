import { create } from 'zustand';

export type User = {
  id: string;
  username: string;
  bio: string;
  followers: number;
  following: number;
  followed: boolean;
  online: boolean;
  lastSeen: string;
};

type UserState = {
  users: User[];
  toggleFollow: (id: string) => void;
  setOnline: (id: string, online: boolean) => void;
};

export const useUserStore = create<UserState>((set) => ({
  users: [
    {
      id: '1',
      username: 'alex',
      bio: 'Hello from NChat 👋',
      followers: 124,
      following: 80,
      followed: false,
      online: true,
      lastSeen: 'Active now',
    },
    {
      id: '2',
      username: 'rahul',
      bio: 'Photography & travel 📸',
      followers: 342,
      following: 156,
      followed: false,
      online: true,
      lastSeen: 'Active now',
    },
    {
      id: '3',
      username: 'riya',
      bio: 'Just enjoying life ✨',
      followers: 521,
      following: 210,
      followed: false,
      online: true,
      lastSeen: 'Active now',
    },
  ],

  toggleFollow: (id) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id
          ? {
              ...user,
              followed: !user.followed,
              followers: user.followed
                ? user.followers - 1
                : user.followers + 1,
            }
          : user
      ),
    })),

  setOnline: (id, online) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id
          ? {
              ...user,
              online,
              lastSeen: online
                ? 'Active now'
                : new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
            }
          : user
      ),
    })),
}));
