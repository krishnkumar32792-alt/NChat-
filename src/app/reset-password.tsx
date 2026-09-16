import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadRecoverySession = async () => {
      try {
        const url = await Linking.getInitialURL();

        if (url) {
          const hash = url.split('#')[1] ?? '';
          const params = new URLSearchParams(hash);

          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.log('RECOVERY SESSION ERROR:', error.message);
              setMessage(error.message);
              return;
            }
          }
        }

        const { data } = await supabase.auth.getSession();

        if (data.session) {
          setSessionReady(true);
        } else {
          setMessage('Auth session missing!');
        }
      } catch (error) {
        console.log('RECOVERY ERROR:', error);
        setMessage('Could not open password recovery session.');
      }
    };

    loadRecoverySession();
  }, []);

  const handleReset = async () => {
    setMessage('');

    if (!sessionReady) {
      setMessage('Auth session missing!');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    if (password !== confirm) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Password updated successfully');

    setTimeout(() => {
      router.replace('/tabs/feed');
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>NChat</Text>

      <Text style={styles.title}>Reset Password</Text>

      <Text style={styles.subtitle}>
        Create a new password for your account.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="New password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        placeholderTextColor="#888"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        editable={!loading}
      />

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Pressable
        style={[styles.button, (loading || !sessionReady) && styles.disabled]}
        onPress={handleReset}
        disabled={loading || !sessionReady}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Password</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 45,
    color: '#000',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 28,
  },
  input: {
    height: 58,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 18,
    paddingHorizontal: 18,
    fontSize: 17,
    marginBottom: 14,
    color: '#000',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginVertical: 12,
  },
  button: {
    height: 58,
    borderRadius: 18,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
