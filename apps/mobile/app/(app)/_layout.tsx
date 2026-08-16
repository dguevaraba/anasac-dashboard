import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  Image,
  type ColorValue,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/auth";
import { colors } from "@/theme";

function HeaderTitle({ title }: { title: string }) {
  return (
    <View style={styles.headerBrand}>
      <Image
        source={require("../../assets/anasac-logo.png")}
        style={styles.headerLogo}
        resizeMode="contain"
      />
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

function DrawerIcon({
  name,
  color,
  size,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: ColorValue;
  size: number;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function AppLayout() {
  const { user, isLoading, can } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.teal} size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const hide = { display: "none" as const };

  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "700" },
        drawerActiveBackgroundColor: colors.teal,
        drawerActiveTintColor: colors.white,
        drawerInactiveTintColor: "rgba(255,255,255,0.75)",
        drawerStyle: { backgroundColor: colors.navy, width: 290 },
        drawerLabelStyle: { fontWeight: "600", marginLeft: -8 },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerTitle: () => <HeaderTitle title="Dashboard" />,
          drawerIcon: ({ color, size }: { color: ColorValue; size: number }) => (
            <DrawerIcon name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="swimmers"
        options={{
          title: "Nadadores",
          headerTitle: () => <HeaderTitle title="Nadadores" />,
          drawerItemStyle: can("swimmers:view") ? undefined : hide,
          drawerIcon: ({ color, size }: { color: ColorValue; size: number }) => (
            <DrawerIcon name="water-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="coaches"
        options={{
          title: "Entrenadores",
          headerTitle: () => <HeaderTitle title="Entrenadores" />,
          drawerItemStyle: can("coaches:view") ? undefined : hide,
          drawerIcon: ({ color, size }: { color: ColorValue; size: number }) => (
            <DrawerIcon name="person-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="competitions"
        options={{
          title: "Competencias",
          headerTitle: () => <HeaderTitle title="Competencias" />,
          drawerItemStyle: can("competitions:view") ? undefined : hide,
          drawerIcon: ({ color, size }: { color: ColorValue; size: number }) => (
            <DrawerIcon name="trophy-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="calendar"
        options={{
          title: "Calendario",
          headerTitle: () => <HeaderTitle title="Calendario" />,
          drawerItemStyle: can("calendar:view") ? undefined : hide,
          drawerIcon: ({ color, size }: { color: ColorValue; size: number }) => (
            <DrawerIcon name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="results"
        options={{
          title: "Resultados",
          headerTitle: () => <HeaderTitle title="Resultados" />,
          drawerItemStyle: can("results:view") ? undefined : hide,
          drawerIcon: ({ color, size }: { color: ColorValue; size: number }) => (
            <DrawerIcon name="list-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="payments"
        options={{
          title: "Pagos",
          headerTitle: () => <HeaderTitle title="Pagos" />,
          drawerItemStyle: can("payments:view") ? undefined : hide,
          drawerIcon: ({ color, size }: { color: ColorValue; size: number }) => (
            <DrawerIcon name="card-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="users"
        options={{
          title: "Usuarios",
          headerTitle: () => <HeaderTitle title="Usuarios" />,
          drawerItemStyle: can("users:view") ? undefined : hide,
          drawerIcon: ({ color, size }: { color: ColorValue; size: number }) => (
            <DrawerIcon name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: "Mi perfil",
          headerTitle: () => <HeaderTitle title="Mi perfil" />,
          drawerIcon: ({ color, size }: { color: ColorValue; size: number }) => (
            <DrawerIcon name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: "Configuración",
          headerTitle: () => <HeaderTitle title="Configuración" />,
          drawerItemStyle: can("settings:view") ? undefined : hide,
          drawerIcon: ({ color, size }: { color: ColorValue; size: number }) => (
            <DrawerIcon name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mist,
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerLogo: {
    width: 42,
    height: 28,
    backgroundColor: colors.white,
    borderRadius: 6,
  },
  headerTitle: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 17,
  },
});
