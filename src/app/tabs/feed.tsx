import { router } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { usePostStore, type Post } from '@/store/posts';

const PostItem = memo(function PostItem({
  post,
  onLike,
  onSave,
  onComment,
}: {
  post: Post;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onComment: (id: string, text: string) => void;
}) {
  const [comment, setComment] = useState('');

  const submitComment = () => {
    const text = comment.trim();
    if (!text) return;

    onComment(post.id, text);
    setComment('');
  };

  return (
    <View style={styles.post}>
      <Pressable
        style={styles.postHeader}
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

        <View style={styles.userText}>
          <Text style={styles.username}>{post.username}</Text>
          <Text style={styles.postTime}>NChat</Text>
        </View>
      </Pressable>

      <Image
        source={post.image}
        style={styles.postImage}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
        recyclingKey={post.id}
      />

      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <Pressable onPress={() => onLike(post.id)} hitSlop={10}>
            <Text style={[styles.like, post.liked && styles.liked]}>
              {post.liked ? '♥' : '♡'}
            </Text>
          </Pressable>

          <Pressable hitSlop={10}>
            <Text style={styles.action}>○</Text>
          </Pressable>

          <Pressable hitSlop={10}>
            <Text style={styles.action}>↗</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => onSave(post.id)} hitSlop={10}>
          <Text style={styles.save}>
            {post.saved ? '🔖' : '🏷'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.likes}>
        {post.likes} {post.likes === 1 ? 'like' : 'likes'}
      </Text>

      {!!post.caption && (
        <Text style={styles.caption}>
          <Text style={styles.captionUser}>{post.username} </Text>
          {post.caption}
        </Text>
      )}

      {post.comments.length > 0 && (
        <View style={styles.comments}>
          {post.comments.slice(-3).map((item, index) => (
            <Text key={`${post.id}-${index}`} style={styles.comment}>
              <Text style={styles.commentUser}>You </Text>
              {item}
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
          value={comment}
          onChangeText={setComment}
          placeholder="Add a comment..."
          placeholderTextColor="#999"
          style={styles.input}
          returnKeyType="send"
          onSubmitEditing={submitComment}
        />

        <Pressable onPress={submitComment}>
          <Text
            style={[
              styles.postComment,
              !comment.trim() && styles.disabledText,
            ]}
          >
            Post
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

export default function FeedScreen() {
  const posts = usePostStore((state) => state.posts);
  const toggleLike = usePostStore((state) => state.toggleLike);
  const toggleSave = usePostStore((state) => state.toggleSave);
  const addComment = usePostStore((state) => state.addComment);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostItem
        post={item}
        onLike={toggleLike}
        onSave={toggleSave}
        onComment={addComment}
      />
    ),
    [toggleLike, toggleSave, addComment]
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);

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

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={16}
        windowSize={5}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
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
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📸</Text>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>
              Share your first moment with the NChat community.
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={() => router.push('/tabs/create')}
            >
              <Text style={styles.emptyButtonText}>
                Create your first post
              </Text>
            </Pressable>
          </View>
        }
      />
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
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    fontSize: 22,
  },

  plus: {
    fontSize: 29,
    fontWeight: '500',
  },

  list: {
    paddingBottom: 30,
  },

  welcome: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  welcomeTitle: {
    fontSize: 25,
    fontWeight: '900',
  },

  welcomeSub: {
    color: '#777',
    marginTop: 3,
  },

  createButton: {
    backgroundColor: '#111',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
  },

  createButtonText: {
    color: '#fff',
    fontWeight: '800',
  },

  post: {
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingBottom: 12,
  },

  postHeader: {
    height: 62,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 17,
    fontWeight: '900',
  },

  userText: {
    marginLeft: 10,
  },

  username: {
    fontSize: 15,
    fontWeight: '800',
  },

  postTime: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },

  postImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#eee',
  },

  actions: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },

  like: {
    fontSize: 30,
    lineHeight: 32,
  },

  liked: {
    color: '#e53935',
  },

  action: {
    fontSize: 27,
  },

  save: {
    fontSize: 23,
  },

  likes: {
    marginHorizontal: 16,
    marginTop: 5,
    fontWeight: '800',
  },

  caption: {
    marginHorizontal: 16,
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },

  captionUser: {
    fontWeight: '800',
  },

  comments: {
    marginHorizontal: 16,
    marginTop: 8,
  },

  comment: {
    fontSize: 13,
    lineHeight: 19,
  },

  commentUser: {
    fontWeight: '800',
  },

  moreComments: {
    color: '#777',
    marginTop: 3,
    fontSize: 13,
  },

  commentBox: {
    marginHorizontal: 16,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },

  commentAvatarText: {
    fontWeight: '800',
  },

  input: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
    fontSize: 14,
  },

  postComment: {
    fontWeight: '800',
  },

  disabledText: {
    opacity: 0.35,
  },

  empty: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 70,
  },

  emptyEmoji: {
    fontSize: 55,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: '900',
    marginTop: 12,
  },

  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 8,
    lineHeight: 20,
  },

  emptyButton: {
    marginTop: 20,
    backgroundColor: '#111',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },

  emptyButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
});
