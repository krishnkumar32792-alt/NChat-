import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type Post = {
  id: string;
  image: string;
  caption: string;
  username: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  comments: string[];
};

type PostState = {
  posts: Post[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addPost: (post: Post) => void;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  addComment: (id: string, comment: string) => void;
  resetPosts: () => void;
};

const KEY = '@nchat_posts';

const save = (posts: Post[]) => {
  AsyncStorage.setItem(KEY, JSON.stringify(posts)).catch(() => {});
};

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      set({
        posts: raw ? JSON.parse(raw) : [],
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  addPost: (post) =>
    set((state) => {
      const posts = [post, ...state.posts];
      save(posts);
      return { posts };
    }),

  toggleLike: (id) =>
    set((state) => {
      const posts = state.posts.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked
                ? Math.max(0, post.likes - 1)
                : post.likes + 1,
            }
          : post
      );

      save(posts);
      return { posts };
    }),

  toggleSave: (id) =>
    set((state) => {
      const posts = state.posts.map((post) =>
        post.id === id
          ? { ...post, saved: !post.saved }
          : post
      );

      save(posts);
      return { posts };
    }),

  addComment: (id, comment) =>
    set((state) => {
      const posts = state.posts.map((post) =>
        post.id === id
          ? {
              ...post,
              comments: [...post.comments, comment],
            }
          : post
      );

      save(posts);
      return { posts };
    }),

  resetPosts: () => {
    AsyncStorage.removeItem(KEY).catch(() => {});
    set({ posts: [] });
  },


}));
