// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "./NewsFeed.css";

// import required modules
import {
  IonButton,
  IonContent,
  IonHeader,
  IonImg,
  IonItem,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Pagination } from "swiper/modules";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import { ref } from "firebase/database";
import { doc, collection } from "firebase/firestore";
import { useObjectVal } from "react-firebase-hooks/database";
import { auth, database, firestore } from "../../firebase";
import {
  GameDocument,
  TeamsResponse,
  UserDocument,
  WeekDocument,
} from "../../types";
import { useAuthState } from "react-firebase-hooks/auth";

export default function NewsFeed() {
  const [user] = useAuthState(auth);
  const realTimeRef = ref(database, user?.uid);
  const [val] = useObjectVal<UserDocument>(realTimeRef);
  const data = useDocumentData(
    doc(collection(firestore, "news_feeds"), val?.week ?? "1")
  );
  const news = Object.entries(data[0] ?? {});
  const reference = doc(collection(firestore, "weeks"), val?.week ?? "1");
  const [week] = useDocumentData<WeekDocument>(reference as any);
  const [filter, setFilter] = useState<string>("");
  const games = week?.games
    ?.filter(
      (g) =>
        g.config?.enabled &&
        !g.results?.winner &&
        (!filter ||
          g.home.toLowerCase().includes(filter) ||
          g.away.toLowerCase().includes(filter))
    )
    .sort((a, b) => a.commence_time.localeCompare(b.commence_time));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>News Feed</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={filter}
            onIonInput={(e) => setFilter(e.target.value!)}
          ></IonSearchbar>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Swiper
          direction={"vertical"}
          modules={[Pagination]}
          className="mySwiper"
        >
          {games?.map((game, index) => {
            const content = news.find((n) => n[0] === game.id)?.[1];
            if (!content) return null;
            return (
              <SwiperSlide key={game.id}>
                <NewsItem
                  game={game}
                  content={content}
                  nextGame={
                    index < news.length - 1 ? games[index + 1] : undefined
                  }
                  weekId={val?.week ?? "1"}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </IonContent>
    </IonPage>
  );
}

const NewsItem = ({
  game,
  content,
  nextGame,
  weekId,
}: {
  game: GameDocument;
  content: string;
  nextGame?: GameDocument;
  weekId: string;
}) => {
  const homeTeamReference = doc(collection(firestore, "teams"), `${game.home}`);
  const [homeTeam] = useDocumentData<TeamsResponse>(homeTeamReference as any);
  const awayTeamReference = doc(collection(firestore, "teams"), `${game.away}`);
  const [awayTeam] = useDocumentData<TeamsResponse>(awayTeamReference as any);
  return (
    <div className="container">
      <IonItem>
        {game.away} @ {game.home}
      </IonItem>
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
      <p
        className="ion-text-start ion-padding-horizontal"
        style={{
          overflow: "hidden",
        }}
      >
        <MarkdownRenderer markdown={content} />
      </p>
      <IonButton routerDirection="forward" href={`/news/${weekId}/${game.id}`}>
        Read More...
      </IonButton>
      {nextGame ? (
        <IonItem>{`Next: ${nextGame.home} vs ${nextGame.away}`}</IonItem>
      ) : (
        <IonItem>No More Stories!</IonItem>
      )}
    </div>
  );
};

import ReactMarkdown from "react-markdown";
import { getImageUrl } from "../../utils";
import { useState } from "react";

const MarkdownRenderer = ({ markdown }: { markdown: string }) => {
  return <ReactMarkdown>{markdown}</ReactMarkdown>;
};
