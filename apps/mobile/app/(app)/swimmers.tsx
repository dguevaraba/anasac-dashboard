import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { getAge } from "@anasac/shared";
import { useAuth } from "@/auth";
import { fetchSwimmers } from "@/data/swimmers";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { Card } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";

export default function SwimmersScreen() {
  const { can } = useAuth();
  const { data: swimmers, loading, error } = useLiveQuery(fetchSwimmers, []);

  if (!can("swimmers:view")) {
    return (
      <Screen title="Nadadores" description="No tienes permiso para ver esta sección.">
        <View />
      </Screen>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen title="Nadadores" description="Atletas afiliados a ANASAC.">
        {loading ? <ActivityIndicator color={colors.teal} style={{ marginBottom: 12 }} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {(swimmers ?? []).map((s) => (
          <Card key={s.id} bubbles bubblePreset="card" style={{ marginBottom: 10 }}>
            <Text style={styles.name}>
              {s.firstName} {s.lastName}
            </Text>
            <Text style={styles.meta}>
              {s.birthDate ? `${getAge(s.birthDate)} años · ` : ""}
              {s.categoryName ?? "Sin categoría"}
              {s.trainingGroup ? ` · ${s.trainingGroup}` : ""}
            </Text>
            <Text style={styles.meta}>Entrenador: {s.coachName ?? "—"}</Text>
            <View style={{ marginTop: 8 }}>
              <Badge
                label={s.status}
                tone={
                  s.status === "activo"
                    ? "success"
                    : s.status === "pendiente"
                      ? "warning"
                      : s.status === "becado"
                        ? "default"
                        : "danger"
                }
              />
            </View>
          </Card>
        ))}

        {!loading && (swimmers?.length ?? 0) === 0 ? (
          <Card bubbles>
            <Text style={styles.meta}>No hay nadadores registrados.</Text>
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
  meta: { marginTop: 4, color: "#64748b", fontSize: 13 },
});
