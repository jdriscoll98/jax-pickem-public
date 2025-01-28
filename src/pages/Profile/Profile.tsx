import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonPage,
  IonRow,
} from "@ionic/react";
import { collection, doc } from "firebase/firestore";
import { pencil } from "ionicons/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import { useObjectVal } from "react-firebase-hooks/database";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { auth, database, firestore } from "../../firebase";
import { Stats, UserDocument } from "../../types";
import "./Profile.css";
import { ref } from "firebase/database";

export default function Profile() {
  const [user] = useAuthState(auth);
  const realTimeRef = ref(database, user?.uid);
  const [val] = useObjectVal<UserDocument>(realTimeRef);
  const statsRef = doc(collection(firestore, "stats"), user?.uid ?? "");
  const [stats] = useDocumentData<Stats>(statsRef as any);
  if (!user || !stats) return null;
  return (
    <IonPage>
      <IonContent class="ion-padding">
        <IonItem>Performance Stats</IonItem>
        <IonGrid className="grid-table">
          <IonRow>
            <IonCol>Weeks Played</IonCol>
            <IonCol>{stats.weeksPlayed}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>Wins</IonCol>
            <IonCol>{stats.wins}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>Average %</IonCol>
            <IonCol>{stats.averagePercent.toFixed(2)}%</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>Best Finish</IonCol>
            <IonCol>{stats.bestFinish}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>Average Finish</IonCol>
            <IonCol>{stats.averageFinish.toFixed(1)}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>Money Spent</IonCol>
            <IonCol>${stats.weeksPlayed * 20}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>Money Won</IonCol>
            <IonCol>${stats.moneyWon.toFixed(2)}</IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
}
