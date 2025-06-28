import { Suspense } from "react";
import ClientForm from "./ClientForm";

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientForm />
    </Suspense>
  );
}
