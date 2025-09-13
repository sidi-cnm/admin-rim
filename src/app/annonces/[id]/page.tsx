// app/[locale]/my/details/[id]/page.tsx
import MyAnnonceDetailsUI from "./ui";
import BackButton from "../../component/Navigation";
import { getDb } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { getUserFromCookies } from  "../../../utils/getUserFomCookies";

type PageParams = { locale: string; id: string };

export default async function AnnonceDetail({
  params,
}: {
  params: Promise<PageParams>;          // <-- Next 15: params est un Promise
}) {
  const { locale, id } = await params;  // <-- on "await" les params
  

  const user = await getUserFromCookies();
  const userId = user?.id ?? "";

  const db = await getDb();

  let contact = "Contact non trouvé";
  if (userId) {
    const contactDoc = await db.collection("contacts").findOne({
      userId: ObjectId.isValid(userId) ? String(new ObjectId(userId)) : String(userId),
    });
    if (contactDoc?.contact) contact = String(contactDoc.contact);
  }

  const annonceDbId = id;

  const modeOptionsApi =
    process.env.NEXT_PUBLIC_OPTIONS_API_MODE === "tursor" ? "tursor" : "sqlite";
  const baseApiOptions =  "/api";
  const typeAnnoncesEndpoint = `${baseApiOptions}/options`;
  const categoriesEndpoint = `${baseApiOptions}/options`;
  const subCategoriesEndpoint = `${baseApiOptions}/options`;

  const getAnnonceUrl = `/api/annonce/${annonceDbId}`;
  const updateAnnonceEndpoint = `/api/annonce/${annonceDbId}`;

  return (
    <div className="p-4 sm:p-6 md:p-9 overflow-hidden">
      <div><BackButton /></div>

      <MyAnnonceDetailsUI
        lang={locale}
        i18nAnnonce={"Annonces"}
        i18nContact={"Contact"}
        i18nPrix={"Prix"}
        i18nNotificationsCreating={"Création de l’annonce..."}
        i18nNotificationsErrorDelete={"Deltion de l’annonce a échoué"}
        i18nNotificationsSuccessDelete={"Annonce supprimée avec succès"}
        annonceId={annonceDbId}
        retiveUrldetailsAnnonce={getAnnonceUrl}
        typeAnnoncesEndpoint={typeAnnoncesEndpoint}
        categoriesEndpoint={categoriesEndpoint}
        subCategoriesEndpoint={subCategoriesEndpoint}
        updateAnnonceEndpoint={updateAnnonceEndpoint}
      />
    </div>
  );
}
