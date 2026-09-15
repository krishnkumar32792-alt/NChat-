import { useState } from 'react';
import {
  ActivityIndicator,
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
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    setMessage('');

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
      router.replace('/');
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
        style={[styles.button, loading && styles.disabled]}
        onPress={handleReset}
        disabled={loading}
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
    backgroundColor: '#f7f7f7',
  },
  logo: {
    textAlign: 'center',
    fontSize: 42,
    fontWeight: '900',
    marginBottom: 24,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 22,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
  },
  message: {
    marginBottom: 14,
    color: '#555',
  },
  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
