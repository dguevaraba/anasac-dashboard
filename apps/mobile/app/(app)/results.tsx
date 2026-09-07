import { ScrollView, Text, StyleSheet, View, ActivityIndicator } from "react-native";
import { formatDate, formatTimeMs } from "@anasac/shared";
import { useAuth } from "@/auth";
import { fetchResults } from "@/data/results";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { Card } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";

export default function ResultsScreen() {
  const { can } = useAuth();
  const { data: results, loading, error } = useLiveQuery(fetchResults, []);

  if (!can("results:view")) {
    return (
      <Screen title="Resultados" description="No tienes permiso para ver esta sección.">
        <View />
      </Screen>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen title="Resultados" description="Marcas y puestos.">
        {loading ? <ActivityIndicator color={colors.teal} style={{ marginBottom: 12 }} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {(results ?? []).map((result) => (
          <Card key={result.id} bubbles bubblePreset="card" style={{ marginBottom: 10 }}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{result.swimmerName}</Text>
                {result.eventName ? <Text style={styles.meta}>{result.eventName}</Text> : null}
                {result.competitionName ? (
                  <Text style={styles.meta}>{result.competitionName}</Text>
                ) : null}
                <Text style={styles.meta}>{formatDate(result.createdAt)}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Text style={styles.time}>{formatTimeMs(result.timeMs)}</Text>
                {result.place ? <Badge label={`${result.place}°`} /> : null}
              </View>
            </View>
          </Card>
        ))}

        {!loading && (results?.length ?? 0) === 0 ? (
          <Card bubbles>
            <Text style={styles.meta}>No hay resultados registrados.</Text>
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
  row: { flexDirection: "row", gap: 10 },
  name: { color: colors.navy, fontWeight: "800", fontSize: 16 },
  meta: { marginTop: 3, color: "#64748b", fontSize: 12 },
  time: { color: colors.teal, fontWeight: "800", fontSize: 16 },
});
