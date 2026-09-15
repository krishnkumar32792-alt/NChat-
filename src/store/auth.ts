import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

type AuthState = {
  username: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  signup: (
    username: string,
    email: string,
    password: string
  ) => Promise<'success' | 'verify' | 'error'>;
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

  login: async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || !password) {
      return false;
    }

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

    if (error || !data.user || !data.session) {
      console.log(
        'LOGIN_ERROR:',
        error?.message ?? 'No active session'
      );
      return false;
    }

    set({
      username: getUsername(data.user),
    });

    return true;
  },

  signup: async (username, email, password) => {
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
      cleanUsername.length < 3 ||
      !cleanEmail.includes('@') ||
      password.length < 6
    ) {
      return 'error';
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          username: cleanUsername,
        },
      },
    });

    if (error || !data.user) {
      console.log(
        'SIGNUP_ERROR:',
        error?.message ?? 'Signup failed'
      );
      return 'error';
    }

    if (!data.session) {
      console.log(
        'SIGNUP_VERIFY:',
        'Account created. Email verification required.'
      );
      return 'verify';
    }

    set({
      username: cleanUsername,
    });

    return 'success';
  },

  resetPassword: async (email) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return false;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      cleanEmail
    );

    if (error) {
      console.log('RESET_PASSWORD_ERROR:', error.message);
      return false;
    }

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
