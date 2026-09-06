import { router } from 'expo-router';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { usePostStore } from '@/store/posts';
import { useProfileStore } from '@/store/profile';

export default function ProfileScreen() {
  const posts = usePostStore((state) => state.posts);
  const profile = useProfileStore((state) => state.profile);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>{profile.username}</Text>

        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.logout}>Log out</Text>
        </Pressable>
      </View>

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>X</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.number}>{posts.length}</Text>
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

      <Pressable style={styles.editButton} onPress={() => router.push("/tabs/edit-profile")}>
        <Text style={styles.editText}>Edit Profile</Text>
      </Pressable>

      <View style={styles.divider} />

      <Text style={styles.postsTitle}>My Posts</Text>

      {posts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptyText}>
            Your posts will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.postGrid}>
          {posts.map((post) => (
            <View key={post.id} style={styles.gridItem}>
              <Text style={styles.gridImage}>📷</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 35,
  },

  header: {
    height: 55,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  username: {
    fontSize: 22,
    fontWeight: '900',
  },

  logout: {
    fontWeight: '700',
  },

  profile: {
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
  },

  editButton: {
    marginHorizontal: 20,
    marginTop: 15,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editText: {
    fontWeight: '800',
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
    paddingTop: 50,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
  },

  emptyText: {
    color: '#777',
    marginTop: 6,
  },

  postGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  gridItem: {
    width: '33.33%',
    height: 120,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },

  gridImage: {
    fontSize: 30,
  },
});
