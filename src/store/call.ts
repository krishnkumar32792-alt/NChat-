import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';

export type CallType = 'audio' | 'video';

export type CallStatus =
  | 'idle'
  | 'calling'
  | 'ringing'
  | 'connecting'
  | 'connected'
  | 'ended';

export type IncomingCall = {
  callId: string;
  peerId: string;
  type: CallType;
};

type SignalPayload = {
  sdp?: string;
  sdpType?: 'offer' | 'answer';
  callType?: CallType;
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
};

type CallState = {
  callId: string | null;
  peerId: string | null;
  type: CallType | null;
  status: CallStatus;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  muted: boolean;
  cameraOff: boolean;
  incomingCall: IncomingCall | null;

  startCall: (peerId: string, type: CallType) => Promise<string | null>;
  acceptCall: (
    callId: string,
    peerId: string,
    type: CallType
  ) => Promise<boolean>;
  declineCall: (callId: string, peerId: string) => Promise<void>;
  toggleMute: () => void;
  toggleCamera: () => void;
  endCall: () => Promise<void>;
  clearIncomingCall: () => void;
  listenForIncomingCalls: () => () => void;
  reset: () => void;
};

let peer: RTCPeerConnection | null = null;
let signalChannel: ReturnType<typeof supabase.channel> | null = null;
let remoteDescriptionReady = false;
let pendingIceCandidates: RTCIceCandidate[] = [];

