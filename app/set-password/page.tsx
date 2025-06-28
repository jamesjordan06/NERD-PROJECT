import dynamic from "next/dynamic";
const ClientForm = dynamic(() => import("./ClientForm"), { ssr: false });

export default function SetPasswordPage() {
  return <ClientForm />;
}
