import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonToast,
  useIonRouter,
  IonButton,
} from "@ionic/react";
import { ref } from "firebase/database";
import { collection, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useObjectVal } from "react-firebase-hooks/database";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { Full } from "../components/Full";
import { Summary } from "../components/Summary";
import Toolbar from "../components/Toolbar";
import { auth, database, firestore } from "../firebase";
import { WeekDocument } from "../types";

const MyPicks: React.FC = () => {
  const [user] = useAuthState(auth);
  const realTimeRef = ref(database, user?.uid);
  const [val] = useObjectVal<{ week: string }>(realTimeRef);
  const [week] = useDocumentData<WeekDocument>(
    doc(collection(firestore, "weeks"), val?.week ?? "1") as any
  );
  const [segment, setSegment] = useState<"full" | "summary">("full");
  const router = useIonRouter();
  if (!user) return null;
  const picks = week?.picks?.[user?.uid ?? ""];
  const pickIds = picks?.map((p) => p.game) ?? [];
  const games = week?.games?.filter((game) => game.config?.enabled) ?? [];
  const gameIds = games.map((g) => g.id);
  const pickNotInGame = pickIds.filter((id) => !gameIds.includes(id));
  const gameNotEnabled = week?.games?.find(g => g.id === pickNotInGame[0])
  const totalPicks =
    picks?.reduce((acc, pick) => {
      if (!pick.winner && !pick.overUnder) return acc;
      if (pick.winner && pick.overUnder) {
        return acc + 2;
      }
      return acc + 1;
    }, 0) ?? 0;

  const unpaid = !week?.payments?.[user?.uid ?? ""]?.paid;
  const isThursday = new Date().getDay() === 4;

  const randomizeAllPicks = async () => {
    if (!week || !user) return;
    const existingPicks = week.picks?.[user.uid] ?? [];
    const newPicks = games.map(
      (game) =>
        existingPicks.find((p) => p.game === game.id) ?? {
          game: game.id,
          winner: Math.random() < 0.5 ? "home" : "away",
          overUnder: Math.random() < 0.5 ? "over" : "under",
        }
    );
    await updateDoc(doc(collection(firestore, "weeks"), week.id), {
      [`picks.${user.uid}`]: newPicks,
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <Toolbar title="My Picks" />
        <IonSegment
          mode="md"
          value={segment}
          color="dark"
          style={{
            background: "var(--ion-color-light)",
          }}
          onIonChange={(e) => setSegment(e.detail.value! as "full" | "summary")}
        >
          <IonSegmentButton value="full">Full</IonSegmentButton>
          <IonSegmentButton value="summary">Summary</IonSegmentButton>
        </IonSegment>
        {totalPicks !== games.length * 2 && (
          <IonItem
            style={{
              "--border-radius": "0px",
              "font-weight": "bold",
            }}
          >
            <IonLabel className="ion-text-center" color="dark">
              {totalPicks}/{games.length * 2} picks selected
            </IonLabel>
            <IonButton
              size="small"
              color="dark"
              onClick={randomizeAllPicks}
              style={{ marginLeft: "10px" }}
            >
              Randomize
            </IonButton>
          </IonItem>
        )}

        {week && isThursday && (
          <IonToast
            isOpen={unpaid}
            message="You have not paid yet."
            position="bottom"
            color="danger"
            buttons={[
              {
                text: "How to pay?",
                handler: () => {
                  router.push("/rules");
                },
              },
            ]}
          />
        )}
      </IonHeader>
      <IonContent fullscreen>
        {segment === "full" ? (
          <Full week={week} />
        ) : (
          <Summary week={week} uid={user.uid} />
        )}
      </IonContent>
    </IonPage>
  );
};

export default MyPicks;
