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

        <View style={styles.headerActions}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push('/chat-list')}
          >
            <Text style={styles.icon}>💬</Text>
          </Pressable>

          <Pressable
            style={styles.iconButton}
            onPress={() => router.push('/tabs/create')}
          >
            <Text style={styles.plus}>＋</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.welcome}>
          <View>
            <Text style={styles.welcomeTitle}>Your Feed</Text>
            <Text style={styles.welcomeSub}>
              See what's happening on NChat
            </Text>
          </View>

          <Pressable
            style={styles.createButton}
            onPress={() => router.push('/tabs/create')}
          >
            <Text style={styles.createButtonText}>＋ Post</Text>
          </Pressable>
        </View>

        {posts.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyEmoji}>📸</Text>
            </View>

            <Text style={styles.emptyTitle}>No posts yet</Text>

            <Text style={styles.emptyText}>
              Share your first moment with the NChat community.
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={() => router.push('/tabs/create')}
            >
              <Text style={styles.emptyButtonText}>Create your first post</Text>
            </Pressable>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.post}>
              <View style={styles.postHeader}>
                <Pressable
                  style={styles.userInfo}
                  onPress={() =>
                    router.push({
                      pathname: '/user-profile',
                      params: { id: post.username },
                    })
                  }
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {post.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.username}>{post.username}</Text>
                    <Text style={styles.postTime}>NChat post</Text>
                  </View>
                </Pressable>

                <Pressable hitSlop={10}>
                  <Text style={styles.more}>•••</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={() => toggleLike(post.id)}
                style={styles.imageContainer}
              >
                <Image
                  source={{ uri: post.image }}
                  style={styles.postImage}
                />
              </Pressable>

              <View style={styles.actions}>
                <View style={styles.leftActions}>
                  <Pressable
                    onPress={() => toggleLike(post.id)}
                    hitSlop={8}
                  >
                    <Text
                      style={[
                        styles.action,
                        post.liked && styles.liked,
                      ]}
                    >
                      {post.liked ? '♥' : '♡'}
                    </Text>
                  </Pressable>

                  <Pressable hitSlop={8}>
                    <Text style={styles.action}>○</Text>
                  </Pressable>

                  <Pressable hitSlop={8}>
                    <Text style={styles.action}>↗</Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => toggleSave(post.id)}
                  hitSlop={8}
                >
                  <Text style={styles.save}>
                    {post.saved ? '🔖' : '🏷'}
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.likes}>
                {post.likes} {post.likes === 1 ? 'like' : 'likes'}
              </Text>

              {post.caption ? (
                <Text style={styles.caption}>
                  <Text style={styles.captionUsername}>
                    {post.username}{' '}
                  </Text>
                  {post.caption}
                </Text>
              ) : null}

              {post.comments.length > 0 && (
                <View style={styles.comments}>
                  {post.comments.slice(-3).map((comment, index) => (
                    <Text key={index} style={styles.comment}>
                      <Text style={styles.commentUsername}>You </Text>
                      {comment}
                    </Text>
                  ))}

                  {post.comments.length > 3 && (
                    <Text style={styles.moreComments}>
                      View all {post.comments.length} comments
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.commentBox}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>Y</Text>
                </View>

                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Add a comment..."
                  placeholderTextColor="#999"
                  style={styles.input}
                  returnKeyType="send"
                  onSubmitEditing={() => {
                    const text = commentText.trim();

                    if (!text) return;

                    addComment(post.id, text);
                    setCommentText('');
                  }}
                />

                <Pressable
                  onPress={() => {
                    const text = commentText.trim();

                    if (!text) return;

                    addComment(post.id, text);
                    setCommentText('');
                  }}
                >
                  <Text
                    style={[
                      styles.postComment,
                      !commentText.trim() && styles.postCommentDisabled,
                    ]}
                  >
                    Post
                  </Text>
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
    backgroundColor: '#f7f7f8',
  },

  header: {
    height: 68,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  logo: {
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -1,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f3f4',
  },

  icon: {
    fontSize: 20,
  },

  plus: {
    fontSize: 27,
    lineHeight: 29,
    fontWeight: '500',
  },

  scroll: {
    paddingBottom: 30,
  },

  welcome: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  welcomeTitle: {
    fontSize: 21,
    fontWeight: '900',
  },

  welcomeSub: {
    color: '#777',
    marginTop: 3,
    fontSize: 13,
  },

  createButton: {
    backgroundColor: '#111',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 10,
  },

  createButtonText: {
    color: '#fff',
    fontWeight: '800',
  },

  empty: {
    marginHorizontal: 18,
    marginTop: 80,
    padding: 25,
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyEmoji: {
    fontSize: 32,
  },

  emptyTitle: {
    fontSize: 23,
    fontWeight: '900',
    marginTop: 15,
  },

  emptyText: {
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 7,
  },

  emptyButton: {
    backgroundColor: '#111',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 11,
    marginTop: 18,
  },

  emptyButtonText: {
    color: '#fff',
    fontWeight: '800',
  },

  post: {
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingBottom: 4,
  },

  postHeader: {
    height: 64,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  avatarText: {
    fontSize: 17,
    fontWeight: '900',
  },

  username: {
    fontWeight: '900',
    fontSize: 15,
  },

  postTime: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },

  more: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 2,
  },

  imageContainer: {
    width: '100%',
    backgroundColor: '#eee',
  },

  postImage: {
    width: '100%',
    height: 390,
    resizeMode: 'cover',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 12,
  },

  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },

  action: {
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '500',
  },

  liked: {
    fontWeight: '900',
  },

  save: {
    fontSize: 22,
  },

  likes: {
    fontWeight: '800',
    paddingHorizontal: 15,
    paddingTop: 5,
  },

  caption: {
    paddingHorizontal: 15,
    paddingTop: 7,
    lineHeight: 20,
  },

  captionUsername: {
    fontWeight: '900',
  },

  comments: {
    paddingTop: 4,
  },

  comment: {
    paddingHorizontal: 15,
    paddingTop: 5,
    lineHeight: 19,
  },

  commentUsername: {
    fontWeight: '800',
  },

  moreComments: {
    paddingHorizontal: 15,
    paddingTop: 7,
    color: '#888',
    fontSize: 13,
  },

  commentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  commentAvatarText: {
    fontSize: 12,
    fontWeight: '900',
  },

  input: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },

  postComment: {
    color: '#111',
    fontWeight: '900',
    paddingHorizontal: 8,
  },

  postCommentDisabled: {
    color: '#bbb',
  },
});
