import { ScrollView, Text, StyleSheet, View } from "react-native";
import {
  results,
  findSwimmer,
  findEvent,
  findCompetition,
  formatDate,
  formatTimeMs,
} from "@anasac/shared";
import { Card } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";

export default function ResultsScreen() {
  const sorted = [...results].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen title="Resultados" description="Marcas y puestos (mock).">
        {sorted.map((result) => {
          const swimmer = findSwimmer(result.swimmerId);
          const event = findEvent(result.eventId);
          const competition = findCompetition(result.competitionId);
          return (
            <Card key={result.id} bubbles bubblePreset="card" style={{ marginBottom: 10 }}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {swimmer ? `${swimmer.firstName} ${swimmer.lastName}` : "—"}
                  </Text>
                  <Text style={styles.meta}>{event?.name}</Text>
                  <Text style={styles.meta}>{competition?.name}</Text>
                  <Text style={styles.meta}>{formatDate(result.createdAt)}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <Text style={styles.time}>{formatTimeMs(result.timeMs)}</Text>
                  {result.place ? <Badge label={`${result.place}°`} /> : null}
                </View>
              </View>
            </Card>
          );
        })}
      </Screen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  name: { color: colors.navy, fontWeight: "800", fontSize: 16 },
  meta: { marginTop: 3, color: "#64748b", fontSize: 12 },
  time: { color: colors.teal, fontWeight: "800", fontSize: 16 },
});
