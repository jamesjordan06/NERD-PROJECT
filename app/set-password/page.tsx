// app/set-password/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth-options";
import SetPasswordForm from "../../components/SetPasswordForm";

export default async function SetPasswordPage() {
  const session = await getServerSession({
    ...authOptions,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <h1 className="text-3xl font-orbitron text-center">Set Your Password</h1>
      <SetPasswordForm email={session!.user.email} />
    </div>
  );
}
