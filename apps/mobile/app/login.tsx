import { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { DEMO_PASSWORD } from "@anasac/shared";
import { useAuth } from "@/auth";
import { Bubbles } from "@/components/Bubbles";
import { Button, Input } from "@/components/ui";
import { colors } from "@/theme";

export default function LoginScreen() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@anasaccr.com");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && user) {
    return <Redirect href="/(app)" />;
  }

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "No se pudo iniciar sesión.");
      return;
    }
    router.replace("/(app)");
  }

  return (
    <LinearGradient colors={[colors.navy, colors.teal, "#1a7a72"]} style={{ flex: 1 }}>
      <Bubbles preset="hero" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.logoBox}>
              <Image
                source={require("../assets/anasac-logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.eyebrow}>Asociación de Natación</Text>
            <Text style={styles.heroTitle}>ANASAC Dashboard</Text>
            <Text style={styles.heroText}>
              Panel móvil para nadadores, competencias, calendario y pagos.
            </Text>
          </View>

          <View style={styles.card}>
            <Bubbles preset="panel" />
            <Text style={styles.cardTitle}>Iniciar sesión</Text>
            <Text style={styles.cardHint}>Accede con una cuenta de demostración.</Text>

            <Text style={styles.label}>Correo electrónico</Text>
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Contraseña</Text>
            <Input
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              title={submitting ? "Ingresando..." : "Entrar"}
              onPress={onSubmit}
              disabled={submitting}
              style={{ marginTop: 16 }}
            />

            <View style={styles.demoBox}>
              <Bubbles preset="card" />
              <Text style={styles.demoTitle}>Cuentas demo</Text>
              <Text style={styles.demoLine}>admin@anasaccr.com — Administrador</Text>
              <Text style={styles.demoLine}>entrenador@anasaccr.com — Entrenador</Text>
              <Text style={styles.demoLine}>nadador@anasaccr.com — Nadador</Text>
              <Text style={[styles.demoLine, { marginTop: 6 }]}>
                Contraseña: {DEMO_PASSWORD}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingTop: 64,
    paddingBottom: 40,
  },
  hero: {
    marginBottom: 20,
  },
  logoBox: {
    width: 112,
    height: 64,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    overflow: "hidden",
  },
  logo: {
    width: 100,
    height: 56,
  },
  eyebrow: {
    color: colors.aqua,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heroTitle: {
    marginTop: 8,
    color: colors.white,
    fontSize: 32,
    fontWeight: "800",
  },
  heroText: {
    marginTop: 8,
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 320,
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
    zIndex: 1,
  },
  cardHint: {
    marginTop: 4,
    marginBottom: 12,
    color: "#64748b",
    zIndex: 1,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    color: colors.navy,
    fontWeight: "600",
    fontSize: 13,
    zIndex: 1,
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
  demoBox: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.mist,
    padding: 12,
    overflow: "hidden",
  },
  demoTitle: {
    color: colors.navy,
    fontWeight: "700",
    marginBottom: 6,
    zIndex: 1,
  },
  demoLine: {
    color: "#475569",
    fontSize: 12,
    zIndex: 1,
  },
});
