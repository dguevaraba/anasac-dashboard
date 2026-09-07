import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import {
  daysUntil,
  etiquetaTipoEvento,
  formatCrc,
  formatDate,
  formatDateTime,
  puedeVerTipoEvento,
} from "@anasac/shared";
import { useAuth } from "@/auth";
import { fetchDashboardData } from "@/data/dashboard";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { StatCard } from "@/components/StatCard";
import { NextPaymentCard } from "@/components/NextPaymentCard";
import { Card, CardTitle } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";

function claveDiaCostaRica(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

const TYPE_TONE = {
  competencia: "navy",
  reunion: "warning",
  otro: "muted",
  entrenamiento: "success",
} as const;

export default function DashboardScreen() {
  const { user, can } = useAuth();
  const role = user?.role ?? null;
  const puedeVerNadadores = can("swimmers:view");
  const puedeVerPagos = can("payments:view");
  const puedeVerCalendario = can("calendar:view");

  const { data, loading, error } = useLiveQuery(
    () =>
      fetchDashboardData({
        canPayments: puedeVerPagos,
        canSwimmers: puedeVerNadadores,
      }),
    [puedeVerPagos, puedeVerNadadores],
  );

  const eventosVisibles = (data?.proximosEventos ?? []).filter((e) =>
    puedeVerTipoEvento(role, e.type),
  );
  const eventosLista = eventosVisibles.slice(0, 6);
  const proximoEvento = eventosVisibles[0] ?? null;
  const diasProximo = proximoEvento
    ? daysUntil(claveDiaCostaRica(proximoEvento.startAt))
    : null;

  let hintDias = "Sin eventos próximos";
  if (diasProximo != null && proximoEvento) {
    if (diasProximo === 0) hintDias = proximoEvento.title;
    else if (diasProximo === 1) hintDias = `Mañana · ${proximoEvento.title}`;
    else hintDias = proximoEvento.title;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.mist }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <Screen
        title={`Hola, ${user?.fullName.split(" ")[0]}`}
        description="Resumen operativo ANASAC."
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.teal} />
          </View>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.stats}>
          {puedeVerNadadores ? (
            <StatCard
              title="Nadadores"
              value={data?.swimmers.total ?? "—"}
              hint={`${data?.swimmers.active ?? 0} activos`}
              icon={<Ionicons name="water" size={20} color={colors.aqua} />}
            />
          ) : null}
          {puedeVerPagos ? (
            <StatCard
              title="Pagos"
              value={data?.pagosCount ?? "—"}
              hint={
                (data?.pendingCount ?? 0) === 0
                  ? "Sin cobros pendientes"
                  : `${data?.pendingCount} pendiente${(data?.pendingCount ?? 0) === 1 ? "" : "s"}`
              }
              icon={<Ionicons name="card" size={20} color={colors.aqua} />}
            />
          ) : null}
          {puedeVerCalendario ? (
            <StatCard
              title="Días al próximo evento"
              value={
                diasProximo == null
                  ? "—"
                  : diasProximo === 0
                    ? "Hoy"
                    : Math.max(0, diasProximo)
              }
              hint={hintDias}
              icon={
                <Ionicons name="calendar" size={20} color={colors.aqua} />
              }
            />
          ) : null}
        </View>

        {puedeVerPagos ? (
          <NextPaymentCard next={data?.mensualidad ?? null} loading={loading} />
        ) : null}

        {puedeVerCalendario ? (
          <Card bubbles bubblePreset="card">
            <CardTitle>Próximos eventos</CardTitle>
            {eventosLista.length === 0 && !loading ? (
              <Text style={styles.muted}>
                No hay eventos próximos para tu rol.
              </Text>
            ) : (
              eventosLista.map((event, index) => {
                const tipo = etiquetaTipoEvento(event.type);
                if (index === 0) {
                  return (
                    <View key={event.id} style={styles.featuredWrap}>
                      {event.imageUrl ? (
                        <Image
                          source={{ uri: event.imageUrl }}
                          style={styles.featuredImage}
                        />
                      ) : null}
                      <LinearGradient
                        colors={
                          event.imageUrl
                            ? ["rgba(15,44,61,0.55)", "rgba(26,122,114,0.85)"]
                            : ["#1a7a72", "#2e768d", "#3ecfc0"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.featured}
                      >
                        <Text style={styles.featuredEyebrow}>
                          Próximo · {tipo}
                        </Text>
                        <Text style={styles.featuredTitle}>{event.title}</Text>
                        {event.location ? (
                          <Text style={styles.featuredMeta}>
                            {event.location}
                          </Text>
                        ) : null}
                        <Text style={styles.featuredMeta}>
                          {formatDateTime(event.startAt)}
                        </Text>
                      </LinearGradient>
                    </View>
                  );
                }

                return (
                  <View key={event.id} style={styles.rowItem}>
                    {event.imageUrl ? (
                      <Image
                        source={{ uri: event.imageUrl }}
                        style={styles.thumb}
                      />
                    ) : null}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{event.title}</Text>
                      <Text style={styles.muted}>
                        {formatDate(event.startAt)}
                        {event.location ? ` · ${event.location}` : ""}
                      </Text>
                    </View>
                    <Badge
                      label={tipo}
                      tone={
                        TYPE_TONE[event.type as keyof typeof TYPE_TONE] ??
                        "muted"
                      }
                    />
                  </View>
                );
              })
            )}
            <Link href="/calendar" asChild>
              <Pressable style={{ marginTop: 12 }}>
                <Text style={styles.link}>Ver calendario →</Text>
              </Pressable>
            </Link>
          </Card>
        ) : null}

        {puedeVerPagos && data?.mensualidad ? (
          <Text style={[styles.muted, { marginTop: 8 }]}>
            Pendiente de cobro: {formatCrc(data.mensualidad.pendingAmount)}
          </Text>
        ) : null}
      </Screen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { paddingVertical: 12, alignItems: "center" },
  error: {
    marginBottom: 10,
    color: "#b91c1c",
    backgroundColor: "#fef2f2",
    padding: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  muted: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 8,
  },
  featuredWrap: {
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  featuredImage: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
  },
  featured: {
    padding: 16,
    minHeight: 120,
    justifyContent: "flex-end",
  },
  featuredEyebrow: {
    color: colors.aqua,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  featuredTitle: {
    marginTop: 6,
    color: colors.white,
    fontSize: 20,
    fontWeight: "800",
  },
  featuredMeta: {
    marginTop: 4,
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  rowItem: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  rowTitle: {
    color: colors.navy,
    fontWeight: "700",
    fontSize: 14,
  },
  link: {
    color: colors.teal,
    fontWeight: "700",
    fontSize: 13,
  },
});
