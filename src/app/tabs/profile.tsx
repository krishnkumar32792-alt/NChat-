import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, Pressable, View, Image } from 'react-native';
import { usePostStore } from '@/store/posts';
import { useProfileStore } from '@/store/profile';

export default function ProfileScreen() {
  const posts = usePostStore((state) => state.posts);
  const profile = useProfileStore();

  const myPosts = posts.filter((post) => post.username === profile.username);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.username}>@{profile.username}</Text>

        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.logout}>Log out</Text>
        </Pressable>
      </View>

      <View style={styles.profileRow}>
        {profile.avatar ? (
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.number}>{myPosts.length}</Text>
            <Text style={styles.label}>Posts</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.number}>0</Text>
            <Text style={styles.label}>Followers</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.number}>0</Text>
            <Text style={styles.label}>Following</Text>
          </View>
        </View>
      </View>

      <Text style={styles.name}>{profile.username}</Text>
      <Text style={styles.bio}>{profile.bio}</Text>

      <Pressable
        style={styles.editButton}
        onPress={() => router.push('/tabs/edit-profile')}
      >
        <Text style={styles.editText}>Edit Profile</Text>
      </Pressable>

      <View style={styles.actions}>
        <Pressable style={styles.actionButton}>
          <Text style={styles.actionText}>🔖 Saved</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <Text style={styles.actionText}>⚙️ Settings</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      <Text style={styles.postsTitle}>My Posts</Text>

      {myPosts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📷</Text>
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptyText}>
            Share your first post from Create.
          </Text>
        </View>
      ) : (
        <View style={styles.postGrid}>
          {myPosts.map((post) => (
            <Pressable key={post.id} style={styles.gridItem}>
              <Image source={{ uri: post.image }} style={styles.gridImage} />
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingBottom: 35,
  },
  header: {
    height: 65,
    paddingHorizontal: 18,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  username: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111',
  },
  logout: {
    fontWeight: '700',
    color: '#555',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 35,
    fontWeight: '900',
    color: '#111',
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 15,
  },
  stat: {
    alignItems: 'center',
  },
  number: {
    fontSize: 19,
    fontWeight: '900',
  },
  label: {
    color: '#666',
    marginTop: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 20,
  },
  bio: {
    paddingHorizontal: 20,
    marginTop: 5,
    color: '#555',
    lineHeight: 20,
  },
  editButton: {
    marginHorizontal: 20,
    marginTop: 15,
    height: 42,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontWeight: '700',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: 20,
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: '900',
    padding: 15,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 45,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 35,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 10,
  },
  emptyText: {
    color: '#777',
    marginTop: 6,
    textAlign: 'center',
  },
  postGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '33.33%',
    height: 125,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
});
