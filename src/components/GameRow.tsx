import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonProgressBar,
  IonRow,
  useIonToast,
} from "@ionic/react";
import { ref } from "firebase/database";
import { collection, doc, updateDoc } from "firebase/firestore";
import {
  americanFootball,
  americanFootballOutline,
  checkmark,
  lockClosed,
} from "ionicons/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import { useObjectVal } from "react-firebase-hooks/database";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { auth, database, firestore } from "../firebase";
import {
  GameDocument,
  RankingsResponse,
  Scoreboard,
  TeamsResponse,
  WeekDocument,
} from "../types";
import { getImageUrl, getLockTime, getRank } from "../utils";
import { LockCountdown } from "./LockCountdown";
import ToggleButton from "./ToggleButton/ToggleButton";

export const GameRow = ({ game }: { game: GameDocument }) => {
  const [user] = useAuthState(auth);
  const realTimeRef = ref(database, user?.uid);
  const [val] = useObjectVal<{ week: string; isAdmin: boolean }>(realTimeRef);
  const reference = doc(collection(firestore, "weeks"), val?.week ?? "1");
  const [week] = useDocumentData<WeekDocument>(reference as any);
  const [present] = useIonToast();
  // CFB Only data
  const rankReference = doc(collection(firestore, "rankings"), "most_recent");
  const [rankings] = useDocumentData<RankingsResponse>(rankReference as any);
  const homeTeamReference = doc(collection(firestore, "teams"), `${game.home}`);
  const [homeTeam] = useDocumentData<TeamsResponse>(homeTeamReference as any);
  const awayTeamReference = doc(collection(firestore, "teams"), `${game.away}`);
  const [awayTeam] = useDocumentData<TeamsResponse>(awayTeamReference as any);
  const scoreboardRef = doc(firestore, "scoreboards", val?.week ?? "1");
  //
  const [scoreboard] = useDocumentData<Scoreboard>(scoreboardRef as any);
  const event = scoreboard?.events.find((c: any) =>
    c.name.includes(game.away || game.home)
  );
  const competition = event?.competitions[0];
  const home = competition?.competitors?.find(
    (c: any) => c.homeAway === "home"
  );
  const away = competition?.competitors?.find(
    (c: any) => c.homeAway === "away"
  );
  const status = competition?.status;
  if (!week) return null;
  if (!user) return null;
  const pick = week.picks?.[user.uid]?.find((pick) => pick.game === game.id);

  const handlePickChange = async ({
    key,
    value,
  }:
    | {
        key: "winner";
        value: "home" | "away";
      }
    | {
        key: "overUnder";
        value: "over" | "under";
      }) => {
    if (!week) return;
    if (!user) return;
    if (game.locked) {
      present({
        message: "Game is locked",
        duration: 3000,
        position: "bottom",
        color: "danger",
      });
      return;
    }
    const picks = week.picks?.[user.uid] ?? [];
    const existingPick = picks.find((pick) => pick.game === game.id);
    if (existingPick) {
      const newPicks = picks.map((pick) => {
        if (pick.game === game.id) {
          if (game.config?.pickMethod === "either") {
            return {
              game: game.id,
              [key]: value,
            };
          } else {
            return {
              ...pick,
              [key]: value,
            };
          }
        }
        return pick;
      });
      await updateDoc(reference, {
        [`picks.${user.uid}`]: newPicks,
      });
      return;
    } else {
      picks.push({
        game: game.id,
        ...(key === "winner" ? { winner: value } : { overUnder: value }),
        ...(key === "overUnder" ? { overUnder: "under" } : { winner: "home" }),
      });
      const newPicks = picks.map((pick) => {
        if (pick.game === game.id) {
          if (game.config?.pickMethod === "either") {
            return {
              game: game.id,
              [key]: value,
            };
          } else {
            return {
              ...pick,
              [key]: value,
            };
          }
        }
        return pick;
      });
      await updateDoc(reference, {
        [`picks.${user.uid}`]: newPicks,
      });
    }
  };
  const lockTime = getLockTime(week, game.id);
  const homeRank = getRank(game.home, rankings, homeTeam);
  const awayRank = getRank(game.away, rankings, awayTeam);
  const getPercentages = (week: WeekDocument, game: GameDocument) => {
    // if (!game.locked) return null;
    const optionCounts: { [key: string]: number } = {
      home: 0,
      away: 0,
      over: 0,
      under: 0,
    };

    let totalPicks = 0;

    // Count picks for each option related to the specified game
    if (week.picks) {
      Object.values(week.picks).forEach((userPicks) => {
        userPicks.forEach((pick) => {
          if (pick.game === game.id) {
            totalPicks++;
            if (pick.winner) {
              optionCounts[pick.winner]++;
            }
            if (pick.overUnder) {
              optionCounts[pick.overUnder]++;
            }
          }
        });
      });
    }

    // Calculate percentages
    const percentages: { [key: string]: number } = {};
    Object.keys(optionCounts).forEach((option) => {
      percentages[option] = optionCounts[option] / totalPicks;
      // totalPicks > 0 ? (optionCounts[option] / totalPicks) * 100 : 0;
    });

    return percentages;
  };
  const percentages = getPercentages(week, game);

  return (
    <>
      <IonItem>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonLabel
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              >
                {game.home} {homeRank ? `(${homeRank})` : ""} vs <br />{" "}
                {game.away} {awayRank ? `(${awayRank})` : ""}
              </IonLabel>{" "}
              <br />
              <IonLabel>
                {status ? (
                  <>{status?.type.detail}</>
                ) : (
                  <>
                    {game.currentScore?.last_update
                      ? `Last updated: ${new Date(
                          game.currentScore?.last_update
                        ).toLocaleDateString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                        })}`
                      : new Date(game.commence_time).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                          }
                        )}
                  </>
                )}
              </IonLabel>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
            <IonCol size="4">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                }}
              >
                <IonImg
                  style={{
                    width: "50px",
                    height: "50px",
                  }}
                  src={getImageUrl(game.away, game.sport, awayTeam)}
                />
                {typeof away?.score !== "undefined" ? (
                  <IonLabel>{away.score}</IonLabel>
                ) : typeof game.currentScore?.away !== "undefined" ? (
                  <IonLabel>{game.currentScore?.away}</IonLabel>
                ) : null}
              </div>
            </IonCol>
            <IonCol size="4">
              <ToggleButton
                selected={pick?.winner === "away"}
                onClick={() =>
                  handlePickChange({ key: "winner", value: "away" })
                }
                leadingIcon={
                  game.results?.winner === "away" ? (
                    <IonIcon icon={checkmark} color="success" />
                  ) : null
                }
                label={`${game.away_spread > 0 ? "+" : ""}${game.away_spread}`}
                icon={
                  game.locked && pick?.winner === "away" ? (
                    <IonIcon icon={lockClosed} />
                  ) : null
                }
              />
              <PercentageBar percentages={percentages} option="away" />
            </IonCol>
            <IonCol size="4">
              <ToggleButton
                selected={pick?.overUnder === "over"}
                onClick={() =>
                  handlePickChange({ key: "overUnder", value: "over" })
                }
                leadingIcon={
                  game.results?.overUnder === "over" ? (
                    <IonIcon icon={checkmark} color="success" />
                  ) : null
                }
                label={`O ${game.overUnder}`}
                icon={
                  game.locked && pick?.overUnder === "over" ? (
                    <IonIcon icon={lockClosed} />
                  ) : null
                }
              />
              <PercentageBar percentages={percentages} option="over" />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol className="ion-text-center" size="4">
              @
            </IonCol>
          </IonRow>
          <IonRow className="ion-align-items-center">
            <IonCol size="4">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                }}
              >
                <IonImg
                  style={{
                    width: "50px",
                    height: "50px",
                  }}
                  src={getImageUrl(game.home, game.sport, homeTeam)}
                />
                {typeof home?.score !== "undefined" ? (
                  <IonLabel>{home.score}</IonLabel>
                ) : typeof game.currentScore?.home !== "undefined" ? (
                  <IonLabel>{game.currentScore?.home}</IonLabel>
                ) : null}
              </div>
            </IonCol>
            <IonCol size="4">
              <ToggleButton
                selected={pick?.winner === "home"}
                onClick={() =>
                  handlePickChange({ key: "winner", value: "home" })
                }
                leadingIcon={
                  game.results?.winner === "home" ? (
                    <IonIcon icon={checkmark} color="success" />
                  ) : null
                }
                label={`${game.home_spread > 0 ? "+" : ""}${game.home_spread}`}
                icon={
                  game.locked && pick?.winner === "home" ? (
                    <IonIcon icon={lockClosed} />
                  ) : null
                }
              />
              <PercentageBar percentages={percentages} option="home" />
            </IonCol>
            <IonCol size="4">
              <ToggleButton
                selected={pick?.overUnder === "under"}
                onClick={() =>
                  handlePickChange({ key: "overUnder", value: "under" })
                }
                label={`U ${game.overUnder}`}
                leadingIcon={
                  game.results?.overUnder === "under" ? (
                    <IonIcon icon={checkmark} color="success" />
                  ) : null
                }
                icon={
                  game.locked && pick?.overUnder === "under" ? (
                    <IonIcon icon={lockClosed} />
                  ) : null
                }
              />
              <PercentageBar percentages={percentages} option="under" />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonItem>
      {lockTime && !game.locked ? <LockCountdown lockTime={lockTime} /> : null}
      {competition?.situation?.lastPlay?.text && (
        <IonItem
          style={{
            fontSize: "0.8rem",
          }}
        >
          Last Play: {competition?.situation.lastPlay?.text}
        </IonItem>
      )}
      {!game.results?.overUnder && event?.id && (
        <IonItem>
          <IonButton
            style={{
              width: "100%",
            }}
            expand={"block"}
            routerLink={`/gamecast/${event.id}`}
            color="dark"
          >
            View Game Details
          </IonButton>
        </IonItem>
      )}

      <IonItemDivider sticky />
    </>
  );
};

function PercentageBar({
  percentages,
  option,
}: {
  percentages: { [key: string]: number } | null;
  option: string;
}) {
  if (!percentages) return null;
  const value = percentages[option];
  const color = value > 0.5 ? "success" : "danger";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.8rem",
      }}
    >
      <IonProgressBar value={value} color={color} />
      {(value * 100).toFixed(0)}%
    </div>
  );
}