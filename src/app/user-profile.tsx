import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useUserStore } from '@/store/users';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const user = useUserStore((state) =>
    state.users.find((item) => item.id === id)
  );

  const toggleFollow = useUserStore((state) => state.toggleFollow);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>User not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const initial = user.username.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹</Text>
        </Pressable>

        <Text style={styles.headerName}>{user.username}</Text>

        <Pressable onPress={() => {}} hitSlop={10}>
          <Text style={styles.more}>•••</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <Text style={styles.username}>{user.username}</Text>

          <Text style={styles.bio}>
            {user.bio || 'Hey! I am using NChat 👋'}
          </Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.number}>{user.followers}</Text>
              <Text style={styles.label}>Followers</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.stat}>
              <Text style={styles.number}>{user.following}</Text>
              <Text style={styles.label}>Following</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <Pressable
              style={[
                styles.followButton,
                user.followed && styles.followingButton,
              ]}
              onPress={() => toggleFollow(user.id)}
            >
              <Text
                style={[
                  styles.followText,
                  user.followed && styles.followingText,
                ]}
              >
                {user.followed ? '✓ Following' : '+ Follow'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.messageButton}
              onPress={() =>
                router.push({
                  pathname: '/chat',
                  params: { id: user.id },
                })
              }
            >
              <Text style={styles.messageText}>💬 Message</Text>
            </Pressable>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>About</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>👤</Text>
              <Text style={styles.infoText}>@{user.username}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>💬</Text>
              <Text style={styles.infoText}>Available on NChat</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🔒</Text>
              <Text style={styles.infoText}>Private & secure chat</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFound: {
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    marginTop: 18,
    backgroundColor: '#111',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  header: {
    height: 65,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  back: {
    fontSize: 38,
    lineHeight: 40,
  },
  headerName: {
    fontSize: 19,
    fontWeight: '900',
  },
  more: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scroll: {
    paddingBottom: 40,
  },
  profile: {
    alignItems: 'center',
    padding: 25,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  avatarText: {
    fontSize: 42,
    fontWeight: '900',
  },
  username: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 15,
  },
  bio: {
    color: '#666',
    marginTop: 7,
    textAlign: 'center',
    fontSize: 15,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    paddingVertical: 5,
  },
  stat: {
    alignItems: 'center',
    width: 110,
  },
  number: {
    fontSize: 20,
    fontWeight: '900',
  },
  label: {
    color: '#777',
    marginTop: 3,
    fontSize: 13,
  },
  divider: {
    height: 35,
    width: 1,
    backgroundColor: '#ddd',
  },
  buttons: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 25,
  },
  followButton: {
    flex: 1,
    height: 46,
    backgroundColor: '#111',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: '#eee',
  },
  followText: {
    color: '#fff',
    fontWeight: '900',
  },
  followingText: {
    color: '#111',
  },
  messageButton: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontWeight: '900',
  },
  infoCard: {
    width: '100%',
    marginTop: 30,
    padding: 18,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 16,
    backgroundColor: '#fafafa',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },
  infoIcon: {
    width: 30,
    fontSize: 16,
  },
  infoText: {
    color: '#444',
    fontSize: 14,
  },
});
