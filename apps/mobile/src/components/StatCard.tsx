import { View, Text, StyleSheet } from "react-native";
import { Bubbles } from "@/components/Bubbles";
import { colors } from "@/theme";

export function StatCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Bubbles preset="card" />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    overflow: "hidden",
    minWidth: "47%",
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#64748b",
  },
  value: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "800",
    color: colors.navy,
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
});
