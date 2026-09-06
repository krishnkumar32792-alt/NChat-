import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { usePostStore } from '@/store/posts';
import { useProfileStore } from '@/store/profile';
import { useAuthStore } from '@/store/auth';

export default function ProfileScreen() {
  const profile = useProfileStore((state) => state.profile);
  const posts = usePostStore((state) => state.posts);
  const authUsername = useAuthStore((state) => state.username);

  const username = authUsername?.trim() || profile.username || 'Xyz';

  const myPosts = posts.filter(
    (post) => post.username.toLowerCase() === username.toLowerCase()
  );

  const savedCount = posts.filter((post) => post.saved).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>@{username}</Text>

        <Pressable
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>
      </View>

      <View style={styles.profileTop}>
        <View style={styles.avatar}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {username.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{myPosts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.bioBox}>
        <Text style={styles.name}>{profile.name || username}</Text>
        <Text style={styles.bio}>
          {profile.bio || 'Hey! I am using NChat 👋'}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.editButton}
          onPress={() => router.push('/edit-profile')}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => router.push('/saved')}
        >
          <Text style={styles.actionText}>🔖 Saved ({savedCount})</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      {myPosts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📷</Text>
          <Text style={styles.emptyTitle}>No Posts Yet</Text>
          <Text style={styles.emptyText}>
            Create your first post and it will appear here.
          </Text>

          <Pressable
            style={styles.createButton}
            onPress={() => router.push('/tabs/create')}
          >
            <Text style={styles.createText}>Create Post</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={myPosts}
          numColumns={3}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <Image source={{ uri: item.image }} style={styles.gridImage} />
            </View>
          )}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={9}
          maxToRenderPerBatch={9}
          windowSize={5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
  },
  settingsButton: {
    padding: 6,
  },
  settingsIcon: {
    fontSize: 22,
  },
  profileTop: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
  },
  stats: {
    flex: 1,
    marginLeft: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#777',
  },
  bioBox: {
    paddingHorizontal: 18,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  bio: {
    marginTop: 5,
    color: '#555',
    fontSize: 14,
  },
  actions: {
    padding: 18,
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    color: '#fff',
    fontWeight: '700',
  },
  actionButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#111',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  grid: {
    padding: 1,
  },
  gridItem: {
    width: '33.333%',
    aspectRatio: 1,
    padding: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 50,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 21,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 6,
    color: '#777',
    textAlign: 'center',
  },
  createButton: {
    marginTop: 18,
    paddingHorizontal: 24,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: {
    color: '#fff',
    fontWeight: '700',
  },
});
