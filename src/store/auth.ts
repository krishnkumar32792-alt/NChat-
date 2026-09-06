import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type Account = {
  username: string;
  password: string;
};

type AuthState = {
  username: string | null;
  accounts: Account[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<boolean>;
  deleteAccount: () => Promise<void>;
  logout: () => Promise<void>;
};

const ACCOUNTS_KEY = '@nchat_accounts';
const SESSION_KEY = '@nchat_session';

export const useAuthStore = create<AuthState>((set, get) => ({
  username: null,
  accounts: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const [accountsRaw, session] = await Promise.all([
        AsyncStorage.getItem(ACCOUNTS_KEY),
        AsyncStorage.getItem(SESSION_KEY),
      ]);

      const accounts: Account[] = accountsRaw
        ? JSON.parse(accountsRaw)
        : [];

      set({
        accounts,
        username: session || null,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  login: async (username, password) => {
    const cleanUsername = username.trim();

    const account = get().accounts.find(
      (item) =>
        item.username.toLowerCase() === cleanUsername.toLowerCase() &&
        item.password === password
    );

    if (!account) return false;

    await AsyncStorage.setItem(SESSION_KEY, account.username);
    set({ username: account.username });

    return true;
  },

  signup: async (username, password) => {
    const cleanUsername = username.trim();

    if (cleanUsername.length < 3 || password.length < 4) {
      return false;
    }

    const exists = get().accounts.some(
      (item) =>
        item.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (exists) return false;

    const account = {
      username: cleanUsername,
      password,
    };

    const accounts = [...get().accounts, account];

    await AsyncStorage.setItem(
      ACCOUNTS_KEY,
      JSON.stringify(accounts)
    );

    await AsyncStorage.setItem(SESSION_KEY, cleanUsername);

    set({
      accounts,
      username: cleanUsername,
    });

    return true;
  },

  deleteAccount: async () => {
    const currentUsername = get().username;

    if (!currentUsername) return;

    const accounts = get().accounts.filter(
      item => item.username.toLowerCase() !== currentUsername.toLowerCase()
    );

    await AsyncStorage.multiRemove([
      SESSION_KEY,
      '@nchat_profile',
      '@nchat_posts',
      '@nchat_nearby_requests',
    ]);

    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

    set({
      username: null,
      accounts,
    });
  },

  deleteAccount: async () => {
    const currentUsername = get().username;

    if (!currentUsername) return;

    const accounts = get().accounts.filter(
      item => item.username.toLowerCase() !== currentUsername.toLowerCase()
    );

    await AsyncStorage.multiRemove([
      SESSION_KEY,
      '@nchat_profile',
      '@nchat_posts',
      '@nchat_nearby_requests',
    ]);

    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

    set({
      username: null,
      accounts,
    });
  },

  logout: async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    set({ username: null });
  },
}));
