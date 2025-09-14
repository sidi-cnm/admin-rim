// src/app/[locale]/users/new/page.tsx
import { Suspense } from "react";
import NewUserForm from "../../component/NewUserForm";

export default function NewUserPage({
  params,
}: { params: { locale: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewUserForm locale={params.locale} />
    </Suspense>
  );
}
