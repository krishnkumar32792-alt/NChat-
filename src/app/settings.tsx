import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../store/auth';
import { useProfileStore } from '../store/profile';
import { usePostStore } from '../store/posts';

export default function SettingsScreen() {
  const deleteAccount = useAuthStore(state => state.deleteAccount);
  const resetProfile = useProfileStore(state => state.resetProfile);
  const resetPosts = usePostStore(state => state.resetPosts);

  const comingSoon = (name: string) =>
    Alert.alert(name, `${name} settings coming soon.`);

  const showPrivacy = () =>
    Alert.alert(
      'Privacy Policy',
      'NChat respects your privacy. Current app data is stored locally on your device. NChat does not show your exact location to nearby users. Nearby discovery is opt-in and connection requests require acceptance before chat.'
    );

  const confirmDelete = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently remove your NChat account and locally stored NChat data from this device. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteAccount();
            resetProfile();
            resetPosts();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.item} onPress={() => router.push('/edit-profile')}>
          <Text style={styles.icon}>👤</Text>
          <View>
            <Text style={styles.itemTitle}>Edit Profile</Text>
            <Text style={styles.itemText}>Username, bio and avatar</Text>
          </View>
        </Pressable>

        <Pressable style={styles.item} onPress={() => router.push('/saved')}>
          <Text style={styles.icon}>🔖</Text>
          <View>
            <Text style={styles.itemTitle}>Saved Posts</Text>
            <Text style={styles.itemText}>View saved posts</Text>
          </View>
        </Pressable>

        <Pressable style={styles.item} onPress={() => comingSoon('Notifications')}>
          <Text style={styles.icon}>🔔</Text>
          <View>
            <Text style={styles.itemTitle}>Notifications</Text>
            <Text style={styles.itemText}>Notification preferences</Text>
          </View>
        </Pressable>

        <Pressable style={styles.item} onPress={showPrivacy}>
          <Text style={styles.icon}>🔒</Text>
          <View>
            <Text style={styles.itemTitle}>Privacy Policy</Text>
            <Text style={styles.itemText}>How NChat handles your data</Text>
          </View>
        </Pressable>

        <Pressable style={styles.item} onPress={() => comingSoon('About NChat')}>
          <Text style={styles.icon}>ℹ️</Text>
          <View>
            <Text style={styles.itemTitle}>About NChat</Text>
            <Text style={styles.itemText}>NChat information</Text>
          </View>
        </Pressable>

        <Pressable style={[styles.item, styles.deleteItem]} onPress={confirmDelete}>
          <Text style={styles.icon}>🗑️</Text>
          <View>
            <Text style={styles.deleteTitle}>Delete Account</Text>
            <Text style={styles.itemText}>Permanently delete your account and local data</Text>
          </View>
        </Pressable>
      </ScrollView>
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
  content: { padding: 16 },
  item: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deleteItem: {
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 0,
  },
  icon: { width: 50, fontSize: 24 },
  itemTitle: { fontSize: 16, fontWeight: '700' },
  deleteTitle: { fontSize: 16, fontWeight: '700', color: '#d00' },
  itemText: { marginTop: 3, color: '#777', fontSize: 13, maxWidth: 290 },
});
