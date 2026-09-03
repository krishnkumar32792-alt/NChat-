import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { usePostStore } from '@/store/posts';

export default function FeedScreen() {
  const posts = usePostStore((state) => state.posts);
  const toggleLike = usePostStore((state) => state.toggleLike);
  const toggleSave = usePostStore((state) => state.toggleSave);
  const addComment = usePostStore((state) => state.addComment);

  const [commentText, setCommentText] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>NChat</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <Pressable onPress={() => router.push('/chat-list')}>
            <Text style={styles.create}>💬</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/tabs/create')}>
            <Text style={styles.create}>＋</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {posts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>
              Create your first NChat post.
            </Text>

            <Pressable
              style={styles.button}
              onPress={() => router.push('/tabs/create')}
            >
              <Text style={styles.buttonText}>Create Post</Text>
            </Pressable>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.post}>
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>X</Text>
                </View>

                <Text style={styles.username}>{post.username}</Text>
              </View>

              <Image source={{ uri: post.image }} style={styles.postImage} />

              <View style={styles.actions}>
                <Pressable onPress={() => toggleLike(post.id)}>
                  <Text style={[styles.action, post.liked && styles.liked]}>
                    {post.liked ? '♥' : '♡'}
                  </Text>
                </Pressable>

                <Text style={styles.action}>💬</Text>

                <Pressable onPress={() => toggleSave(post.id)}>
                  <Text style={styles.action}>
                    {post.saved ? '🔖' : '🏷'}
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.likes}>
                {post.likes} {post.likes === 1 ? 'like' : 'likes'}
              </Text>

              {post.caption ? (
                <Text style={styles.caption}>
                  <Text style={styles.username}>{post.username} </Text>
                  {post.caption}
                </Text>
              ) : null}

              {post.comments.map((comment, index) => (
                <Text key={index} style={styles.comment}>
                  <Text style={styles.username}>You </Text>
                  {comment}
                </Text>
              ))}

              <View style={styles.commentBox}>
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Add a comment..."
                  placeholderTextColor="#888"
                  style={styles.input}
                />

                <Pressable
                  onPress={() => {
                    const text = commentText.trim();

                    if (!text) return;

                    addComment(post.id, text);
                    setCommentText('');
                  }}
                >
                  <Text style={styles.postComment}>Post</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    height: 70,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  logo: {
    fontSize: 28,
    fontWeight: '900',
  },

  create: {
    fontSize: 34,
  },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 150,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
  },

  emptyText: {
    color: '#777',
    marginTop: 8,
  },

  button: {
    backgroundColor: '#111',
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 20,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '800',
  },

  post: {
    marginBottom: 25,
  },

  postHeader: {
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontWeight: '800',
  },

  username: {
    fontWeight: '800',
  },

  postImage: {
    width: '100%',
    height: 380,
    backgroundColor: '#eee',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
  },

  action: {
    fontSize: 28,
  },

  liked: {
    fontWeight: '900',
  },

  likes: {
    fontWeight: '700',
    paddingHorizontal: 15,
    paddingTop: 5,
  },

  caption: {
    paddingHorizontal: 15,
    paddingTop: 6,
  },

  comment: {
    paddingHorizontal: 15,
    paddingTop: 8,
  },

  commentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingLeft: 12,
  },

  input: {
    flex: 1,
    height: 42,
  },

  postComment: {
    fontWeight: '800',
    paddingHorizontal: 12,
  },
});
