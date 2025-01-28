import {
  IonCheckbox,
  IonCol,
  IonContent,
  IonLabel,
  IonPage,
  IonRow,
} from "@ionic/react";
import Toolbar from "../components/Toolbar";
import { ref } from "firebase/database";
import { doc, collection, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useObjectVal } from "react-firebase-hooks/database";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { auth, database, firestore, functions } from "../firebase";
import { UserDocument, WeekDocument } from "../types";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { useEffect, useState } from "react";

export default function Payments() {
  const [user] = useAuthState(auth);
  const realTimeRef = ref(database, user?.uid);
  const [val] = useObjectVal<UserDocument>(realTimeRef);
  const [week] = useDocumentData<WeekDocument>(
    doc(collection(firestore, "weeks"), val?.week ?? "1") as any
  );

  return (
    <IonPage>
      <Toolbar title="Payments" />
      <IonContent fullscreen>
        {Object.keys(week?.picks ?? {}).sort().map((uid) => (
          <PaymentRow key={uid} uid={uid} />
        ))}
      </IonContent>
    </IonPage>
  );
}

const PaymentRow = ({ uid }: { uid: string }) => {
  const [user] = useAuthState(auth);
  const realTimeRef = ref(database, user?.uid);
  const [val] = useObjectVal<UserDocument>(realTimeRef);
  const reference = doc(
    collection(firestore, "weeks"),
    val?.week ?? "1"
  ) as any;
  const [week] = useDocumentData<WeekDocument>(reference);
  const [executeCallable, loading, error] = useHttpsCallable<
    { uid: string },
    string
  >(functions, "getEmail");
  const [email, setEmail] = useState<string>("");
  useEffect(() => {
    if (error) {
      // present({
      //   message: error.message,
      //   duration: 3000,
      //   position: "bottom",
      // });
    }
  }, [error]);

  useEffect(() => {
    if (loading) return;
    if (!uid) return;
    executeCallable({
      uid,
    }).then((res) => {
      setEmail(res?.data ?? "");
    }).catch((e) => {
      // present({
      //   message: e.message,
      //   duration: 3000,
      //   position: "bottom",
      // });
    });
  }, [uid]);
  const paid = week?.payments?.[uid]?.paid;
  return (
    <IonRow className="ion-padding">
      <IonCol>{email}</IonCol>
      <IonCol>
        <IonCheckbox
          checked={paid}
          onIonChange={(async (e) =>
            await updateDoc(reference, {
              [`payments.${uid}.paid`]: e.detail.checked,
            })
          )}
        >
          <IonLabel>{"Paid?"}</IonLabel>
        </IonCheckbox>
      </IonCol>
    </IonRow>
  );
};
