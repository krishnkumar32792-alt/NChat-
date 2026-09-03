import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useUserStore } from '@/store/users';

export function usePresence(userId: string) {
  const setOnline = useUserStore((state) => state.setOnline);

  useEffect(() => {
    if (!userId) return;

    setOnline(userId, true);

    const subscription = AppState.addEventListener(
      'change',
      (state) => {
        setOnline(userId, state === 'active');
      }
    );

    return () => {
      subscription.remove();
      setOnline(userId, false);
    };
  }, [userId, setOnline]);
}
