import {
  IonButton,
  IonButtons,
  IonIcon,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { ref, update } from "firebase/database";
import { collection, query, where } from "firebase/firestore";
import { settings } from "ionicons/icons";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useObjectVal } from "react-firebase-hooks/database";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { auth, database, firestore } from "../firebase";
import { UserDocument, WeekDocument } from "../types";
import UpdateDisplayName from "./UpdateDisplayName";

export default function Toolbar({ title }: { title: string }) {
  const [weeks] = useCollectionData(
    query(collection(firestore, "weeks"), where("published", "==", true))
  );
  const [user] = useAuthState(auth);
  const realTimeRef = ref(database, user?.uid);
  const [val] = useObjectVal<UserDocument>(realTimeRef);
  const [present] = useIonToast();

  // initialize to most recent week
  useEffect(() => {
    if (!val?.week && weeks?.length) {
      const week = weeks
        .sort((a, b) => {
          const week = a as WeekDocument;
          const weekB = b as WeekDocument;
          if (!week.createdAt || !weekB.createdAt) return 0;
          return week.createdAt - weekB.createdAt;
        })
        .findLast((week) => week.published);
      if (!week) return;
      update(realTimeRef, { week: week.id });
    }
  }, [val, weeks]);

  return (
    <>
      <UpdateDisplayName />
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton routerLink="/settings" routerDirection="root">
            <IonIcon color="dark" icon={settings} />
          </IonButton>
        </IonButtons>
        <IonTitle>{title}</IonTitle>
        <IonButtons slot="end">
          <IonButton routerLink="/rules">
            <IonLabel color="dark">How to Play</IonLabel>
          </IonButton>
        </IonButtons>
      </IonToolbar>
      <IonToolbar className="ion-padding-horizontal">
        <IonSelect
          interface="action-sheet"
          label="Selected Week"
          value={val ? val.week : ""}
          onIonChange={async (e) => {
            await update(realTimeRef, { week: e.detail.value! });
          }}
        >
          {(weeks as WeekDocument[])
            ?.sort((a, b) => a.createdAt! - b.createdAt!)
            .map((week) => (
              <IonSelectOption key={week.id} value={week.id}>
                {week.name}
              </IonSelectOption>
            ))}
        </IonSelect>
      </IonToolbar>
    </>
  );
}
