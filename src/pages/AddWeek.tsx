import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { functions } from "../firebase";
import { arrowBack } from "ionicons/icons";

export default function AddWeek() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [present] = useIonToast();
  const router = useIonRouter();
  const [executeCallable, executing, error] = useHttpsCallable<
    {
      name: string;
      from: string;
      to: string;
    },
    void
  >(functions, "initializeWeek");

  const handleSubmit = async () => {
    if (!from || !to || !name) return;
    await executeCallable({
      name,
      from: from.split("T")[0],
      to: to.split("T")[0],
    });
    present({
      message: "Week added successfully",
      duration: 3000,
      position: "bottom",
    });
    router.push("/weeks", "back");
  };

  useEffect(() => {
    if (error) {
      present({
        message: error.message,
        duration: 3000,
        position: "bottom",
      });
    }
  }, [error]);
  return (
    <IonPage>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton routerLink="/weeks" routerDirection="back">
            <IonIcon icon={arrowBack} />
          </IonButton>
        </IonButtons>
        <IonTitle>Add Week</IonTitle>
      </IonToolbar>
      <IonContent fullscreen>
        <form>
          <IonItem>
            <IonLabel>From</IonLabel>
            <IonDatetimeButton datetime="from"></IonDatetimeButton>

            <IonModal keepContentsMounted={true}>
              <IonDatetime
                presentation="date"
                id="from"
                onIonChange={(e) => {
                  setFrom(e.detail.value! as string);
                }}
              ></IonDatetime>
            </IonModal>
          </IonItem>
          <IonItem>
            <IonLabel>To</IonLabel>
            <IonDatetimeButton datetime="to"></IonDatetimeButton>

            <IonModal keepContentsMounted={true}>
              <IonDatetime
                presentation="date"
                id="to"
                onIonChange={(e) => {
                  setTo(e.detail.value! as string);
                }}
              ></IonDatetime>
            </IonModal>
          </IonItem>
          <IonItem>
            <IonLabel>Name</IonLabel>
            <IonInput
              value={name}
              onIonInput={(e) => setName(e.detail.value!)}
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonButton expand="full" onClick={handleSubmit}>
              {executing ? "Loading..." : "Submit"}
            </IonButton>
          </IonItem>
        </form>
      </IonContent>
    </IonPage>
  );
}
