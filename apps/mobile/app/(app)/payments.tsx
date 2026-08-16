import { ScrollView, Text, StyleSheet, View } from "react-native";
import {
  payments,
  findSwimmer,
  formatCrc,
  formatDate,
  getNextInstitutionalPayment,
} from "@anasac/shared";
import { NextPaymentCard } from "@/components/NextPaymentCard";
import { Card, CardTitle, CardHint } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";
import type { PaymentStatus } from "@anasac/shared";

const tone: Record<PaymentStatus, "success" | "warning" | "danger" | "muted"> = {
  pagado: "success",
  pendiente: "warning",
  vencido: "danger",
  parcial: "muted",
};

export default function PaymentsScreen() {
  const next = getNextInstitutionalPayment();
  const paid = payments
    .filter((p) => p.status === "pagado")
    .reduce((s, p) => s + p.amountCrc, 0);
  const pending = payments
    .filter((p) => p.status === "pendiente" || p.status === "vencido")
    .reduce((s, p) => s + p.amountCrc, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen title="Pagos" description="Cobros y mensualidades (mock).">
        <NextPaymentCard />

        <View style={styles.totals}>
          <Card bubbles bubblePreset="card" style={{ flex: 1 }}>
            <CardHint>Total cobrado</CardHint>
            <Text style={styles.totalValue}>{formatCrc(paid)}</Text>
          </Card>
          <Card bubbles style={{ flex: 1 }}>
            <CardHint>Por cobrar</CardHint>
            <Text style={[styles.totalValue, { color: colors.teal }]}>
              {formatCrc(pending)}
            </Text>
            <Text style={styles.meta}>
              Corte {formatDate(next.dueDate)} · {next.daysRemaining}d
            </Text>
          </Card>
        </View>

        {payments.map((payment) => {
          const swimmer = findSwimmer(payment.swimmerId);
          return (
            <Card key={payment.id} bubbles bubblePreset="panel" style={{ marginBottom: 10 }}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {swimmer ? `${swimmer.firstName} ${swimmer.lastName}` : "—"}
                  </Text>
                  <Text style={styles.meta}>{payment.concept}</Text>
                  <Text style={styles.meta}>Vence: {formatDate(payment.dueDate)}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <Text style={styles.amount}>{formatCrc(payment.amountCrc)}</Text>
                  <Badge label={payment.status} tone={tone[payment.status]} />
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
  totals: { flexDirection: "row", gap: 10 },
  totalValue: { marginTop: 6, color: colors.navy, fontSize: 20, fontWeight: "800" },
  row: { flexDirection: "row", gap: 10 },
  name: { color: colors.navy, fontWeight: "800", fontSize: 15 },
  meta: { marginTop: 3, color: "#64748b", fontSize: 12 },
  amount: { color: colors.navy, fontWeight: "800" },
});
