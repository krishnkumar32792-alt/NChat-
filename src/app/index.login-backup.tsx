import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

export default function HomeScreen() {
  const [screen, setScreen] = useState<'login' | 'signup'>('login');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      return;
    }

    console.log('Login:', email);
  };

  const handleSignup = () => {
    if (!username || !email || !password) {
      return;
    }

    console.log('Signup:', username, email);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {screen === 'signup' && (
          <Pressable onPress={() => setScreen('login')}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>
        )}

        <View style={styles.logoBox}>
          <Text style={styles.logo}>NChat</Text>

          <Text style={styles.tagline}>
            {screen === 'login'
              ? 'Connect. Share. Chat.'
              : 'Create your account'}
          </Text>
        </View>

        <View style={styles.card}>
          {screen === 'login' ? (
            <>
              <Text style={styles.heading}>Welcome back 👋</Text>

              <Text style={styles.subheading}>
                Login to continue to NChat
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Email or username"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Pressable>
                <Text style={styles.forgot}>Forgot password?</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleLogin}
              >
                <Text style={styles.primaryText}>Log In</Text>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.line} />
                <Text style={styles.or}>OR</Text>
                <View style={styles.line} />
              </View>

              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setEmail('');
                  setPassword('');
                  setScreen('signup');
                }}
              >
                <Text style={styles.secondaryText}>
                  Create new account
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.heading}>Join NChat 🚀</Text>

              <Text style={styles.subheading}>
                Create your account to get started.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#888"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleSignup}
              >
                <Text style={styles.primaryText}>
                  Create Account
                </Text>
              </Pressable>

              <View style={styles.loginRow}>
                <Text style={styles.loginLabel}>
                  Already have an account?
                </Text>

                <Pressable onPress={() => setScreen('login')}>
                  <Text style={styles.loginLink}> Log in</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>

        <Text style={styles.footer}>
          © 2026 NChat — Your social space
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  back: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },

  logoBox: {
    alignItems: 'center',
    marginBottom: 30,
  },

  logo: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },

  tagline: {
    marginTop: 6,
    color: '#666',
    fontSize: 15,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },

  heading: {
    fontSize: 25,
    fontWeight: '800',
    marginBottom: 6,
  },

  subheading: {
    color: '#666',
    marginBottom: 22,
    fontSize: 14,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    marginBottom: 12,
    backgroundColor: '#fafafa',
    color: '#111',
  },

  forgot: {
    textAlign: 'right',
    fontWeight: '600',
    marginBottom: 18,
  },

  primaryButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.7,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },

  or: {
    marginHorizontal: 12,
    color: '#888',
    fontSize: 12,
    fontWeight: '700',
  },

  secondaryButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryText: {
    fontSize: 15,
    fontWeight: '700',
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },

  loginLabel: {
    color: '#666',
  },

  loginLink: {
    fontWeight: '800',
  },

  footer: {
    textAlign: 'center',
    color: '#888',
    marginTop: 25,
    fontSize: 12,
  },
});
