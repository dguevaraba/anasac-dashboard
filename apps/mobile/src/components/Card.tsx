import { View, Text, StyleSheet, type ViewProps } from "react-native";
import { Bubbles } from "@/components/Bubbles";
import { colors } from "@/theme";

export function Card({
  children,
  bubbles = false,
  bubblePreset = "panel",
  style,
  ...props
}: ViewProps & {
  children?: React.ReactNode;
  bubbles?: boolean;
  bubblePreset?: "card" | "header" | "panel" | "hero";
}) {
  return (
    <View style={[styles.card, style]} {...props}>
      {bubbles ? <Bubbles preset={bubblePreset} /> : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function CardHint({ children }: { children: React.ReactNode }) {
  return <Text style={styles.hint}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: colors.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  content: {
    position: "relative",
    zIndex: 1,
    padding: 16,
  },
  title: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: "700",
  },
  hint: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 12,
  },
});
