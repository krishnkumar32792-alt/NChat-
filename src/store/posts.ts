import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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

const saveLocal = async (posts: Post[]) => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(posts));
  } catch {}
};

type DbPost = {
  id: string;
  user_id: string;
  image: string;
  caption: string;
  username: string;
  likes: number;
  created_at: string;
};

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const localRaw = await AsyncStorage.getItem(KEY);
      let posts: Post[] = localRaw ? JSON.parse(localRaw) : [];

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        posts = (data as DbPost[]).map((post) => ({
          id: post.id,
          image: post.image,
          caption: post.caption,
          username: post.username,
          likes: post.likes || 0,
          liked: false,
          saved: false,
          comments: [],
        }));

        await saveLocal(posts);
      }

      set({
        posts,
        hydrated: true,
      });
    } catch (error) {
      console.log('POSTS_HYDRATE_ERROR:', error);
      set({ hydrated: true });
    }
  },

  addPost: (post) => {
    set((state) => {
      const posts = [post, ...state.posts];
      void saveLocal(posts);
      return { posts };
    });

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image: post.image,
          caption: post.caption,
          username: post.username,
          likes: 0,
        })
        .select()
        .single();

      if (error || !data) {
        console.log('ADD_POST_ERROR:', error?.message);
      }
    })();
  },

  toggleLike: (id) => {
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

      void saveLocal(posts);
      return { posts };
    });

    void (async () => {
      const post = get().posts.find((item) => item.id === id);
      if (!post) return;

      const { error } = await supabase
        .from('posts')
        .update({ likes: post.likes })
        .eq('id', id);

      if (error) {
        console.log('LIKE_POST_ERROR:', error.message);
      }
    })();
  },

  toggleSave: (id) =>
    set((state) => {
      const posts = state.posts.map((post) =>
        post.id === id
          ? { ...post, saved: !post.saved }
          : post
      );

      void saveLocal(posts);
      return { posts };
    }),

  addComment: (id, comment) => {
    const cleanComment = comment.trim();
    if (!cleanComment) return;

    set((state) => {
      const posts = state.posts.map((post) =>
        post.id === id
          ? {
              ...post,
              comments: [...post.comments, cleanComment],
            }
          : post
      );

      void saveLocal(posts);
      return { posts };
    });
  },

  resetPosts: () => {
    void AsyncStorage.removeItem(KEY);
    set({ posts: [] });
  },
}));
