import {
  IonPage,
  IonTitle,
  IonContent,
  IonToolbar,
  IonItem,
  IonList,
  IonButtons,
  IonIcon,
  IonButton,
  IonItemDivider,
  IonLabel,
  IonListHeader,
} from "@ionic/react";
import "./Rules.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { arrowBack } from "ionicons/icons";
export default function Rules() {
  const [user] = useAuthState(auth);
  return (
    <IonPage>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton
            routerLink={user ? "/picks" : "/login"}
            routerDirection="back"
          >
            <IonIcon icon={arrowBack} />
          </IonButton>
        </IonButtons>
        <IonTitle>Rules</IonTitle>
      </IonToolbar>
      <IonContent color="light">
        <IonList inset lines="full" className="rules-list">
          <IonItemDivider>
            <IonLabel>Payments</IonLabel>
          </IonItemDivider>
          <IonItem>$20 entry per week</IonItem>
          {user ? (
            <>
              <IonItem>
                Venmo @olivia-baum-4 <br />
                Cashapp: $jkdriscoll <br /> Zelle: jackdriscoll777@gmail.com{" "}
                <br /> Apple Pay: 954-809-1951
              </IonItem>
              <IonItem>
                Send your payment with the email address you used to sign up in
                the comment
              </IonItem>
            </>
          ) : (
            <IonItem>Sign up to see payment information</IonItem>
          )}
          <IonItem>Payment due before the first game starts</IonItem>
          <IonItemDivider>
            <IonLabel>How to Play</IonLabel>
          </IonItemDivider>
          <IonItem>Pick Spread and Over/Under for each game</IonItem>
          <IonItem>
            Winner is the player with the highest percentage of correct picks.
          </IonItem>
          <IonItem>Spread and over/under count as one pick each.</IonItem>
          <IonItem>1st Place Takes 80% of the total pot</IonItem>
          <IonItem>2nd Place Takes 20% of the total pot</IonItem>
          <IonItem>
            Each week will have every NFL game and select NCAAF games
          </IonItem>
          <IonItem>Weeks are published on Wednesday.</IonItem>
          <IonItemDivider>
            <IonLabel>When do games lock?</IonLabel>
          </IonItemDivider>
          <IonItem>Thursday/Friday games lock at the start of the game</IonItem>

          <IonItem>
            Saturday games lock at the beginning of the first Saturday Game
          </IonItem>
          <IonItem>
            Sunday / Monday games lock at the beginning of the first sunday game
          </IonItem>
          <IonItem>
            Odds lock when games lock. Line changes after a game is locked will
            not be considered.
          </IonItem>

          <IonItemDivider>
            <IonItem>
              Any questions, use the chat window at the bottom right of the
              screen or text me at 954-809-1951
            </IonItem>
          </IonItemDivider>
        </IonList>
      </IonContent>
    </IonPage>
  );
}
