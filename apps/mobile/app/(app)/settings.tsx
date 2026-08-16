import { ScrollView, Text, StyleSheet, Linking } from "react-native";
import { ROLE_LABELS } from "@anasac/shared";
import { useAuth } from "@/auth";
import { Card, CardTitle } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";

export default function SettingsScreen() {
  const { user, can } = useAuth();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen
        title="Configuración"
        description="Preferencias y arquitectura del monorepo."
      >
        <Card bubbles>
          <CardTitle>Organización</CardTitle>
          <Text style={styles.meta}>Asociación de Natación de Santa Cruz</Text>
          <Text style={styles.meta}>ANASAC · Costa Rica</Text>
          <Text
            style={[styles.meta, { color: colors.teal, fontWeight: "700" }]}
            onPress={() => Linking.openURL("https://anasaccr.com")}
          >
            anasaccr.com (sitio público intocable)
          </Text>
        </Card>

        <Card bubbles bubblePreset="panel">
          <CardTitle>Entorno</CardTitle>
          <Badge label="Mock / demo" tone="warning" />
          <Text style={styles.meta}>
            Usuario: {user?.fullName} · {user ? ROLE_LABELS[user.role] : ""}
          </Text>
          <Text style={styles.meta}>
            Gestionar usuarios: {can("users:manage") ? "Sí" : "No"}
          </Text>
        </Card>

        <Card bubbles bubblePreset="header">
          <CardTitle>Monorepo</CardTitle>
          <Text style={styles.meta}>apps/web — Dashboard Next.js</Text>
          <Text style={styles.meta}>apps/mobile — App Expo</Text>
          <Text style={styles.meta}>packages/shared — tipos, mocks, permisos</Text>
          <Text style={styles.meta}>
            Futuro dominio: dashboard.anasaccr.com (solo DNS del subdominio)
          </Text>
        </Card>
      </Screen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  meta: { marginTop: 8, color: "#64748b", fontSize: 13, lineHeight: 18 },
});
