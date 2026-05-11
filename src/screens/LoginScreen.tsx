import Constants from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import AppHeader from '../components/AppHeader';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation, route }: any) {
  const { signin, signinWithGoogleCredential } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const redirectTo: string | undefined = route?.params?.redirectTo;
  const extra: any = (Constants?.expoConfig as any)?.extra || {};
  const googleClientIds = useMemo(() => ({
    webClientId: extra.googleWebClientId || extra.googleClientId,
    androidClientId: extra.googleAndroidClientId || extra.googleClientId,
    iosClientId: extra.googleIosClientId || extra.googleClientId,
  }), [extra.googleAndroidClientId, extra.googleClientId, extra.googleIosClientId, extra.googleWebClientId]);

  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    webClientId: googleClientIds.webClientId,
    androidClientId: googleClientIds.androidClientId,
    iosClientId: googleClientIds.iosClientId,
    selectAccount: true,
  });

  const finishSignIn = () => {
    if (redirectTo) navigation.replace(redirectTo);
    else navigation.goBack();
  };

  useEffect(() => {
    let cancelled = false;

    const completeGoogleSignIn = async () => {
      if (googleResponse?.type !== 'success') {
        if (googleResponse?.type === 'error') {
          showToast('Google sign-in failed. Please try again.', 'error');
        }
        setGoogleBusy(false);
        return;
      }

      const credential =
        googleResponse.params?.id_token ||
        (googleResponse.authentication as any)?.idToken;

      if (!credential) {
        showToast('Google did not return a valid identity token.', 'error');
        setGoogleBusy(false);
        return;
      }

      const res = await signinWithGoogleCredential(credential);
      if (cancelled) return;
      setGoogleBusy(false);

      if (res.ok) {
        showToast('Signed in with Google.', 'success');
        finishSignIn();
      } else {
        showToast(res.message, 'error');
      }
    };

    completeGoogleSignIn();

    return () => {
      cancelled = true;
    };
  }, [googleResponse, signinWithGoogleCredential]);

  const submit = async () => {
    if (!email.trim() || !password) {
      showToast('Please enter email and password.', 'error');
      return;
    }
    setBusy(true);
    const res = await signin(email.trim(), password);
    setBusy(false);
    if (res.ok) {
      showToast('Signed in successfully.', 'success');
      finishSignIn();
    } else {
      showToast(res.message, 'error');
    }
  };

  const submitGoogle = async () => {
    if (!googleClientIds.webClientId && !googleClientIds.androidClientId && !googleClientIds.iosClientId) {
      showToast('Google sign-in is not configured for this app.', 'error');
      return;
    }
    setGoogleBusy(true);
    const result = await promptGoogleAsync();
    if (result.type !== 'success') {
      setGoogleBusy(false);
      if (result.type === 'error') {
        showToast('Google sign-in failed. Please try again.', 'error');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="slim"
        title="Sign In"
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue shopping</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={!showPass}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.eye} onPress={() => setShowPass((s) => !s)}>
              <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btn} onPress={submit} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={[styles.googleBtn, (!googleRequest || googleBusy) && styles.disabledBtn]}
            onPress={submitGoogle}
            disabled={!googleRequest || googleBusy}
          >
            {googleBusy ? (
              <ActivityIndicator color="#182C5A" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => navigation.navigate('Signup', { redirectTo })}
          >
            <Text style={styles.linkText}>
              New here? <Text style={styles.linkAccent}>Create an account</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.linkAccent}>Forgot password?</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, paddingTop: 28 },
  title: { fontSize: 26, fontWeight: '700', color: '#182C5A' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 24 },
  label: { fontSize: 13, color: '#444', fontWeight: '600', marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#FAFAFA',
    marginTop: 6,
    marginBottom: 4,
  },
  passRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  eye: { padding: 10, marginLeft: 4 },
  btn: {
    backgroundColor: '#182C5A',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.4 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 14,
  },
  divider: { flex: 1, height: 1, backgroundColor: '#E4E7EC' },
  dividerText: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 12,
  },
  googleBtn: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#fff',
  },
  googleBtnText: { color: '#182C5A', fontWeight: '700', fontSize: 15 },
  disabledBtn: { opacity: 0.55 },
  linkBtn: { marginTop: 14, alignItems: 'center' },
  linkText: { fontSize: 13, color: '#666' },
  linkAccent: { color: '#182C5A', fontWeight: '600' },
});
