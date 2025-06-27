// app/set-password/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth-options";
import SetPasswordForm from "../../components/SetPasswordForm";

interface SetPasswordPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function SetPasswordPage({
  searchParams,
}: SetPasswordPageProps) {
  const session = await getServerSession({
    ...authOptions,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { email: queryEmail } = await searchParams;
  const email = session?.user?.email || queryEmail;
  const unauth = !session?.user?.email;

  if (!email) {
    redirect("/login");
  }

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <h1 className="text-3xl font-orbitron text-center">Set Your Password</h1>
      <SetPasswordForm email={email} unauth={unauth} />
    </div>
  );
}
