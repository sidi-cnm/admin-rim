
import AddAnnonceWizard from "../component/AddAnnonceWizard";
// import { getUserFromCookies } from "../../../../utiles/getUserFomCookies";
import { getDb } from "../../lib/mongodb";
import { ObjectId } from "mongodb";





export default async function AddAnnonce(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  console.log("Locale from params:", params);

  const relavieUrlAnnonce = `/api/annonce`;
  let relavieUrlOptionsModel = `/api/options`;
  if (process.env.NEXT_PUBLIC_OPTIONS_API_MODE === "sqlite") {
    relavieUrlOptionsModel = `/api/options`;
}

  let isSamsar;

//   const user = await getUserFromCookies();
  const db = await getDb();

  const userid = "68a63b0e432f2f2815632f69"
 
    
    const userIndb= await db.collection("users").findOne({_id: new ObjectId(userid)});
    console.log("userIndb check:", userIndb);
    if(userIndb){
      console.log("userIndb:", userIndb);
      isSamsar = userIndb.samsar;
    }
  



  return (
    <AddAnnonceWizard
      lang={params.locale}
      relavieUrlOptionsModel={relavieUrlOptionsModel}
      relavieUrlAnnonce={relavieUrlAnnonce}
      isSamsar={isSamsar}
    />
  );
}
