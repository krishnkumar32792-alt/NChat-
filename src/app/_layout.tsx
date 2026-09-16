import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { useAuthStore } from '../store/auth';
import { usePostStore } from '../store/posts';
import { useProfileStore } from '../store/profile';
import { useNearbyStore } from '../store/nearby';
import { useCallStore } from '../store/call';

export default function RootLayout() {
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const hydratePosts = usePostStore((state) => state.hydrate);
  const hydrateProfile = useProfileStore((state) => state.hydrate);
  const hydrateNearby = useNearbyStore(state => state.hydrate);
  const authHydrated = useAuthStore((state) => state.hydrated);
  const incomingCall = useCallStore((state) => state.incomingCall);
  const clearIncomingCall = useCallStore(
    (state) => state.clearIncomingCall
  );
  const listenForIncomingCalls = useCallStore(
    (state) => state.listenForIncomingCalls
  );


  useEffect(() => {
    hydrateAuth();
    hydratePosts();
    hydrateProfile();
    hydrateNearby();
  }, [hydrateAuth, hydratePosts, hydrateProfile, hydrateNearby]);

  useEffect(() => {
    if (!authHydrated) return;

    const stop = listenForIncomingCalls();
    return stop;
  }, [authHydrated, listenForIncomingCalls]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="tabs" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="call" />
      <Stack.Screen name="reset-password" />
    </Stack>

    {incomingCall && (
      <View style={styles.overlay}>
        <View style={styles.callCard}>
          <Text style={styles.callTitle}>
            Incoming {incomingCall.type === 'video' ? 'Video' : 'Voice'} Call
          </Text>

          <Text style={styles.callFrom}>
            Someone is calling you
          </Text>

          <View style={styles.callActions}>
            <Pressable
              style={styles.decline}
              onPress={() => {
                void useCallStore
                  .getState()
                  .declineCall(
                    incomingCall.callId,
                    incomingCall.peerId
                  );
                clearIncomingCall();
              }}
            >
              <Text style={styles.actionText}>Decline</Text>
            </Pressable>

            <Pressable
              style={styles.accept}
              onPress={() => {
                const call = incomingCall;
                clearIncomingCall();

                router.push({
                  pathname: '/call',
                  params: {
                    callId: call.callId,
                    peerId: call.peerId,
                    type: call.type,
                    incoming: 'true',
                  },
                });
              }}
            >
              <Text style={styles.actionText}>Accept</Text>
            </Pressable>
          </View>
        </View>
      </View>
    )}
    </>
  );
}


const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  callCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  callTitle: {
    fontSize: 21,
    fontWeight: '700',
  },
  callFrom: {
    marginTop: 8,
    color: '#666',
  },
  callActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  decline: {
    backgroundColor: '#e53935',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
  },
  accept: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
  },
});
