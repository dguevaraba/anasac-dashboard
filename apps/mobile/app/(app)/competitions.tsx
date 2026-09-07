import { ScrollView, Text, StyleSheet, View, ActivityIndicator } from "react-native";
import { formatDate } from "@anasac/shared";
import { useAuth } from "@/auth";
import { fetchCompetitions } from "@/data/competitions";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { Card } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";

export default function CompetitionsScreen() {
  const { can } = useAuth();
  const { data: competitions, loading, error } = useLiveQuery(fetchCompetitions, []);

  if (!can("competitions:view")) {
    return (
      <Screen title="Competencias" description="No tienes permiso para ver esta sección.">
        <View />
      </Screen>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen title="Competencias" description="Calendario competitivo.">
        {loading ? <ActivityIndicator color={colors.teal} style={{ marginBottom: 12 }} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {(competitions ?? []).map((comp) => (
          <Card key={comp.id} bubbles bubblePreset="panel" style={{ marginBottom: 10 }}>
            <View style={styles.row}>
              <Text style={styles.name}>{comp.name}</Text>
              <Badge
                label={comp.status.replace("_", " ")}
                tone={
                  comp.status === "finalizada"
                    ? "success"
                    : comp.status === "en_curso"
                      ? "warning"
                      : "default"
                }
              />
            </View>
            <Text style={styles.meta}>{comp.location}</Text>
            <Text style={styles.meta}>
              {formatDate(comp.startDate)} — {formatDate(comp.endDate)} · {comp.poolLength}
            </Text>
          </Card>
        ))}

        {!loading && (competitions?.length ?? 0) === 0 ? (
          <Card bubbles>
            <Text style={styles.meta}>No hay competencias registradas.</Text>
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
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8, alignItems: "flex-start" },
  name: { flex: 1, color: colors.navy, fontWeight: "800", fontSize: 16 },
  meta: { marginTop: 6, color: "#64748b", fontSize: 13 },
});
