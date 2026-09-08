import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useAuth } from "@/auth";
import {
  createSessionFromUrl,
  isAuthCallbackUrl,
  resolveProfileAfterAuth,
} from "@/supabase/oauth";
import { colors } from "@/theme";

/**
 * Deep link target for OAuth (exp://…/auth/callback or anasac://auth/callback).
 * Keeps the session in the mobile app instead of falling through to the web Site URL.
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function handle(url: string | null) {
      if (!url || !isAuthCallbackUrl(url)) return;
      try {
        const session = await createSessionFromUrl(url);
        const result = await resolveProfileAfterAuth(session?.user?.id);
        if (cancelled) return;
        if (result.ok) {
          router.replace("/(app)");
        } else {
          router.replace("/login");
        }
      } catch {
        if (!cancelled) router.replace("/login");
      }
    }

    // Solo URLs en caliente; getInitialURL puede reabrir un code viejo y forzar 2º login.
    const sub = Linking.addEventListener("url", ({ url }) => {
      void handle(url);
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [router]);

  if (!isLoading && user) {
    return <Redirect href="/(app)" />;
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.mist,
      }}
    >
      <ActivityIndicator color={colors.teal} size="large" />
    </View>
  );
}
