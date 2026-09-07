import { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  etiquetaTipoEvento,
  formatDateTime,
  puedeVerTipoEvento,
  TIPOS_EVENTO_CALENDARIO,
  type TipoEventoCalendario,
} from "@anasac/shared";
import { useAuth } from "@/auth";
import { fetchCalendarEvents } from "@/data/calendar";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { Card } from "@/components/Card";
import { Badge, Screen } from "@/components/ui";
import { colors } from "@/theme";

const TYPE_STYLE: Record<
  TipoEventoCalendario,
  { tone: "navy" | "success" | "warning" | "muted"; accent: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  competencia: { tone: "navy", accent: colors.navy, icon: "trophy-outline" },
  entrenamiento: { tone: "success", accent: colors.teal, icon: "water-outline" },
  reunion: { tone: "warning", accent: "#f59e0b", icon: "people-outline" },
  otro: { tone: "muted", accent: "#8b5cf6", icon: "star-outline" },
};

export default function CalendarScreen() {
  const { user } = useAuth();
  const role = user?.role ?? null;
  const [filtro, setFiltro] = useState<"todos" | TipoEventoCalendario>("todos");
  const { data: events, loading, error } = useLiveQuery(fetchCalendarEvents, []);

  const visibles = useMemo(
    () =>
      [...(events ?? [])]
        .filter((e) => puedeVerTipoEvento(role, e.type))
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [events, role],
  );

  const filtrados = useMemo(
    () =>
      filtro === "todos"
        ? visibles
        : visibles.filter((e) => e.type === filtro),
    [visibles, filtro],
  );

  const tiposFiltro = TIPOS_EVENTO_CALENDARIO.filter((t) =>
    puedeVerTipoEvento(role, t),
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.mist }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <Screen
        title="Calendario"
        description="Eventos según tu rol."
      >
        {loading ? (
          <ActivityIndicator color={colors.teal} style={{ marginBottom: 12 }} />
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <Pressable
            onPress={() => setFiltro("todos")}
            style={[
              styles.chip,
              filtro === "todos" && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                filtro === "todos" && styles.chipTextActive,
              ]}
            >
              Todos
            </Text>
          </Pressable>
          {tiposFiltro.map((t) => {
            const style = TYPE_STYLE[t];
            const active = filtro === t;
            return (
              <Pressable
                key={t}
                onPress={() => setFiltro(t)}
                style={[
                  styles.chip,
                  active && { backgroundColor: style.accent, borderColor: style.accent },
                ]}
              >
                <Ionicons
                  name={style.icon}
                  size={14}
                  color={active ? colors.white : style.accent}
                />
                <Text
                  style={[
                    styles.chipText,
                    active && styles.chipTextActive,
                  ]}
                >
                  {etiquetaTipoEvento(t)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {!loading && filtrados.length === 0 ? (
          <Card bubbles>
            <Text style={styles.empty}>No hay eventos con ese filtro.</Text>
          </Card>
        ) : (
          filtrados.map((event) => {
            const style = TYPE_STYLE[event.type];
            return (
              <Card
                key={event.id}
                bubbles
                style={[
                  styles.card,
                  { borderLeftWidth: 4, borderLeftColor: style.accent },
                ]}
              >
                <View style={styles.row}>
                  {event.imageUrl ? (
                    <Image
                      source={{ uri: event.imageUrl }}
                      style={styles.image}
                    />
                  ) : (
                    <View
                      style={[
                        styles.iconWrap,
                        { backgroundColor: style.accent },
                      ]}
                    >
                      <Ionicons
                        name={style.icon}
                        size={20}
                        color={colors.white}
                      />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{event.title}</Text>
                    <Text style={styles.meta}>
                      {formatDateTime(event.startAt)}
                    </Text>
                    {event.location ? (
                      <Text style={styles.meta}>{event.location}</Text>
                    ) : null}
                    <View style={{ marginTop: 8 }}>
                      <Badge
                        label={etiquetaTipoEvento(event.type)}
                        tone={style.tone}
                      />
                    </View>
                  </View>
                </View>
              </Card>
            );
          })
        )}
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
  filters: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  chipText: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: "700",
  },
  chipTextActive: {
    color: colors.white,
  },
  card: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    color: colors.navy,
    fontWeight: "800",
    fontSize: 16,
  },
  meta: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 13,
  },
  empty: {
    color: "#64748b",
    fontSize: 14,
  },
});
