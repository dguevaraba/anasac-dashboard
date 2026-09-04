import { ScrollView, View, Text, StyleSheet } from "react-native";
import {
  swimmers,
  findCategory,
  findTeam,
  findCoach,
  getAge,
} from "@anasac/shared";
import { Card } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";

export default function SwimmersScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen title="Nadadores" description="Atletas afiliados a ANASAC (mock).">
        {swimmers.map((s) => (
          <Card key={s.id} bubbles bubblePreset="card" style={{ marginBottom: 10 }}>
            <Text style={styles.name}>
              {s.firstName} {s.lastName}
            </Text>
            <Text style={styles.meta}>
              {getAge(s.birthDate)} años · {findCategory(s.categoryId)?.name} ·{" "}
              {findTeam(s.teamId)?.name}
            </Text>
            <Text style={styles.meta}>Entrenador: {findCoach(s.coachId)?.fullName ?? "—"}</Text>
            <View style={{ marginTop: 8 }}>
              <Badge
                label={s.status}
                tone={
                  s.status === "activo"
                    ? "success"
                    : s.status === "moroso"
                      ? "warning"
                      : s.status === "becado"
                        ? "default"
                        : "danger"
                }
              />
            </View>
          </Card>
        ))}
      </Screen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.navy, fontWeight: "800", fontSize: 16 },
  meta: { marginTop: 4, color: "#64748b", fontSize: 13 },
});
