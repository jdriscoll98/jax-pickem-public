import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonImg,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToggle,
  IonToolbar,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import { collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { arrowBack, arrowForward, pencilOutline } from "ionicons/icons";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useParams } from "react-router";
import { firestore, functions } from "../firebase";
import { GameDocument, TeamsResponse, WeekDocument } from "../types";
import { useEffect, useState } from "react";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { getImageUrl } from "../utils";

export default function Week() {
  const router = useIonRouter();
  const [present] = useIonToast();
  const { id } = useParams<{ id: string }>();
  const reference = doc(collection(firestore, "weeks"), id);
  const [week, loading] = useDocumentData<WeekDocument>(reference as any);
  const [search, setSearch] = useState<string>("");
  const deleteWeek = async () => {
    if (!week) return;
    await deleteDoc(reference);
    router.push("/weeks");
  };

  const [executeCallable, executing, error] = useHttpsCallable<
    {
      weekId: string;
    },
    {
      error?: string;
      success?: string;
    }
  >(functions, "updateOdds");

  const [executeCallableResults, executingResults, errorResults] =
    useHttpsCallable<
      {
        weekId: string;
      },
      {
        error?: string;
        success?: string;
      }
    >(functions, "updateResults");

  const [executeCallableLocks, executingLocks, errorLocks] = useHttpsCallable<
    {
      weekId: string;
    },
    {
      error?: string;
      success?: string;
    }
  >(functions, "updateLocks");
  const [executeCallableGames, executingGames, errorGames] = useHttpsCallable<
    {
      weekId: string;
    },
    {
      error?: string;
      success?: string;
    }
  >(functions, "updateGames");

  const updateOdds = async () => {
    if (!week) return;
    const res = await executeCallable({
      weekId: id,
    });
    alert(JSON.stringify(res));
  };

  const updateResults = async () => {
    if (!week) return;
    const res = await executeCallableResults({
      weekId: id,
    });
    alert(JSON.stringify(res));
  };
  const updateLocks = async () => {
    if (!week) return;
    const res = await executeCallableLocks({
      weekId: id,
    });
    alert(JSON.stringify(res));
  };
  const updateGames = async () => {
    if (!week) return;
    const res = await executeCallableGames({
      weekId: id,
    });
    alert(JSON.stringify(res));
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

  useEffect(() => {
    if (errorResults) {
      present({
        message: errorResults.message,
        duration: 3000,
        position: "bottom",
      });
    }
  }, [errorResults]);
  if (!week) return null;
  if (loading) return "Loading...";
  return (
    <IonPage>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton routerLink="/weeks" routerDirection="back">
            <IonIcon icon={arrowBack} />
          </IonButton>
        </IonButtons>
        <IonTitle>{week.name}</IonTitle>
      </IonToolbar>
      <IonContent fullscreen>
        <IonItem>
          <IonLabel>Published</IonLabel>

          <IonToggle
            justify="end"
            enableOnOffLabels
            checked={week.published}
            onIonChange={async (e) => {
              if (!week) return;

              await updateDoc(reference, {
                published: e.detail.checked,
              });
            }}
          ></IonToggle>
        </IonItem>
        <IonItemDivider>
          <IonLabel>Games</IonLabel>
          <IonSearchbar
            value={search}
            onIonInput={(e) => setSearch(e.target.value!)}
          ></IonSearchbar>
        </IonItemDivider>
        <IonItemDivider>
          <IonButton onClick={updateGames}>
            {executingGames ? "Loading..." : "Update Games"}
          </IonButton>
          <IonButton onClick={updateOdds}>
            {executing ? "Loading..." : "Update Odds"}
          </IonButton>
          <IonButton onClick={updateResults}>
            {executingResults ? "Loading..." : "Update Results"}
          </IonButton>
          <IonButton onClick={updateLocks}>
            {executingLocks ? "Loading..." : "Update Locks"}
          </IonButton>
        </IonItemDivider>
        <IonList>
          {week.games?.length ? (
            week.games
              .filter(
                (game) =>
                  !search ||
                  game.home.toLowerCase().includes(search.toLowerCase()) ||
                  game.away.toLowerCase().includes(search.toLowerCase())
              )
              .sort((a, b) => a.id.localeCompare(b.id))
              .map((game) => (
                <IonItem detail={false} key={game.home + game.away}>
                  <GameLabel game={game} />
                  <IonToggle
                    justify="end"
                    enableOnOffLabels
                    checked={game.config?.enabled}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onIonChange={async (e) => {
                      if (!week.games) return;
                      await updateDoc(reference, {
                        games: [
                          ...week.games.filter((g) => g.id !== game.id),
                          {
                            ...game,
                            config: {
                              ...game.config,
                              enabled: e.detail.checked,
                            },
                          },
                        ],
                      });
                    }}
                  ></IonToggle>
                  <IonButton
                    className="ion-margin-start"
                    onClick={() => router.push(`/weeks/${id}/games/${game.id}`)}
                  >
                    <IonIcon slot="icon-only" icon={pencilOutline} />
                  </IonButton>
                </IonItem>
              ))
          ) : (
            <IonItem>
              <IonLabel>No games found</IonLabel>
            </IonItem>
          )}
          <IonItem button={true} routerLink={`/weeks/${id}/add-game`}>
            <IonLabel>Add Game</IonLabel>
          </IonItem>
          <IonItemDivider />
          <IonItem button={true} detail={false} onClick={() => deleteWeek()}>
            <IonLabel>Delete Week</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
}

function GameLabel({ game }: { game: GameDocument }) {
  const homeTeamReference = doc(collection(firestore, "teams"), `${game.home}`);
  const [homeTeam] = useDocumentData<TeamsResponse>(homeTeamReference as any);
  const awayTeamReference = doc(collection(firestore, "teams"), `${game.away}`);
  const [awayTeam] = useDocumentData<TeamsResponse>(awayTeamReference as any);
  return (
    <IonLabel>
      <IonImg
        style={{
          width: "50px",
          height: "50px",
        }}
        src={getImageUrl(game.home, game.sport, homeTeam)}
      />
      <IonImg
        style={{
          width: "50px",
          height: "50px",
        }}
        src={getImageUrl(game.away, game.sport, awayTeam)}
      />
      {game.home} vs {game.away} <br />
      {new Date(game.commence_time ?? Date.now()).toLocaleString()}
    </IonLabel>
  );
}
