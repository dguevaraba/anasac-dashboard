import { ScrollView, Text, StyleSheet, View } from "react-native";
import { calendarEvents, formatDateTime } from "@anasac/shared";
import { Card } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { Bubbles } from "@/components/Bubbles";
import { colors } from "@/theme";

export default function CalendarScreen() {
  const events = [...calendarEvents].sort((a, b) => a.startAt.localeCompare(b.startAt));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen title="Calendario" description="Eventos y entrenamientos.">
        {events.map((event) => (
          <Card key={event.id} bubbles style={{ marginBottom: 10 }}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{event.title}</Text>
                <Text style={styles.meta}>{formatDateTime(event.startAt)}</Text>
                <Text style={styles.meta}>{event.location}</Text>
                <View style={{ marginTop: 8 }}>
                  <Badge label={event.type} tone="navy" />
                </View>
              </View>
              <View style={styles.dateChip}>
                <Bubbles preset="card" />
                <Text style={styles.dateLabel}>Inicio</Text>
                <Text style={styles.dateValue}>
                  {new Date(event.startAt).toLocaleDateString("es-CR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </Screen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  name: { color: colors.navy, fontWeight: "800", fontSize: 16 },
  meta: { marginTop: 4, color: "#64748b", fontSize: 13 },
  dateChip: {
    width: 78,
    borderRadius: 14,
    backgroundColor: colors.mist,
    padding: 10,
    alignItems: "center",
    overflow: "hidden",
  },
  dateLabel: { fontSize: 10, color: "#94a3b8", textTransform: "uppercase", zIndex: 1 },
  dateValue: { marginTop: 4, color: colors.teal, fontWeight: "800", zIndex: 1 },
});
