import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { ref } from "firebase/database";
import { collection, doc } from "firebase/firestore";
import { arrowBack } from "ionicons/icons";
import { useObjectVal } from "react-firebase-hooks/database";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useParams } from "react-router";
import { Summary } from "../../components/Summary";
import { auth, database, firestore } from "../../firebase";
import { UserDocument, WeekDocument } from "../../types";
import "./PickSummary.css";
import { useAuthState } from "react-firebase-hooks/auth";
export default function PickSummary() {
  const uid = useParams<{ uid: string }>().uid;
  const [user] = useAuthState(auth);
  const realTimeRef = ref(database, user?.uid);
  const [val] = useObjectVal<UserDocument>(realTimeRef);
  const [week] = useDocumentData<WeekDocument>(
    doc(collection(firestore, "weeks"), val?.week ?? "1") as any
  );
  return (
    <IonPage>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton routerLink="/leaderboard" routerDirection="back">
            <IonIcon icon={arrowBack} slot="icon-only" />
          </IonButton>
        </IonButtons>
        <IonHeader>
          <IonTitle>Pick Summary</IonTitle>
        </IonHeader>
      </IonToolbar>
      <Summary week={week} uid={uid} />
    </IonPage>
  );
}
