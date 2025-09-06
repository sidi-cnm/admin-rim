// src/app/[locale]/users/new/page.tsx
import NewUserForm from "../../../component/NewUserForm";

export default function NewUserPage({
  params,
}: { params: { locale: string } }) {
  return <NewUserForm locale={params.locale} />;
}
