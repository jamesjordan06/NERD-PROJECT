// app/set-password/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth-options";
import SetPasswordForm from "../../components/SetPasswordForm";
import InvalidTokenNotice from "../../components/InvalidTokenNotice";
import { createClient } from "@supabase/supabase-js";

interface SetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function SetPasswordPage({
  searchParams,
}: SetPasswordPageProps) {
  const session = await getServerSession({
    ...authOptions,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { token } = await searchParams;

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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: tokenRow } = await supabase
    .from("verification_tokens")
    .select("identifier, expires")
    .eq("token", token!)
    .maybeSingle();

  if (
    !tokenRow ||
    !tokenRow.identifier.startsWith("set-password:") ||
    new Date(tokenRow.expires).getTime() < Date.now()
  ) {
    return (
      <div className="max-w-md mx-auto py-12">
        <InvalidTokenNotice />
      </div>
    );
  }

  const userId = tokenRow.identifier.replace("set-password:", "");

  const { data: user } = await supabase
    .from("users")
    .select("email, hashed_password")
    .eq("id", userId)
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
