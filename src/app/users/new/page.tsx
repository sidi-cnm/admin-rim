// src/app/[locale]/users/new/page.tsx
import { Suspense } from "react";
import NewUserForm from "../../component/NewUserForm";

export default function NewUserPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewUserForm />
    </Suspense>
  );
}
