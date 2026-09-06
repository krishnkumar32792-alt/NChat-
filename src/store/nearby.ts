import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type NearbyRequest = {
  id: string;
  fromUsername: string;
  fromName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
};

type NearbyState = {
  requests: NearbyRequest[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  sendRequest: (fromUsername: string, fromName: string) => Promise<void>;
  updateRequest: (id: string, status: 'accepted' | 'declined') => Promise<void>;
};

const KEY = '@nchat_nearby_requests';

const save = async (requests: NearbyRequest[]) => {
  await AsyncStorage.setItem(KEY, JSON.stringify(requests));
};

export const useNearbyStore = create<NearbyState>((set, get) => ({
  requests: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const requests: NearbyRequest[] = raw ? JSON.parse(raw) : [];
      set({ requests, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  sendRequest: async (fromUsername, fromName) => {
    const existing = get().requests.some(
      item =>
        item.fromUsername.toLowerCase() === fromUsername.trim().toLowerCase() &&
        item.status === 'pending'
    );

    if (existing) return;

    const request: NearbyRequest = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fromUsername: fromUsername.trim(),
      fromName: fromName.trim() || fromUsername.trim(),
      status: 'pending',
      createdAt: Date.now(),
    };

    const requests = [request, ...get().requests];
    await save(requests);
    set({ requests });
  },

  updateRequest: async (id, status) => {
    const requests = get().requests.map(item =>
      item.id === id ? { ...item, status } : item
    );

    await save(requests);
    set({ requests });
  },
}));
