import { ScrollView, Text, StyleSheet, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ROLE_LABELS, formatDate } from "@anasac/shared";
import { useAuth } from "@/auth";
import { Card, CardTitle } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { Bubbles } from "@/components/Bubbles";
import { colors } from "@/theme";

export default function ProfileScreen() {
  const { user, permissions, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen title="Mi perfil" description="Cuenta activa en modo demostración.">
        <Card bubbles bubblePreset="hero" style={{ alignItems: "center" }}>
          <View style={styles.avatarWrap}>
            <Bubbles preset="card" />
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.fullName
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.meta}>{user.email}</Text>
          <View style={{ marginTop: 10 }}>
            <Badge label={ROLE_LABELS[user.role]} tone="navy" />
          </View>
        </Card>

        <Card bubbles>
          <CardTitle>Detalles</CardTitle>
          <Text style={styles.meta}>Teléfono: {user.phone ?? "—"}</Text>
          <Text style={styles.meta}>Creado: {formatDate(user.createdAt)}</Text>
          <Text style={styles.meta}>Actualizado: {formatDate(user.updatedAt)}</Text>
        </Card>

        <Card bubbles bubblePreset="panel">
          <CardTitle>Permisos</CardTitle>
          <View style={styles.perms}>
            {permissions.map((p) => (
              <Badge key={p} label={p} />
            ))}
          </View>
        </Card>

        <Pressable
          style={styles.logout}
          onPress={async () => {
            await logout();
            router.replace("/login");
          }}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </Screen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  avatarText: { color: colors.white, fontWeight: "800", fontSize: 22 },
  name: { color: colors.navy, fontWeight: "800", fontSize: 20, textAlign: "center" },
  meta: { marginTop: 6, color: "#64748b", fontSize: 13 },
  perms: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  logout: {
    marginTop: 8,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  logoutText: { color: "#b91c1c", fontWeight: "700" },
});
