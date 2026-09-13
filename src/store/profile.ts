import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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

const saveLocal = async (profile: Profile) => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(profile));
  } catch {}
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: defaultProfile,
  hydrated: false,

  hydrate: async () => {
    try {
      const localRaw = await AsyncStorage.getItem(KEY);

      let profile: Profile = localRaw
        ? { ...defaultProfile, ...JSON.parse(localRaw) }
        : defaultProfile;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, name, bio, avatar')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && data) {
          profile = {
            username: data.username || profile.username,
            name: data.name || '',
            bio: data.bio || '',
            avatar: data.avatar || '',
          };

          await saveLocal(profile);
        }
      }

      set({
        profile,
        hydrated: true,
      });
    } catch (error) {
      console.log('PROFILE_HYDRATE_ERROR:', error);
      set({ hydrated: true });
    }
  },

  setProfile: (changes) => {
    set((state) => {
      const profile = {
        ...state.profile,
        ...changes,
      };

      void saveLocal(profile);

      void (async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { error } = await supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              username: profile.username,
              name: profile.name,
              bio: profile.bio,
              avatar: profile.avatar,
            },
            { onConflict: 'id' }
          );

        if (error) {
          console.log('PROFILE_SAVE_ERROR:', error.message);
        }
      })();

      return { profile };
    });
  },

  resetProfile: () => {
    set({ profile: defaultProfile });
    void AsyncStorage.removeItem(KEY);
  },
}));
