import { IonRow, IonCol, IonImg, IonLabel, IonIcon } from "@ionic/react";
import { PickDocument, GameDocument, TeamsResponse } from "../types";
import { checkboxOutline, close, closeCircleOutline } from "ionicons/icons";
import { getImageUrl } from "../utils";
import { doc, collection } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { firestore } from "../firebase";

export const GameSummaryRow = ({
  pick,
  game,
}: {
  pick: PickDocument;
  game: GameDocument;
}) => {
  const homeTeamReference = doc(collection(firestore, "teams"), `${game.home}`);
  const [homeTeam] = useDocumentData<TeamsResponse>(homeTeamReference as any);
  const awayTeamReference = doc(collection(firestore, "teams"), `${game.away}`);
  const [awayTeam] = useDocumentData<TeamsResponse>(awayTeamReference as any);
  return (
    <IonRow className="ion-align-items-center ion-padding-horizontal">
      <IonCol>
        <IonImg
          style={{
            width: "50px",
            height: "50px",
          }}
          src={getImageUrl(
            game[pick.winner as "home" | "away"],
            game.sport,
            pick.winner === "home" ? homeTeam : awayTeam
          )}
        />{" "}
      </IonCol>
      <IonCol>
        <IonLabel>
          {game[`${pick.winner}_spread` as "home_spread" | "away_spread"]}
          {game.results?.winner ? (
            pick.winner === game.results?.winner ? (
              <IonIcon icon={checkboxOutline} color="success" />
            ) : (
              <IonIcon icon={close} color="danger" />
            )
          ) : null}
        </IonLabel>
      </IonCol>
      <IonCol>
        <IonLabel>
          {pick.overUnder?.[0].toUpperCase()} {game.overUnder}
          {game.results?.overUnder ? (
            pick.overUnder === game.results?.overUnder ? (
              <IonIcon icon={checkboxOutline} color="success" />
            ) : (
              <IonIcon icon={close} color="danger" />
            )
          ) : null}
        </IonLabel>
      </IonCol>
    </IonRow>
  );
};
