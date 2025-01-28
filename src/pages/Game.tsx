import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonItemDivider,
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
import { collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useParams } from "react-router";
import { firestore } from "../firebase";
import { GameDocument, WeekDocument } from "../types";
import { arrowBack } from "ionicons/icons";
import { useState } from "react";
import { getGameId } from "../utils";

export default function Game() {
  const router = useIonRouter();
  const [updates, setUpdates] = useState<Partial<Partial<GameDocument>>>({});
  const { id, gameId } = useParams<{ id: string; gameId: string }>();
  const reference = doc(collection(firestore, "weeks"), id);
  const [week] = useDocumentData<WeekDocument>(reference as any);
  if (!week) return null;
  const game = week.games?.find((game) => game.id === gameId);
  if (!game) return null;

  const handleSubmit = async () => {
    if (!week) return;
    if (!game) return;
    if (!updates) return;
    const newGame = { ...game, ...updates };
    newGame.id = game.sport == "custom" ? getGameId(newGame, week) : game.id;
    const newWeek = {
      ...week,
      games: week.games?.map((g) => (g.id === game.id ? newGame : g)) ?? [],
    };
    await updateDoc(reference, newWeek);
    router.push(`/weeks/${id}`, "back");
  };
  return (
    <IonPage>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton routerLink={`/weeks/${id}`} routerDirection="back">
            <IonIcon icon={arrowBack} />
          </IonButton>
        </IonButtons>
        <IonTitle>
          {game.home} vs {game.away}
        </IonTitle>
      </IonToolbar>
      <IonContent fullscreen>
        <IonList>
          <IonItemDivider>
            <IonLabel>Game</IonLabel>
          </IonItemDivider>
          <IonItem>
            <IonLabel>Home</IonLabel>
            <IonInput
              value={updates.home ?? game.home}
              onIonInput={(e) =>
                setUpdates({ ...updates, home: e.detail.value! })
              }
            />
          </IonItem>
          <IonItem>
            <IonLabel>Away</IonLabel>
            <IonInput
              value={updates.away ?? game.away}
              onIonInput={(e) =>
                setUpdates({ ...updates, away: e.detail.value! })
              }
            />
          </IonItem>
          <IonItem>
            <IonLabel>Home Spread</IonLabel>
            <IonInput
              type="number"
              value={updates.home_spread ?? game.home_spread}
              onIonInput={(e) =>
                setUpdates({ ...updates, home_spread: Number(e.detail.value!) })
              }
            />
          </IonItem>
          <IonItem>
            <IonLabel>Away Spread</IonLabel>
            <IonInput
              type="number"
              value={updates.away_spread ?? game.away_spread}
              onIonInput={(e) =>
                setUpdates({ ...updates, away_spread: Number(e.detail.value!) })
              }
            />
          </IonItem>
          <IonItem>
            <IonLabel>Over/Under</IonLabel>
            <IonInput
              type="number"
              value={updates.overUnder ?? game.overUnder}
              onIonInput={(e) =>
                setUpdates({ ...updates, overUnder: Number(e.detail.value!) })
              }
            />
          </IonItem>
          <IonItemDivider>
            <IonLabel>Config</IonLabel>
          </IonItemDivider>
          <IonItem>
            <IonLabel>Pick Method</IonLabel>
            <IonSelect
              value={updates?.config?.pickMethod ?? game.config?.pickMethod}
              onIonChange={(e) =>
                setUpdates({
                  ...updates,
                  config: {
                    ...game.config,
                    ...updates.config,
                    pickMethod: e.detail.value!,
                  },
                })
              }
            >
              <IonSelectOption value="either">Either</IonSelectOption>
              <IonSelectOption value="both">Both</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItemDivider>
            <IonLabel>Results</IonLabel>
          </IonItemDivider>
          <IonItem>
            <IonLabel>Winner</IonLabel>
            <IonSelect
              value={updates?.results?.winner ?? game.results?.winner}
              onIonChange={(e) =>
                setUpdates({
                  ...updates,
                  results: {
                    ...game.results,
                    ...updates.results,
                    winner: e.detail.value!,
                  },
                })
              }
            >
              <IonSelectOption value="home">{game.home}</IonSelectOption>
              <IonSelectOption value="away">{game.away}</IonSelectOption>
              <IonSelectOption value="push">Push</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel>Over/Under</IonLabel>
            <IonSelect
              value={updates?.results?.overUnder ?? game.results?.overUnder}
              onIonChange={(e) =>
                setUpdates({
                  ...updates,
                  results: {
                    ...game.results,
                    ...updates.results,
                    overUnder: e.detail.value!,
                  },
                })
              }
            >
              <IonSelectOption value="over">Over</IonSelectOption>
              <IonSelectOption value="under">Under</IonSelectOption>
              <IonSelectOption value="push">Push</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItemDivider />
          <IonItem>
            <IonLabel>Locked</IonLabel>
            <IonToggle
              checked={updates?.locked ?? game?.locked}
              onIonChange={(e) =>
                setUpdates({
                  ...updates,
                  locked: e.detail.checked,
                })
              }
            />
          </IonItem>
          <IonItem>
            <IonButton
              disabled={!Object.keys(updates).length}
              expand="full"
              onClick={() => setUpdates({})}
            >
              Reset Changes
            </IonButton>
            <IonButton expand="full" onClick={handleSubmit}>
              Submit Changes
            </IonButton>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
}
