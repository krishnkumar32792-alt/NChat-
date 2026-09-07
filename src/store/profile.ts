import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type Profile = {
  username: string;
  name: string;
  bio: string;
  avatar: string;
};

type ProfileState = {
  profile: Profile;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setProfile: (profile: Partial<Profile>) => void;
  resetProfile: () => void;
};

const KEY = '@nchat_profile';

const defaultProfile: Profile = {
  username: 'Xyz',
  name: 'NChat User',
  bio: '',
  avatar: '',
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: defaultProfile,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);

      set({
        profile: raw
          ? { ...defaultProfile, ...JSON.parse(raw) }
          : defaultProfile,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  setProfile: (changes) =>
    set((state) => {
      const profile = {
        ...state.profile,
        ...changes,
      };

      AsyncStorage.setItem(KEY, JSON.stringify(profile)).catch(() => {});

      return { profile };
    }),

  resetProfile: () => {
    set({ profile: defaultProfile });
  },


}));
