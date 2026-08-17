import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  ensureAccessAfterLogin,
  inviteTokenFromNext,
  safeNextPath,
} from "@/lib/auth/ensure-access";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const access = await ensureAccessAfterLogin({
    supabase,
    user,
    inviteToken: inviteTokenFromNext(next),
  });

  if (access.status === "ok") {
    const destination = inviteTokenFromNext(next) ? "/dashboard" : next;
    return NextResponse.redirect(`${origin}${destination}`);
  }

  await supabase.auth.signOut();

  if (access.status === "inactive") {
    return NextResponse.redirect(`${origin}/login?error=inactivo`);
  }

  if (inviteTokenFromNext(next)) {
    return NextResponse.redirect(`${origin}${next}?error=invitacion`);
  }

  return NextResponse.redirect(`${origin}/login?error=sin_invitacion`);
}
