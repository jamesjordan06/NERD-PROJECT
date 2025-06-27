// app/set-password/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth-options";
import SetPasswordForm from "../../components/SetPasswordForm";
import InvalidTokenNotice from "../../components/InvalidTokenNotice";
import { createClient } from "@supabase/supabase-js";
import type { PageProps } from "next";

export async function generateStaticParams(): Promise<Record<string, never>[]> {
  return [];
}

export default async function SetPasswordPage({
  searchParams,
}: PageProps<{}, { token?: string }>) {
  const session = await getServerSession({
    ...authOptions,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { token } = searchParams;

  if (session?.user?.email) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <h1 className="text-3xl font-orbitron text-center">
          Set Your Password
        </h1>
        <SetPasswordForm email={session.user.email} />
      </div>
    );
  }

  if (!token) {
    redirect("/login");
  }

  const verifyRes = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/verify-reset-token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    }
  );

  const verifyData = await verifyRes.json();

  if (!verifyRes.ok || !verifyData.valid) {
    return (
      <div className="max-w-md mx-auto py-12">
        <InvalidTokenNotice />
      </div>
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: user } = await supabase
    .from("users")
    .select("email, hashed_password")
    .eq("id", verifyData.user_id)
    .maybeSingle();

  if (!user || user.hashed_password) {
    return (
      <div className="max-w-md mx-auto py-12">
        <InvalidTokenNotice />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <h1 className="text-3xl font-orbitron text-center">Set Your Password</h1>
      <SetPasswordForm email={user.email} unauth token={token!} />
    </div>
  );
}
