import React, { useEffect } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useLocalSearchParams, router } from 'expo-router';
import { useCallStore } from '@/store/call';

export default function CallScreen() {
  const params = useLocalSearchParams<{
    peerId: string;
    type: 'audio' | 'video';
    callId?: string;
    incoming?: string;
  }>();

  const peerId = String(params.peerId ?? '');
  const type = params.type === 'video' ? 'video' : 'audio';
  const incoming = params.incoming === 'true';

  const {
    status,
    localStream,
    remoteStream,
    muted,
    cameraOff,
    startCall,
    acceptCall,
    declineCall,
    toggleMute,
    toggleCamera,
    endCall,
  } = useCallStore();

  useEffect(() => {
    if (!peerId) return;

    if (incoming && params.callId) {
      void acceptCall(params.callId, peerId, type);
    } else if (!incoming) {
      void startCall(peerId, type);
    }
  }, [peerId, type, incoming, params.callId, acceptCall, startCall]);

  useEffect(() => {
    if (status === 'idle' || status === 'ended') {
      router.back();
    }
  }, [status]);

  const handleDecline = async () => {
    if (params.callId) {
      await declineCall(params.callId, peerId);
    }
    router.back();
  };

  const handleEnd = async () => {
    await endCall();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {type === 'video' && remoteStream ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      ) : (
        <View style={styles.audioArea}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>N</Text>
          </View>

          <Text style={styles.name}>{peerId}</Text>
          <Text style={styles.status}>{status}</Text>
        </View>
      )}

      {type === 'video' && localStream ? (
        <View style={styles.preview}>
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.previewVideo}
            objectFit="cover"
          />
        </View>
      ) : null}

      <View style={styles.controls}>
        {incoming && status === 'ringing' ? (
          <>
            <Pressable style={styles.decline} onPress={handleDecline}>
              <Text style={styles.controlText}>Decline</Text>
            </Pressable>

            <Pressable
              style={styles.accept}
              onPress={() =>
                params.callId &&
                void acceptCall(params.callId, peerId, type)
              }
            >
              <Text style={styles.controlText}>Accept</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={styles.button} onPress={toggleMute}>
              <Text style={styles.controlText}>
                {muted ? 'Unmute' : 'Mute'}
              </Text>
            </Pressable>

            {type === 'video' ? (
              <Pressable style={styles.button} onPress={toggleCamera}>
                <Text style={styles.controlText}>
                  {cameraOff ? 'Camera On' : 'Camera Off'}
                </Text>
              </Pressable>
            ) : null}

            <Pressable style={styles.end} onPress={handleEnd}>
              <Text style={styles.controlText}>End</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  remoteVideo: {
    ...StyleSheet.absoluteFill,
  },
  preview: {
    position: 'absolute',
    top: 24,
    right: 18,
    width: 110,
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffffff55',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
  audioArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#208AEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '800',
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 18,
  },
  status: {
    color: '#bbb',
    fontSize: 15,
    marginTop: 6,
  },
  controls: {
    position: 'absolute',
    bottom: 35,
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    minWidth: 86,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  accept: {
    minWidth: 100,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 28,
    backgroundColor: '#20b85a',
    alignItems: 'center',
  },
  decline: {
    minWidth: 100,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 28,
    backgroundColor: '#d93636',
    alignItems: 'center',
  },
  end: {
    minWidth: 86,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: '#d93636',
    alignItems: 'center',
  },
  controlText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
