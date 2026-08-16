import { View, StyleSheet, type ViewStyle } from "react-native";
import { colors } from "@/theme";

type Preset = "card" | "header" | "panel" | "hero";

const PRESETS: Record<Preset, { style: ViewStyle; color: string; opacity: number }[]> = {
  card: [
    { style: { width: 96, height: 96, right: -24, top: -24 }, color: colors.tealSoft, opacity: 0.7 },
    { style: { width: 40, height: 40, right: -4, top: 40 }, color: colors.aqua, opacity: 0.25 },
  ],
  header: [
    { style: { width: 112, height: 112, right: -16, top: -32 }, color: colors.tealSoft, opacity: 0.6 },
    { style: { width: 48, height: 48, right: 40, top: -8 }, color: colors.aqua, opacity: 0.2 },
    { style: { width: 24, height: 24, right: 112, top: 24 }, color: colors.tealSoft, opacity: 0.8 },
  ],
  panel: [
    { style: { width: 128, height: 128, right: -32, top: -40 }, color: colors.tealSoft, opacity: 0.55 },
    { style: { width: 80, height: 80, left: -24, bottom: 0 }, color: colors.aqua, opacity: 0.15 },
    { style: { width: 32, height: 32, right: 32, bottom: 8 }, color: colors.tealSoft, opacity: 0.7 },
  ],
  hero: [
    { style: { width: 160, height: 160, right: -40, top: -48 }, color: "#ffffff", opacity: 0.1 },
    { style: { width: 64, height: 64, right: 64, top: 32 }, color: colors.aqua, opacity: 0.2 },
    { style: { width: 96, height: 96, left: -32, bottom: 16 }, color: "#ffffff", opacity: 0.1 },
    { style: { width: 40, height: 40, left: 80, bottom: -8 }, color: colors.aqua, opacity: 0.25 },
  ],
};

export function Bubbles({ preset = "card" }: { preset?: Preset }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {PRESETS[preset].map((bubble, index) => (
        <View
          key={`${preset}-${index}`}
          style={[
            styles.bubble,
            bubble.style,
            { backgroundColor: bubble.color, opacity: bubble.opacity },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    borderRadius: 999,
  },
});
