import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import {
  doc,
  collection,
  updateDoc,
  FieldValue,
  arrayUnion,
} from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { firestore } from "../firebase";
import { GameDocument, WeekDocument } from "../types";
import { useParams } from "react-router";
import { useState } from "react";
import { getGameId, slugify } from "../utils";
import { arrowBack } from "ionicons/icons";

export default function AddGame() {
  const router = useIonRouter();
  const { id } = useParams<{ id: string }>();
  const reference = doc(collection(firestore, "weeks"), id);
  const [week, loading] = useDocumentData<WeekDocument>(reference as any);
  const [game, setGame] = useState<GameDocument>({
    id: "",
    home: "",
    away: "",
    home_spread: 0,
    away_spread: 0,
    overUnder: 0,
    config: {
      pickMethod: "either",
      enabled: true,
    },
    sport: "custom",
    commence_time: "",
  });
  if (loading) return "Loading...";
  if (!week) return null;

  const handleSubmit = async () => {
    if (!week) return;
    if (!game.home || !game.away) return;
    if (!game.overUnder) return;
    game.id = getGameId(game, week);
    await updateDoc(reference, {
      games: arrayUnion(game),
    });
    router.push(`/weeks/${id}`);
  };
  return (
    <IonPage>
      <IonToolbar>
        <IonTitle>Add Game - {week.name}</IonTitle>
        <IonButtons slot="start">
          <IonButton routerLink={`/weeks/${id}`} routerDirection="back">
            <IonIcon icon={arrowBack} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
      <IonContent fullscreen>
        <IonList>
          <IonItem>
            <IonInput
              label="Home"
              onIonInput={(e) =>
                setGame({
                  ...game,
                  home: e.detail.value!,
                })
              }
              value={game.home}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Away"
              onIonInput={(e) =>
                setGame({
                  ...game,
                  away: e.detail.value!,
                })
              }
              value={game.away}
            />
          </IonItem>
          <IonItem>
            <IonInput
              type="number"
              label="Home Spread"
              onIonInput={(e) =>
                setGame({
                  ...game,
                  home_spread: Number(e.detail.value!),
                })
              }
              value={game.home_spread}
            />
          </IonItem>
          <IonItem>
            <IonInput
              type="number"
              label="Away Spread"
              onIonInput={(e) =>
                setGame({
                  ...game,
                  away_spread: Number(e.detail.value!),
                })
              }
              value={game.away_spread}
            />
          </IonItem>
          <IonItem>
            <IonInput
              type="number"
              label="Over/Under"
              onIonInput={(e) =>
                setGame({
                  ...game,
                  overUnder: Number(e.detail.value!),
                })
              }
              value={game.overUnder}
            />
          </IonItem>
          <IonItem>
            <IonLabel>Pick Method</IonLabel>
            <IonSelect
              value={game.config?.pickMethod}
              onIonChange={(e) =>
                setGame({
                  ...game,
                  config: {
                    ...game.config,
                    pickMethod: e.detail.value!,
                  },
                })
              }
            >
              <IonSelectOption value="either">Either</IonSelectOption>
              <IonSelectOption value="both">Both</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel>Enabled</IonLabel>
            <IonToggle
              checked={game.config?.enabled}
              onIonChange={(e) =>
                setGame({
                  ...game,
                  config: {
                    ...game.config,
                    enabled: e.detail.checked,
                  },
                })
              }
            />
          </IonItem>
          <IonItem>
            <IonButton expand="full" onClick={handleSubmit}>
              {loading ? "Loading..." : "Submit"}
            </IonButton>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
}
