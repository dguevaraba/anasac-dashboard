import { useState, type ReactNode } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { Redirect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "@/auth";
import { Bubbles } from "@/components/Bubbles";
import { Button, Input } from "@/components/ui";
import { isSupabaseConfigured } from "@/supabase/config";
import { colors } from "@/theme";

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        fill="#EA4335"
        d="M12 5.4c1.5 0 2.9.5 3.9 1.6l2.9-2.9C17.2 2.4 14.8 1.4 12 1.4 7.3 1.4 3.3 4.2 1.7 8.4l3.4 2.6C6 7.7 8.7 5.4 12 5.4z"
      />
      <Path
        fill="#4285F4"
        d="M22.6 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h5.9c-.3 1.4-1.1 2.6-2.3 3.4l3.5 2.7c2.1-1.9 3.5-4.8 3.5-8.2z"
      />
      <Path
        fill="#FBBC05"
        d="M5.1 14.3c-.3-.9-.5-1.8-.5-2.8s.2-1.9.5-2.8L1.7 6.1C.9 7.8.4 9.8.4 11.5s.5 3.7 1.3 5.4l3.4-2.6z"
      />
      <Path
        fill="#34A853"
        d="M12 22.6c2.8 0 5.1-.9 6.8-2.5l-3.5-2.7c-.9.6-2.1 1-3.3 1-3.3 0-6-2.2-7-5.3L1.7 16.9C3.3 21.1 7.3 22.6 12 22.6z"
      />
    </Svg>
  );
}

function MicrosoftIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 23 23">
      <Path fill="#f25022" d="M1 1h10v10H1z" />
      <Path fill="#00a4ef" d="M12 1h10v10H12z" />
      <Path fill="#7fba00" d="M1 12h10v10H1z" />
      <Path fill="#ffb900" d="M12 12h10v10H12z" />
    </Svg>
  );
}

function OAuthButton({
  label,
  loadingLabel,
  loading,
  disabled,
  onPress,
  icon,
}: {
  label: string;
  loadingLabel: string;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
  icon: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.oauthButton,
        pressed && { opacity: 0.85 },
        disabled && { opacity: 0.55 },
      ]}
    >
      {icon}
      <Text style={styles.oauthText}>{loading ? loadingLabel : label}</Text>
    </Pressable>
  );
}

export default function LoginScreen() {
  const { login, loginWithGoogle, loginWithMicrosoft, user, isLoading } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "azure" | null>(
    null,
  );
  const configured = isSupabaseConfigured();

  if (!isLoading && user) {
    return <Redirect href="/(app)" />;
  }

  async function onOAuth(provider: "google" | "azure") {
    setError(null);
    setOauthLoading(provider);
    const result =
      provider === "google"
        ? await loginWithGoogle()
        : await loginWithMicrosoft();
    setOauthLoading(null);
    if (!result.ok) {
      setError(
        result.error ??
          (provider === "google"
            ? "No se pudo conectar con Google."
            : "No se pudo conectar con Microsoft."),
      );
    }
    // La navegación la hace <Redirect> al setear user.
  }

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "No se pudo iniciar sesión.");
    }
    // La navegación la hace <Redirect> al setear user.
  }

  const busy = submitting || oauthLoading !== null;

  return (
    <LinearGradient colors={[colors.navy, colors.teal, "#1a7a72"]} style={{ flex: 1 }}>
      <Bubbles preset="hero" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Bubbles preset="panel" />
            <View style={styles.logoWrap}>
              <View style={styles.logoBox}>
                <Image
                  source={require("../assets/anasac-logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.cardTitle}>Iniciar sesión</Text>

            {!configured ? (
              <Text style={styles.warn}>
                Falta configurar la conexión con el servidor.
              </Text>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.oauthStack}>
              <OAuthButton
                icon={<GoogleIcon />}
                label="Continuar con Google"
                loadingLabel="Conectando..."
                loading={oauthLoading === "google"}
                disabled={!configured || busy}
                onPress={() => void onOAuth("google")}
              />
              <OAuthButton
                icon={<MicrosoftIcon />}
                label="Continuar con Microsoft"
                loadingLabel="Conectando..."
                loading={oauthLoading === "azure"}
                disabled={!configured || busy}
                onPress={() => void onOAuth("azure")}
              />
            </View>

            <View style={styles.dividerWrap}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o con correo</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.label}>Correo electrónico</Text>
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="email-address"
              textContentType="username"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordWrap}>
              <Input
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                textContentType="password"
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
                style={styles.passwordInput}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={colors.teal}
                />
              </Pressable>
            </View>

            <Button
              title={submitting ? "Ingresando..." : "Entrar"}
              onPress={onSubmit}
              disabled={!configured || busy}
              style={{ marginTop: 16 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingTop: 48,
    paddingBottom: 40,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 16,
    zIndex: 1,
  },
  logoBox: {
    width: 168,
    height: 96,
    borderRadius: 18,
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: {
    width: 148,
    height: 84,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
  },
  cardTitle: {
    color: colors.navy,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    zIndex: 1,
  },
  oauthStack: {
    gap: 10,
    marginTop: 8,
    zIndex: 1,
  },
  oauthButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  oauthText: {
    color: colors.navy,
    fontWeight: "700",
    fontSize: 14,
  },
  dividerWrap: {
    marginVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 1,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    color: colors.navy,
    fontWeight: "600",
    fontSize: 13,
    zIndex: 1,
  },
  passwordWrap: {
    position: "relative",
    zIndex: 1,
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    marginTop: 10,
    color: "#b91c1c",
    backgroundColor: "#fef2f2",
    padding: 10,
    borderRadius: 10,
    overflow: "hidden",
    zIndex: 1,
  },
  warn: {
    marginTop: 10,
    color: "#92400e",
    backgroundColor: "#fffbeb",
    padding: 10,
    borderRadius: 10,
    overflow: "hidden",
    zIndex: 1,
  },
});
