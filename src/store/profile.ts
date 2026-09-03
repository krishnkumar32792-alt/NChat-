import { create } from 'zustand';

type ProfileState = {
  username: string;
  bio: string;
  avatar: string | null;
  updateProfile: (username: string, bio: string, avatar: string | null) => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  username: 'Xyz',
  bio: 'Welcome to my NChat profile 🚀',
  avatar: null,

  updateProfile: (username, bio, avatar) =>
    set({
      username,
      bio,
      avatar,
    }),
}));