const sendSignal = async (
  callId: string,
  receiverId: string,
  type: string,
  payload: SignalPayload = {}
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { error } = await supabase.from('call_signals').insert({
    id: `${callId}-${type}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    call_id: callId,
    sender_id: user.id,
    receiver_id: receiverId,
    type,
    payload,
  });

  if (error) {
    console.log('CALL_SIGNAL_ERROR:', error.message);
    return false;
  }

  return true;
};

const stopPeer = () => {
  remoteDescriptionReady = false;
  pendingIceCandidates = [];

  if (peer) {
    peer.onicecandidate = null;
    peer.ontrack = null;
    peer.close();
    peer = null;
  }
};

const stopSignalChannel = async () => {
  if (signalChannel) {
    await supabase.removeChannel(signalChannel);
    signalChannel = null;
  }
};

const createPeer = async (
  callId: string,
  peerId: string,
  type: CallType,
  set: (
    partial:
      | Partial<CallState>
      | ((state: CallState) => Partial<CallState>)
  ) => void
) => {
  stopPeer();

  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  });

  peer = pc;

  const stream = await mediaDevices.getUserMedia({
    audio: true,
    video:
      type === 'video'
        ? {
            facingMode: 'user',
            width: 640,
            height: 480,
            frameRate: 24,
          }
        : false,
  });

  stream.getTracks().forEach((track) => {
    pc.addTrack(track, stream);
  });

  pc.ontrack = (event: any) => {
    const remote = event.streams?.[0];

    if (remote) {
      set({
        remoteStream: remote,
        status: 'connected',
      });
    }
  };

  pc.onicecandidate = (event: any) => {
    if (!event.candidate) return;

    void sendSignal(callId, peerId, 'ice', {
      candidate: event.candidate.candidate,
      sdpMid: event.candidate.sdpMid,
      sdpMLineIndex: event.candidate.sdpMLineIndex,
    });
  };

  set({
    localStream: stream,
    status: 'connecting',
  });

  return pc;
};

const listenForSignals = async (
  callId: string,
  peerId: string,
  set: (
    partial:
      | Partial<CallState>
      | ((state: CallState) => Partial<CallState>)
  ) => void
) => {
  await stopSignalChannel();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  signalChannel = supabase
    .channel(`nchat-call-${callId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'call_signals',
        filter: `receiver_id=eq.${user.id}`,
      },
      async (payload) => {
        const row = payload.new as {
          call_id: string;
          sender_id: string;
          type: string;
          payload: SignalPayload | null;
        };

        if (row.call_id !== callId || row.sender_id !== peerId) return;

        const data = row.payload ?? {};

        try {
          if (!peer) return;

          if (row.type === 'answer' && data.sdp) {
            await peer.setRemoteDescription(
              new RTCSessionDescription({
                type: 'answer',
                sdp: data.sdp,
              })
            );

            remoteDescriptionReady = true;

            for (const candidate of pendingIceCandidates) {
              await peer.addIceCandidate(candidate);
            }

            pendingIceCandidates = [];
            set({ status: 'connected' });
          }

          if (row.type === 'ice' && data.candidate) {
            const candidate = new RTCIceCandidate({
              candidate: data.candidate,
              sdpMid: data.sdpMid ?? undefined,
              sdpMLineIndex: data.sdpMLineIndex ?? undefined,
            });

            if (remoteDescriptionReady) {
              await peer.addIceCandidate(candidate);
            } else {
              pendingIceCandidates.push(candidate);
            }
          }

          if (row.type === 'decline') {
            set({ status: 'ended' });
            useCallStore.getState().reset();
          }

          if (row.type === 'hangup') {
            set({ status: 'ended' });
            useCallStore.getState().reset();
          }
        } catch (error) {
          console.log('CALL_SIGNAL_PROCESS_ERROR:', error);
        }
      }
    )
    .subscribe();
};

const listenForIncomingCallsImpl = (
  set: (
    partial:
      | Partial<CallState>
      | ((state: CallState) => Partial<CallState>)
  ) => void
) => {
  let channel: ReturnType<typeof supabase.channel> | null = null;
  let active = true;

  const setup = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !active) return;

    channel = supabase
      .channel(`nchat-incoming-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as {
            call_id: string;
            sender_id: string;
            type: string;
            payload: SignalPayload | null;
          };

          if (!active || row.type !== 'offer') return;

          const state = useCallStore.getState();

          if (state.status !== 'idle' || state.incomingCall) {
            return;
          }

          const data = row.payload ?? {};

          set({
            incomingCall: {
              callId: row.call_id,
              peerId: row.sender_id,
              type: data.callType ?? 'audio',
            },
            status: 'ringing',
          });
        }
      )
      .subscribe();
  };

  void setup();

  return () => {
    active = false;

    if (channel) {
      void supabase.removeChannel(channel);
      channel = null;
    }
  };
};

export const useCallStore = create<CallState>((set, get) => ({
  callId: null,
  peerId: null,
  type: null,
  status: 'idle',
  localStream: null,
  remoteStream: null,
  muted: false,
  cameraOff: false,
  incomingCall: null,

  startCall: async (peerId, type) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const callId = `${user.id}-${peerId}-${Date.now()}`;

      set({
        callId,
        peerId,
        type,
        status: 'calling',
        muted: false,
        cameraOff: false,
      });

      await createPeer(callId, peerId, type, set);

      await listenForSignals(callId, peerId, set);

      const offer = await peer!.createOffer();
      await peer!.setLocalDescription(offer);

      await sendSignal(callId, peerId, 'offer', {
        sdp: offer.sdp ?? undefined,
        sdpType: 'offer',
        callType: type,
      });

      return callId;
    } catch (error) {
      console.log('START_CALL_ERROR:', error);
      get().reset();
      return null;
    }
  },

  acceptCall: async (callId, peerId, type) => {
    try {
      set({
        callId,
        peerId,
        type,
        status: 'connecting',
        muted: false,
        cameraOff: false,
        incomingCall: null,
      });

      await createPeer(callId, peerId, type, set);
      await listenForSignals(callId, peerId, set);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return false;

      const { data, error } = await supabase
        .from('call_signals')
        .select('payload')
        .eq('call_id', callId)
        .eq('sender_id', peerId)
        .eq('receiver_id', user.id)
        .eq('type', 'offer')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data?.payload?.sdp || !peer) {
        console.log('ACCEPT_CALL_OFFER_ERROR:', error?.message);
        get().reset();
        return false;
      }

      const offer = data.payload as SignalPayload;

      await peer.setRemoteDescription(
        new RTCSessionDescription({
          type: 'offer',
          sdp: offer.sdp ?? '',
        })
      );

      remoteDescriptionReady = true;

      for (const candidate of pendingIceCandidates) {
        await peer.addIceCandidate(candidate);
      }

      pendingIceCandidates = [];

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      await sendSignal(callId, peerId, 'answer', {
        sdp: answer.sdp ?? undefined,
        sdpType: 'answer',
      });

      return true;
    } catch (error) {
      console.log('ACCEPT_CALL_ERROR:', error);
      get().reset();
      return false;
    }
  },

  declineCall: async (callId, peerId) => {
    await sendSignal(callId, peerId, 'decline');
    set({
      incomingCall: null,
      status: 'idle',
    });
  },

  toggleMute: () => {
    const stream = get().localStream;
    if (!stream) return;

    const next = !get().muted;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !next;
    });

    set({ muted: next });
  },

  toggleCamera: () => {
    const stream = get().localStream;
    if (!stream) return;

    const next = !get().cameraOff;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = !next;
    });

    set({ cameraOff: next });
  },

  endCall: async () => {
    const { callId, peerId } = get();

    if (callId && peerId) {
      await sendSignal(callId, peerId, 'hangup');
    }

    get().reset();
  },

  clearIncomingCall: () => {
    set({
      incomingCall: null,
      status: 'idle',
    });
  },

  listenForIncomingCalls: () => {
    return listenForIncomingCallsImpl(set);
  },

  reset: () => {
    const stream = get().localStream;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    stopPeer();
    void stopSignalChannel();

    set({
      callId: null,
      peerId: null,
      type: null,
      status: 'idle',
      localStream: null,
      remoteStream: null,
      muted: false,
      cameraOff: false,
      incomingCall: null,
    });
  },
}));
