import { IonItem, IonList } from "@ionic/react";
import { UserDocument, WeekDocument } from "../types";
import { GameRow } from "./GameRow";
import { ref } from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, database } from "../firebase";
import { useObjectVal } from "react-firebase-hooks/database";

export const Full = ({ week }: { week?: WeekDocument }) => {
  const [user] = useAuthState(auth);
  const realTimeRef = ref(database, user?.uid);
  const [val] = useObjectVal<UserDocument>(realTimeRef);
  const hideCompleted = val?.hideCompleted;
  if (!week)
    return <IonItem>No Week Selected. Choose a week in the toolbar.</IonItem>;

  return (
    <IonList>
      {week.games
        ?.filter(
          (game) =>
            game.config?.enabled &&
            (!hideCompleted ||
              (!game.results?.winner && !game.results?.overUnder))
        )
        .sort(
          (a, b) =>
            new Date(a.commence_time).getTime() -
            new Date(b.commence_time).getTime()
        )
        .map((game) => (
          <GameRow game={game} key={game.home + game.away} />
        ))}
    </IonList>
  );
};
