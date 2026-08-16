import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  type TextInputProps,
  type PressableProps,
} from "react-native";
import { colors } from "@/theme";

export function Screen({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <BubblesHeader />
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function BubblesHeader() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: "absolute",
          right: -20,
          top: -30,
          width: 110,
          height: 110,
          borderRadius: 999,
          backgroundColor: colors.tealSoft,
          opacity: 0.65,
        }}
      />
      <View
        style={{
          position: "absolute",
          right: 50,
          top: -6,
          width: 42,
          height: 42,
          borderRadius: 999,
          backgroundColor: colors.aqua,
          opacity: 0.2,
        }}
      />
    </View>
  );
}

export function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#94a3b8"
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

export function Button({
  title,
  variant = "primary",
  ...props
}: PressableProps & { title: string; variant?: "primary" | "secondary" | "outline" }) {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && { backgroundColor: colors.teal },
        variant === "secondary" && { backgroundColor: colors.navy },
        variant === "outline" && styles.outline,
        pressed && { opacity: 0.85 },
        props.style as object,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === "outline" && { color: colors.navy },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function Badge({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "success" | "warning" | "danger" | "muted" | "navy";
}) {
  const map = {
    default: { bg: colors.tealSoft, fg: colors.tealDark },
    success: { bg: "#d1fae5", fg: "#065f46" },
    warning: { bg: "#fef3c7", fg: "#92400e" },
    danger: { bg: "#fee2e2", fg: "#991b1b" },
    muted: { bg: "#f1f5f9", fg: "#475569" },
    navy: { bg: colors.navy, fg: colors.white },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: map.bg }]}>
      <Text style={[styles.badgeText, { color: map.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.mist,
    padding: 16,
    gap: 14,
  },
  header: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    overflow: "hidden",
  },
  title: {
    color: colors.navy,
    fontSize: 26,
    fontWeight: "800",
    zIndex: 1,
  },
  description: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 14,
    zIndex: 1,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    color: colors.ink,
    fontSize: 15,
  },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
