import { ScrollView, Text, StyleSheet, View, ActivityIndicator } from "react-native";
import { formatCrc, formatDate, type PaymentStatus } from "@anasac/shared";
import { useAuth } from "@/auth";
import { fetchPayments } from "@/data/payments";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { NextPaymentCard } from "@/components/NextPaymentCard";
import { Card, CardTitle, CardHint } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";
import { montoTotalPago, resumenMensualidad } from "@/lib/mensualidad";

const tone: Record<PaymentStatus, "success" | "warning" | "danger" | "muted"> = {
  pagado: "success",
  pendiente: "warning",
  vencido: "danger",
  parcial: "muted",
};

export default function PaymentsScreen() {
  const { can } = useAuth();
  const { data: payments, loading, error } = useLiveQuery(fetchPayments, []);

  if (!can("payments:view")) {
    return (
      <Screen title="Pagos" description="No tienes permiso para ver esta sección.">
        <View />
      </Screen>
    );
  }

  const list = payments ?? [];
  const mensualidad = resumenMensualidad(
    list.map((p) => ({ amount: p.amountCrc, status: p.status, period: p.period })),
  );
  const paid = list
    .filter((p) => p.status === "pagado")
    .reduce((s, p) => s + montoTotalPago({ amount: p.amountCrc }), 0);
  const pending = list
    .filter((p) => p.status === "pendiente" || p.status === "vencido")
    .reduce((s, p) => s + montoTotalPago({ amount: p.amountCrc }), 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen title="Pagos" description="Cobros y mensualidades.">
        {loading ? <ActivityIndicator color={colors.teal} style={{ marginBottom: 12 }} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <NextPaymentCard next={mensualidad} loading={loading} />

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
              Corte {formatDate(mensualidad.dueDate)} · {mensualidad.daysRemaining}d
            </Text>
          </Card>
        </View>

        {list.map((payment) => (
          <Card key={payment.id} bubbles bubblePreset="panel" style={{ marginBottom: 10 }}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{payment.swimmerName}</Text>
                <Text style={styles.meta}>{payment.concept}</Text>
                <Text style={styles.meta}>Vence: {formatDate(payment.dueDate)}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Text style={styles.amount}>
                  {formatCrc(montoTotalPago({ amount: payment.amountCrc }))}
                </Text>
                <Badge label={payment.status} tone={tone[payment.status]} />
              </View>
            </View>
          </Card>
        ))}

        {!loading && list.length === 0 ? (
          <Card bubbles>
            <CardTitle>Sin pagos</CardTitle>
            <Text style={styles.meta}>No hay cobros registrados todavía.</Text>
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
  totals: { flexDirection: "row", gap: 10 },
  totalValue: { marginTop: 6, color: colors.navy, fontSize: 20, fontWeight: "800" },
  row: { flexDirection: "row", gap: 10 },
  name: { color: colors.navy, fontWeight: "800", fontSize: 15 },
  meta: { marginTop: 4, color: "#64748b", fontSize: 12 },
  amount: { color: colors.navy, fontWeight: "800", fontSize: 15 },
});
