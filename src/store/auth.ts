import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

type AuthState = {
  username: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<boolean>;
  deleteAccount: () => Promise<void>;
  logout: () => Promise<void>;
};

const getUsername = (user: {
  user_metadata?: { username?: string };
  email?: string;
}) =>
  user.user_metadata?.username ??
  user.email?.split('@')[0] ??
  null;

export const useAuthStore = create<AuthState>((set) => ({
  username: null,
  hydrated: false,

  hydrate: async () => {
    const { data } = await supabase.auth.getSession();

    set({
      username: data.session?.user
        ? getUsername(data.session.user)
        : null,
      hydrated: true,
    });
  },

  login: async (username, password) => {
    const cleanUsername = username.trim();

    if (cleanUsername.length < 3 || !password) {
      return false;
    }

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: `${cleanUsername.toLowerCase()}@nchat.app`,
        password,
      });

    if (error || !data.user) {
      console.log('LOGIN_ERROR:', error?.message);
      return false;
    }

    set({
      username: getUsername(data.user),
    });

    return true;
  },

  signup: async (username, password) => {
    const cleanUsername = username.trim();

    if (cleanUsername.length < 3 || password.length < 6) {
      return false;
    }

    const { data, error } = await supabase.auth.signUp({
      email: `${cleanUsername.toLowerCase()}@nchat.app`,
      password,
      options: {
        data: {
          username: cleanUsername,
        },
      },
    });

    if (error || !data.user) {
      console.log('SIGNUP_ERROR:', error?.message);
      return false;
    }

    set({
      username: cleanUsername,
    });

    return true;
  },

  deleteAccount: async () => {
    const { error } = await supabase.rpc('delete_my_account');

    if (error) {
      console.log('DELETE_ACCOUNT_ERROR:', error.message);
      throw error;
    }

    await supabase.auth.signOut();

    set({
      username: null,
    });
  },

  logout: async () => {
    await supabase.auth.signOut();

    set({
      username: null,
    });
  },
}));
