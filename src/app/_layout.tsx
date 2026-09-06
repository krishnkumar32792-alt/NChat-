import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../store/auth';
import { usePostStore } from '../store/posts';
import { useProfileStore } from '../store/profile';
import { useNearbyStore } from '../store/nearby';

export default function RootLayout() {
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const hydratePosts = usePostStore((state) => state.hydrate);
  const hydrateProfile = useProfileStore((state) => state.hydrate);
  const hydrateNearby = useNearbyStore(state => state.hydrate);


  useEffect(() => {
    hydrateAuth();
    hydratePosts();
    hydrateProfile();
    hydrateNearby();
  }, [hydrateAuth, hydratePosts, hydrateProfile, hydrateNearby]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="tabs" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
