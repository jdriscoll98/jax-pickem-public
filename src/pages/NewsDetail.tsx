import { useParams } from "react-router";
import { TeamsResponse, WeekDocument } from "../types";
import { doc, collection } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { firestore } from "../firebase";
import { getImageUrl } from "../utils";

export default function NewsDetail() {
  const { weekId, gameId } = useParams<{ weekId: string; gameId: string }>();
  const [week] = useDocumentData<WeekDocument>(
    doc(collection(firestore, "weeks"), weekId) as any
  );
  const game = week?.games?.find((g) => g.id === gameId);
  const [homeTeam] = useDocumentData<TeamsResponse>(
    doc(collection(firestore, "teams"), `${game?.home}`) as any
  );
  const [awayTeam] = useDocumentData<TeamsResponse>(
    doc(collection(firestore, "teams"), `${game?.away}`) as any
  );
  const [news] = useDocumentData(
    doc(collection(firestore, "news_feeds"), weekId) as any
  );
  if (!game) return null;
  const content = news?.[gameId];
  if (!content) return null;
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="ion-text-center">
          {game.away} @ {game.home}
          <IonButtons slot="start">
            <IonButton routerDirection="back" routerLink="/news">
              <IonIcon icon={caretBack} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <IonImg
                style={{
                  width: "50px",
                  height: "50px",
                }}
                src={getImageUrl(game.away, game.sport, awayTeam)}
              />
              {game.away_spread > 0 ? "+" : ""}
              {game.away_spread}
            </div>

            {`at`}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <IonImg
                style={{
                  width: "50px",
                  height: "50px",
                }}
                src={getImageUrl(game.home, game.sport, homeTeam)}
              />
              {game.home_spread > 0 ? "+" : ""}
              {game.home_spread}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Over / Under {game.overUnder}
          </div>
        </div>
        <p className="ion-text-start ion-padding-horizontal">
          <MarkdownRenderer markdown={content} />
        </p>
        <GameRow game={game} key={game.home + game.away} />
      </IonContent>
    </IonPage>
  );
}

import ReactMarkdown from "react-markdown";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import { caretBack } from "ionicons/icons";
import { GameRow } from "../components/GameRow";

const MarkdownRenderer = ({ markdown }: { markdown: string }) => {
  return <ReactMarkdown>{markdown}</ReactMarkdown>;
};
