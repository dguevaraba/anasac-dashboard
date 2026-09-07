import { ScrollView, Text, StyleSheet, View, ActivityIndicator } from "react-native";
import { ROLE_LABELS } from "@anasac/shared";
import { useAuth } from "@/auth";
import { fetchUsers } from "@/data/users";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { Card } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";

export default function UsersScreen() {
  const { can, user } = useAuth();
  const { data: users, loading, error } = useLiveQuery(fetchUsers, []);

  if (!can("users:view")) {
    return (
      <Screen title="Usuarios" description="No tienes permiso para ver esta sección.">
        <View />
      </Screen>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen title="Usuarios y roles" description="Cuentas con acceso a ANASAC.">
        {loading ? <ActivityIndicator color={colors.teal} style={{ marginBottom: 12 }} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {(users ?? []).map((u) => (
          <Card key={u.id} bubbles bubblePreset="card" style={{ marginBottom: 10 }}>
            <Text style={styles.name}>
              {u.fullName}
              {u.id === user?.id ? " (tú)" : ""}
            </Text>
            <Text style={styles.meta}>{u.email}</Text>
            <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
              <Badge label={ROLE_LABELS[u.role]} tone="navy" />
              <Badge
                label={u.isActive ? "activo" : "inactivo"}
                tone={u.isActive ? "success" : "muted"}
              />
            </View>
          </Card>
        ))}
      </Screen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  error: {
    marginBottom: 10,
    color: "#b91c1c",
    backgroundColor: "#fef2f2",
    padding: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  name: { color: colors.navy, fontWeight: "800", fontSize: 16 },
  meta: { marginTop: 4, color: "#64748b", fontSize: 13 },
});
