import { View, Text, Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { formatCrc, formatDate, getNextInstitutionalPayment } from "@anasac/shared";
import { Bubbles } from "@/components/Bubbles";
import { colors } from "@/theme";

export function NextPaymentCard() {
  const next = getNextInstitutionalPayment();
  const isOverdue = next.daysRemaining < 0;
  const isToday = next.daysRemaining === 0;

  return (
    <View style={styles.card}>
      <Bubbles preset="hero" />
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>Próximo cobro</Text>
            <Text style={styles.title}>Mensualidad institucional</Text>
            <Text style={styles.subtitle}>Fecha límite: {formatDate(next.dueDate)}</Text>
          </View>
          <View style={styles.iconWrap}>
            <Ionicons name="card-outline" size={22} color={colors.aqua} />
          </View>
        </View>

        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Días restantes</Text>
            <Text style={styles.metricValue}>
              {isOverdue ? Math.abs(next.daysRemaining) : next.daysRemaining}
            </Text>
            <Text style={styles.metricHint}>
              {isOverdue ? "días de atraso" : isToday ? "vence hoy" : "días"}
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Pendiente</Text>
            <Text style={[styles.metricValue, { fontSize: 18 }]}>
              {formatCrc(next.pendingAmount)}
            </Text>
            <Text style={styles.metricHint}>
              {next.pendingCount} cuota{next.pendingCount === 1 ? "" : "s"}
            </Text>
          </View>
        </View>

        <Link href="/payments" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Ver pagos</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.navy,
  },
  inner: {
    padding: 18,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    gap: 12,
  },
  eyebrow: {
    color: colors.aqua,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 8,
    color: colors.white,
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  metrics: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },
  metric: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    overflow: "hidden",
  },
  metricLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  metricValue: {
    marginTop: 4,
    color: colors.aqua,
    fontSize: 34,
    fontWeight: "800",
  },
  metricHint: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  button: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buttonText: {
    color: colors.navy,
    fontWeight: "700",
    fontSize: 12,
  },
});
