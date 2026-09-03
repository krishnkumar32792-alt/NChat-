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
  addPost: (post: Post) => void;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  addComment: (id: string, comment: string) => void;
};

export const usePostStore = create<PostState>((set) => ({
  posts: [],

  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),

  toggleLike: (id) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      ),
    })),

  toggleSave: (id) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id
          ? { ...post, saved: !post.saved }
          : post
      ),
    })),

  addComment: (id, comment) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id
          ? { ...post, comments: [...post.comments, comment] }
          : post
      ),
    })),
}));
