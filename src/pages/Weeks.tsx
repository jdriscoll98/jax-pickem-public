import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { collection, doc, setDoc } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { firestore, functions } from "../firebase";
import { arrowBack } from "ionicons/icons";
import { useHttpsCallable } from "react-firebase-hooks/functions";

export default function Weeks() {
  const [weeks] = useCollectionData(collection(firestore, "weeks"));

  const [executeCallable, executing, error] = useHttpsCallable<
    void,
    {
      error?: string;
      success?: string;
    }
  >(functions, "initializeWeek");
  return (
    <IonPage>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton routerLink="/settings" routerDirection="back">
            <IonIcon icon={arrowBack} />
          </IonButton>
        </IonButtons>
        <IonTitle>Weeks</IonTitle>
      </IonToolbar>
      <IonContent fullscreen>
        <IonList>
          {weeks?.length ? (
            weeks.map((week) => (
              <IonItem key={week.id} routerLink={`/weeks/${week.id}`}>
                <IonLabel>{week.name}</IonLabel>
              </IonItem>
            ))
          ) : (
            <IonItem>
              <IonLabel>No weeks found</IonLabel>
            </IonItem>
          )}
          <IonItem>
            <IonButton onClick={() => executeCallable()}>
              <IonLabel>{executing ? "Loading..." : "Add Week"}</IonLabel>
            </IonButton>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
}
