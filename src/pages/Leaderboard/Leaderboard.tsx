import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonPopover,
  IonRow,
  IonSpinner,
  useIonRouter,
} from "@ionic/react";
import Toolbar from "../../components/Toolbar";
import { ref } from "firebase/database";
import { doc, collection } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useListKeys, useObjectVal } from "react-firebase-hooks/database";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { auth, database, firestore } from "../../firebase";
import { UserDocument, WeekDocument } from "../../types";
import { getPotentialScore, getScore } from "../../utils";
import styles from "./Leaderboard.module.css";
import { help, helpCircleOutline } from "ionicons/icons";
const Leaderboard: React.FC = () => {
  const [user] = useAuthState(auth);
  const realTimeRef = ref(database, user?.uid);
  const [val] = useObjectVal<UserDocument>(realTimeRef);
  const [week] = useDocumentData<WeekDocument>(
    doc(collection(firestore, "weeks"), val?.week ?? "1") as any
  );
  const [uids] = useListKeys(ref(database, "/"));
  const [chances] = useDocumentData<Record<string, number>>(
    doc(collection(firestore, "chances"), val?.week ?? "1") as any
  );
  if (!week) return null;

  const paid = ({ uid }: { uid: string }) => {
    return week.payments?.[uid]?.paid;
  };
  const unpaid = uids
    ?.filter((uid) => !paid({ uid }))
    .map((uid) => [uid, null] as const);

  const scores = uids
    ?.filter((uid) => !unpaid?.find((i) => i[0] === uid))
    ?.map((uid) => [uid, getScore(uid, week)] as const)
    .sort((a, b) => b[1] - a[1]);

  const getRank = (score: number) => {
    if (!scores) return `-`;
    const rank = scores?.findIndex((s) => s[1] === score);
    if (rank === -1) return `-`;
    // if there are more than one score with the same score, add a "T" to the beginning
    if (scores?.filter((s) => s[1] === score).length > 1) {
      return `T${rank + 1}`;
    }
    return `${rank + 1}`;
  };
  const payments = Object.values(week.payments ?? {});
  if (!scores) return <IonSpinner />;
  return (
    <IonPage>
      <Toolbar title="Leaderboard" />
      <IonItem
        style={{
          "--border-radius": "0px",
        }}
      >
        <IonLabel className="ion-text-center">
          Pot ${payments.filter((p) => p.paid).length * 20}
        </IonLabel>
      </IonItem>
      <IonContent fullscreen>
        <IonGrid className="ion-no-padding">
          <LeaderboardHeader />
          {scores.map(([uid, score], index) => (
            <LeaderboardRow
              uid={uid}
              key={uid}
              score={score}
              chanceToWin={chances?.[uid]}
              rank={getRank(score)}
              paid
            />
          ))}
          {/* {incompletes?.map(([uid, score], index) => (
            <LeaderboardRow
              uid={uid}
              key={uid}
              score={score}
              rank={index + 1 + scores.length}
              paid
            />
          ))} */}
          {unpaid?.map(([uid, score], index) => (
            <LeaderboardRow
              uid={uid}
              key={uid}
              score={score}
              rank={`${index + 1 + scores.length}`}
              paid={false}
            />
          ))}
          <IonRow>
            <IonCol size="12" className="ion-text-center ion-padding">
              <IonLabel>Click a row to see the full picks</IonLabel>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

const LeaderboardHeader = () => {
  const [user] = useAuthState(auth);
  const realTimeRef = ref(database, user?.uid);
  const [val] = useObjectVal<UserDocument>(realTimeRef);
  return (
    <IonRow className={styles.header}>
      <IonCol
        size="1"
        style={{
          alignSelf: "center",
        }}
      >
        #
      </IonCol>
      <IonCol
        size="5"
        style={{
          alignSelf: "center",
        }}
      >
        Name
      </IonCol>
      <IonCol size="3">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          Score
          <IonButton
            size="small"
            id="score-info"
            style={{
              "--background": "var(--ion-color-light)",
              "--color": "var(--ion-color-dark)",
              "--background-activated": "var(--ion-color-lught)",
              "--color-activated": "var(--ion-color-dark)",
            }}
          >
            <IonIcon slot="icon-only" icon={helpCircleOutline} />
          </IonButton>
          <IonPopover
            trigger="score-info"
            triggerAction="click"
            animated={false}
            showBackdrop={false}
          >
            <IonContent class="ion-padding">
              Current score is the percentage of correct picks out of the total
              possible picks.
            </IonContent>
          </IonPopover>
        </div>
      </IonCol>
      <IonCol size="3">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          Chance to Win
          <IonButton
            size="small"
            id="max-info"
            style={{
              "--background": "var(--ion-color-light)",
              "--color": "var(--ion-color-dark)",
              "--background-activated": "var(--ion-color-lught)",
              "--color-activated": "var(--ion-color-dark)",
            }}
          >
            <IonIcon slot="icon-only" icon={helpCircleOutline} />
          </IonButton>
          <IonPopover
            trigger="max-info"
            triggerAction="click"
            animated={false}
            showBackdrop={false}
          >
            <IonContent class="ion-padding">
              The probability that each player will win given 100,000
              simulations of the remaining games. If your chance to win is 0,
              you either haven't picked all of your games, or you have no chance
              to win. Percentage is not exact! The simulations are not
              exhaustive, so people with the same score may have different
              chances to win.
            </IonContent>
          </IonPopover>
        </div>
      </IonCol>
    </IonRow>
  );
};

const LeaderboardRow = ({
  uid,
  score,
  rank,
  paid,
  chanceToWin,
}: {
  uid: string;
  score: number | null;
  rank: string;
  paid: boolean;
  chanceToWin?: number;
}) => {
  const realTimeRef = ref(database, uid);
  const [val] = useObjectVal<UserDocument>(realTimeRef);
  const router = useIonRouter();
  return (
    <IonRow className={styles.row} onClick={() => router.push("/picks/" + uid)}>
      <IonCol size="1">{rank}</IonCol>
      <IonCol size="5">{val?.displayName ?? `User ${uid.slice(-5)}`}</IonCol>
      {score !== null ? (
        <IonCol size="3">{score.toFixed(2)}%</IonCol>
      ) : paid ? (
        <IonCol size="3">Incomplete</IonCol>
      ) : (
        <IonCol size="3">Unpaid</IonCol>
      )}
      {chanceToWin !== undefined ? (
        <IonCol size="3">{chanceToWin.toFixed(0)}%</IonCol>
      ) : null}
    </IonRow>
  );
};

export default Leaderboard;
