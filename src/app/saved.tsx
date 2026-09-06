import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { usePostStore } from '@/store/posts';

export default function SavedScreen() {
  const posts = usePostStore((state) => state.posts);
  const toggleSave = usePostStore((state) => state.toggleSave);

  const savedPosts = posts.filter((post) => post.saved);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Saved Posts</Text>
        <View style={{ width: 30 }} />
      </View>

      {savedPosts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.icon}>🔖</Text>
          <Text style={styles.emptyTitle}>No Saved Posts</Text>
          <Text style={styles.emptyText}>
            Feed mein save ki hui posts yahan dikhenगी.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedPosts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.image} />

              <View style={styles.info}>
                <Text style={styles.username}>@{item.username}</Text>

                {!!item.caption && (
                  <Text style={styles.caption}>{item.caption}</Text>
                )}

                <View style={styles.row}>
                  <Text>❤️ {item.likes}</Text>

                  <Pressable onPress={() => toggleSave(item.id)}>
                    <Text style={styles.remove}>🔖 Remove</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  back: { fontSize: 38 },
  title: { fontSize: 20, fontWeight: '700' },
  list: { padding: 12 },
  card: {
    marginBottom: 18,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f6f6f6',
  },
  image: {
    width: '100%',
    height: 330,
    backgroundColor: '#ddd',
  },
  info: { padding: 12 },
  username: { fontSize: 16, fontWeight: '700' },
  caption: { marginTop: 6, color: '#444' },
  row: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  remove: { fontWeight: '700' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  icon: { fontSize: 52 },
  emptyTitle: { marginTop: 12, fontSize: 22, fontWeight: '700' },
  emptyText: {
    marginTop: 8,
    color: '#777',
    textAlign: 'center',
  },
});
