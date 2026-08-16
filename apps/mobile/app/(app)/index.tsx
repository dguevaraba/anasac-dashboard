import { ScrollView, View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import {
  attendanceByWeek,
  calendarEvents,
  competitions,
  formatCrc,
  formatDate,
  formatTimeMs,
  getNextInstitutionalPayment,
  payments,
  results,
  resultsByStroke,
  resultsTrend,
  swimmers,
  findSwimmer,
  findEvent,
  findCompetition,
} from "@anasac/shared";
import { useAuth } from "@/auth";
import { StatCard } from "@/components/StatCard";
import { NextPaymentCard } from "@/components/NextPaymentCard";
import { Card, CardTitle, CardHint } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";

const chartWidth = Dimensions.get("window").width - 72;

export default function DashboardScreen() {
  const { user } = useAuth();
  const active = swimmers.filter((s) => s.status === "activo").length;
  const next = getNextInstitutionalPayment();
  const pending = payments.filter((p) => p.status === "pendiente").length;
  const upcoming = [...calendarEvents]
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 3);
  const recent = [...results]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const nextComp = [...competitions]
    .filter((c) => c.status === "programada" || c.status === "en_curso")
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Screen
        title={`Hola, ${user?.fullName.split(" ")[0]}`}
        description="Resumen operativo ANASAC — datos demo."
      >
        <View style={styles.stats}>
          <StatCard
            title="Nadadores"
            value={swimmers.length}
            hint={`${active} activos`}
            icon={<Ionicons name="water" size={20} color={colors.aqua} />}
          />
          <StatCard
            title="Competencias"
            value={competitions.length}
            hint="Temporada 2026"
            icon={<Ionicons name="trophy" size={20} color={colors.aqua} />}
          />
          <StatCard
            title="Pagos pend."
            value={pending}
            hint={`${next.daysRemaining} días al cobro`}
            icon={<Ionicons name="card" size={20} color={colors.aqua} />}
          />
          <StatCard
            title="Resultados"
            value={results.length}
            hint="Marcas registradas"
            icon={<Ionicons name="list" size={20} color={colors.aqua} />}
          />
        </View>

        <NextPaymentCard />

        {nextComp ? (
          <Card bubbles bubblePreset="panel">
            <CardTitle>Próxima competencia</CardTitle>
            <CardHint>{nextComp.location}</CardHint>
            <Text style={styles.compName}>{nextComp.name}</Text>
            <Text style={styles.muted}>
              {formatDate(nextComp.startDate)} — {formatDate(nextComp.endDate)}
            </Text>
            <View style={{ marginTop: 8 }}>
              <Badge label={nextComp.status.replace("_", " ")} />
            </View>
          </Card>
        ) : null}

        <Card bubbles bubblePreset="card">
          <CardTitle>Asistencia semanal</CardTitle>
          <CardHint>Presentes (mock)</CardHint>
          <View style={{ marginTop: 12 }}>
            <BarChart
              data={attendanceByWeek.map((w) => ({
                value: w.presentes,
                label: w.semana.replace("Sem ", "S"),
                frontColor: colors.teal,
              }))}
              barWidth={22}
              spacing={18}
              roundedTop
              hideRules
              yAxisThickness={0}
              xAxisThickness={0}
              noOfSections={4}
              width={chartWidth}
              height={160}
              frontColor={colors.teal}
            />
          </View>
        </Card>

        <Card bubbles bubblePreset="panel">
          <CardTitle>Tendencia de resultados</CardTitle>
          <CardHint>Marcas por mes</CardHint>
          <View style={{ marginTop: 12 }}>
            <LineChart
              data={resultsTrend.map((r) => ({ value: r.marcas, label: r.mes }))}
              color={colors.teal}
              dataPointsColor={colors.aqua}
              thickness={3}
              curved
              hideRules
              yAxisThickness={0}
              xAxisThickness={0}
              width={chartWidth}
              height={160}
              noOfSections={4}
            />
          </View>
        </Card>

        <Card bubbles bubblePreset="card">
          <CardTitle>Resultados por estilo</CardTitle>
          <View style={styles.pieWrap}>
            <PieChart
              data={resultsByStroke.map((item, index) => ({
                value: item.marcas,
                color: [colors.teal, colors.navy, colors.aqua, "#8ebecb", "#94a3b8"][index],
                text: `${item.marcas}`,
              }))}
              donut
              radius={70}
              innerRadius={42}
              centerLabelComponent={() => (
                <Text style={{ color: colors.navy, fontWeight: "800" }}>Estilos</Text>
              )}
            />
          </View>
        </Card>

        <Card bubbles>
          <CardTitle>Próximos eventos</CardTitle>
          {upcoming.map((event) => (
            <View key={event.id} style={styles.rowItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{event.title}</Text>
                <Text style={styles.muted}>
                  {formatDate(event.startAt)} · {event.location}
                </Text>
              </View>
              <Badge label={event.type} tone="muted" />
            </View>
          ))}
        </Card>

        <Card bubbles bubblePreset="panel">
          <CardTitle>Resultados recientes</CardTitle>
          {recent.map((result) => {
            const swimmer = findSwimmer(result.swimmerId);
            const event = findEvent(result.eventId);
            const competition = findCompetition(result.competitionId);
            return (
              <View key={result.id} style={styles.rowItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>
                    {swimmer ? `${swimmer.firstName} ${swimmer.lastName}` : "Nadador"}
                  </Text>
                  <Text style={styles.muted}>
                    {event?.name} · {competition?.name}
                  </Text>
                </View>
                <Text style={styles.time}>{formatTimeMs(result.timeMs)}</Text>
              </View>
            );
          })}
          <Text style={[styles.muted, { marginTop: 8 }]}>
            Pendiente de cobro: {formatCrc(next.pendingAmount)}
          </Text>
        </Card>
      </Screen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  compName: {
    marginTop: 10,
    color: colors.navy,
    fontSize: 18,
    fontWeight: "800",
  },
  muted: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  pieWrap: {
    marginTop: 12,
    alignItems: "center",
  },
  rowItem: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowTitle: {
    color: colors.navy,
    fontWeight: "700",
    fontSize: 14,
  },
  time: {
    color: colors.teal,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
});
