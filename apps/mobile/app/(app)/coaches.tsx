import { ScrollView, Text, StyleSheet } from "react-native";
import { coaches, teams } from "@anasac/shared";
import { Card } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";

export default function CoachesScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen title="Entrenadores" description="Cuerpo técnico (mock).">
        {coaches.map((coach) => (
          <Card key={coach.id} bubbles style={{ marginBottom: 10 }}>
            <Text style={styles.name}>{coach.fullName}</Text>
            <Text style={styles.meta}>{coach.email}</Text>
            <Text style={styles.meta}>{coach.specialty}</Text>
            <Text style={styles.meta}>
              Equipos:{" "}
              {coach.teamIds
                .map((id) => teams.find((t) => t.id === id)?.name)
                .filter(Boolean)
                .join(", ")}
            </Text>
            <Badge
              label={coach.isActive ? "activo" : "inactivo"}
              tone={coach.isActive ? "success" : "muted"}
            />
          </Card>
        ))}
      </Screen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.navy, fontWeight: "800", fontSize: 16 },
  meta: { marginTop: 4, color: "#64748b", fontSize: 13, marginBottom: 2 },
});
