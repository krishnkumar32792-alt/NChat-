import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

type SignupResult = 'success' | 'verify' | 'error';

type AuthState = {
  user: any;
  username: string;
  loading: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<SignupResult>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  username: '',
  loading: true,
  hydrated: false,

  hydrate: async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;
    const username = (await AsyncStorage.getItem('@nchat_username')) ?? '';

    set({
      user,
      username,
      loading: false,
      hydrated: true,
    });
  },

  login: async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !data.user) {
      console.log('LOGIN ERROR:', error?.message);
      return false;
    }

    const savedUsername =
      (await AsyncStorage.getItem('@nchat_username')) ?? '';

    set({
      user: data.user,
      username: savedUsername,
    });

    return true;
  },

  signup: async (username, email, password) => {
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          username: cleanUsername,
        },
      },
    });

    if (error) {
      console.log('SIGNUP ERROR:', error.message);
      return 'error';
    }

    if (!data.user) {
      console.log('SIGNUP ERROR: No user returned');
      return 'error';
    }

    await AsyncStorage.setItem('@nchat_username', cleanUsername);

    set({
      user: data.user,
      username: cleanUsername,
    });

    if (!data.session) {
      return 'verify';
    }

    return 'success';
  },

  resetPassword: async (email) => {
    const cleanEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: 'nchat://reset-password',
    });

    if (error) {
      console.log('RESET PASSWORD ERROR:', error.message);
      return false;
    }

    return true;
  },

  logout: async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem('@nchat_username');

    set({
      user: null,
      username: '',
    });
  },

  deleteAccount: async () => {
    const { error } = await supabase.rpc('delete_my_account');

    if (error) {
      console.log('DELETE ACCOUNT ERROR:', error.message);
      return false;
    }

    await supabase.auth.signOut();
    await AsyncStorage.removeItem('@nchat_username');

    set({
      user: null,
      username: '',
    });

    return true;
  },
}));
