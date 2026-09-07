import { ScrollView, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "@/auth";
import { fetchCoaches } from "@/data/coaches";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { Card } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";

export default function CoachesScreen() {
  const { can } = useAuth();
  const { data: coaches, loading, error } = useLiveQuery(fetchCoaches, []);

  if (!can("coaches:view")) {
    return (
      <Screen title="Entrenadores" description="No tienes permiso para ver esta sección.">
        <Text />
      </Screen>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen title="Entrenadores" description="Cuerpo técnico.">
        {loading ? <ActivityIndicator color={colors.teal} style={{ marginBottom: 12 }} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {(coaches ?? []).map((coach) => (
          <Card key={coach.id} bubbles style={{ marginBottom: 10 }}>
            <Text style={styles.name}>{coach.fullName}</Text>
            {coach.email ? <Text style={styles.meta}>{coach.email}</Text> : null}
            {coach.specialty ? <Text style={styles.meta}>{coach.specialty}</Text> : null}
            <Badge
              label={coach.isActive ? "activo" : "inactivo"}
              tone={coach.isActive ? "success" : "muted"}
            />
          </Card>
        ))}

        {!loading && (coaches?.length ?? 0) === 0 ? (
          <Card bubbles>
            <Text style={styles.meta}>No hay entrenadores registrados.</Text>
          </Card>
        ) : null}
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
  meta: { marginTop: 4, color: "#64748b", fontSize: 13, marginBottom: 2 },
});
