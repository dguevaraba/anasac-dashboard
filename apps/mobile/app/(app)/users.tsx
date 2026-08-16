import { ScrollView, Text, StyleSheet, View, Pressable } from "react-native";
import { demoUsers, ROLE_LABELS, type Role } from "@anasac/shared";
import { useAuth } from "@/auth";
import { Card } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";

export default function UsersScreen() {
  const { can, switchRoleDemo, user } = useAuth();

  if (!can("users:view")) {
    return (
      <Screen title="Usuarios" description="No tienes permiso para ver esta sección.">
        <View />
      </Screen>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen
        title="Usuarios y roles"
        description="Cambia de rol demo para probar permisos."
      >
        <View style={styles.roleRow}>
          {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
            <Pressable
              key={role}
              style={styles.roleChip}
              onPress={() => switchRoleDemo(role)}
            >
              <Text style={styles.roleChipText}>Probar {ROLE_LABELS[role]}</Text>
            </Pressable>
          ))}
        </View>

        {demoUsers.map((u) => (
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
  roleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  roleChip: {
    backgroundColor: colors.navy,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  roleChipText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  name: { color: colors.navy, fontWeight: "800", fontSize: 16 },
  meta: { marginTop: 4, color: "#64748b", fontSize: 13 },
});
