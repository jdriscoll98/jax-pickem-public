import {
  IonContent,
  IonGrid,
  IonItem
} from "@ionic/react";
import { WeekDocument } from "../types";
import { GameSummaryRow } from "./GameSummaryRow";

export const Summary = ({ week, uid }: { week?: WeekDocument, uid: string }) => {
  if (!week)
    return <IonItem>No Week Selected. Choose a week in the toolbar.</IonItem>;
  const games = week?.games;

  const picks =
    week?.picks?.[uid]?.sort((a, b) => {
      const gameA = games?.find((g) => g.id === a.game);
      const gameB = games?.find((g) => g.id === b.game);
      if (!gameA || !gameB) return 0;
      return (
        new Date(gameA.commence_time).getTime() -
        new Date(gameB.commence_time).getTime()
      );
    }) ?? [];
  return (
    <IonContent fullscreen>
      <IonGrid className="ion-no-padding">
        {picks?.map((pick) => {
          const game = games?.find((g) => g.id === pick.game);
          if (!game) return null;
          if (!pick.winner || !pick.overUnder) return null;
          return (
            <GameSummaryRow
              pick={pick}
              game={game}
              key={game.home + game.away}
            />
          );
        })}
      </IonGrid>
    </IonContent>
  );
};
