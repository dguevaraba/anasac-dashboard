import { ScrollView, Text, StyleSheet, View } from "react-native";
import { competitions, formatDate } from "@anasac/shared";
import { Card } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";

export default function CompetitionsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen title="Competencias" description="Calendario competitivo (mock).">
        {competitions.map((comp) => (
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
      </Screen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8, alignItems: "flex-start" },
  name: { flex: 1, color: colors.navy, fontWeight: "800", fontSize: 16 },
  meta: { marginTop: 6, color: "#64748b", fontSize: 13 },
});
