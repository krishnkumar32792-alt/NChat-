import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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

type DbProfile = {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatar: string | null;
};

type UserState = {
  users: User[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  toggleFollow: (id: string) => void;
  setOnline: (id: string, online: boolean) => void;
};

export const useUserStore = create<UserState>((set) => ({
  users: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, name, bio, avatar')
        .order('username', { ascending: true });

      if (error) {
        console.log('USERS_HYDRATE_ERROR:', error.message);
        set({ hydrated: true });
        return;
      }

      const users: User[] = ((data ?? []) as DbProfile[])
        .filter((item) => item.id !== currentUser?.id)
        .map((item) => ({
          id: item.id,
          username: item.username || 'NChat User',
          bio: item.bio || '',
          followers: 0,
          following: 0,
          followed: false,
          online: false,
          lastSeen: 'Offline',
        }));

      set({
        users,
        hydrated: true,
      });
    } catch (error) {
      console.log('USERS_HYDRATE_ERROR:', error);
      set({ hydrated: true });
    }
  },

  toggleFollow: (id) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id
          ? {
              ...user,
              followed: !user.followed,
              followers: user.followed
                ? Math.max(0, user.followers - 1)
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
