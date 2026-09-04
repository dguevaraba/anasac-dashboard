import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  ensureAccessAfterLogin,
  inviteTokenFromNext,
  safeNextPath,
} from "@/lib/auth/ensure-access";

const OAUTH_NEXT_COOKIE = "anasac_oauth_next";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextFromQuery = searchParams.get("next");
  const nextFromCookie = request.cookies.get(OAUTH_NEXT_COOKIE)?.value;
  const next = safeNextPath(
    nextFromQuery ??
      (nextFromCookie ? decodeURIComponent(nextFromCookie) : null),
  );

  function clearNextCookie(response: NextResponse) {
    response.cookies.set(OAUTH_NEXT_COOKIE, "", {
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  if (!isSupabaseConfigured()) {
    return clearNextCookie(
      NextResponse.redirect(`${origin}/login?error=config`),
    );
  }

  if (!code) {
    return clearNextCookie(
      NextResponse.redirect(`${origin}/login?error=oauth`),
    );
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return clearNextCookie(
      NextResponse.redirect(`${origin}/login?error=oauth`),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return clearNextCookie(
      NextResponse.redirect(`${origin}/login?error=oauth`),
    );
  }

  const access = await ensureAccessAfterLogin({
    supabase,
    user,
    inviteToken: inviteTokenFromNext(next),
  });

  if (access.status === "ok") {
    const destination = inviteTokenFromNext(next) ? "/dashboard" : next;
    return clearNextCookie(NextResponse.redirect(`${origin}${destination}`));
  }

  await supabase.auth.signOut();

  if (access.status === "inactive") {
    return clearNextCookie(
      NextResponse.redirect(`${origin}/login?error=inactivo`),
    );
  }

  if (inviteTokenFromNext(next)) {
    return clearNextCookie(
      NextResponse.redirect(`${origin}${next}?error=invitacion`),
    );
  }

  return clearNextCookie(
    NextResponse.redirect(`${origin}/login?error=sin_invitacion`),
  );
}
