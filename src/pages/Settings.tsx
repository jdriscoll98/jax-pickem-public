import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToggle,
  IonToolbar,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import { ref, update } from "firebase/database";
import { useState } from "react";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { useObjectVal } from "react-firebase-hooks/database";
import { auth, database, firestore, functions } from "../firebase";
import { UserDocument, WeekDocument } from "../types";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { collection, doc } from "@firebase/firestore";

export default function Settings() {
  const [present] = useIonToast();
  const [signOut, loading] = useSignOut(auth);
  const router = useIonRouter();
  const [user] = useAuthState(auth);
  const [newDisplayName, setNewDisplayName] = useState<string | null>(null);
  const realTimeRef = ref(database, user?.uid);
  const [val] = useObjectVal<UserDocument>(realTimeRef);

  const [executeCallable, executing, error] = useHttpsCallable<
    void,
    {
      error?: string;
      success?: string;
    }
  >(functions, "updateRankings");
  const [executeCallableTeams, executingTeams, errorTeams] = useHttpsCallable<
    void,
    {
      error?: string;
      success?: string;
    }
  >(functions, "updateTeams");
  const [executeCallableSimulate, executingSimulate, errorSimulate] =
    useHttpsCallable<
      {
        weekId: string;
        targetPlayerUID: string;
      },
      {
        chance?: number;
        error?: string;
      }
    >(functions, "getChanceToWin");
  const [executeCallableGetNewsFeed, executingGetNewsFeed, errorGetNewsFeed] =
    useHttpsCallable<{
      weekId: string;
    }>(functions, "getNewsFeed");
  const [executeCallableUpdateStats, executingUpdateStats, errorUpdateStats] =
    useHttpsCallable(functions, "updateStats");
  const [executeCallableGetScoreboard, executingGetScoreboard] =
    useHttpsCallable(functions, "getScoreboard");
  if (!user) return null;

  const updateDisplayName = async () => {
    if (!user || !newDisplayName) return;
    await update(realTimeRef, {
      displayName: newDisplayName,
    });
    present({
      message: "Display name updated",
      duration: 1000,
      position: "bottom",
    });
  };
  return (
    <IonPage>
      <IonToolbar>
        <IonTitle>Settings</IonTitle>
      </IonToolbar>
      <IonContent fullscreen>
        <IonList>
          <IonItemDivider>User</IonItemDivider>
          <IonItem>
            <IonInput
              label="Display Name"
              labelPlacement="stacked"
              value={
                newDisplayName ??
                val?.displayName ??
                user?.displayName ??
                `User ${user?.uid.slice(-5)}`
              }
              onIonInput={(e) => setNewDisplayName(e.detail.value!)}
            />
            <IonButton onClick={() => updateDisplayName()}>Update</IonButton>
          </IonItem>
          <IonItem>
            <IonToggle
              checked={val?.hideCompleted}
              onIonChange={() => {
                update(realTimeRef, { hideCompleted: !val?.hideCompleted });
              }}
            >
              Hide Completed Games
            </IonToggle>
          </IonItem>
          {(val?.isAdmin || process.env.NODE_ENV === "development") && (
            <>
              <IonItemDivider>Admin</IonItemDivider>
              <IonItem routerLink="/weeks">
                <IonLabel>Manage Weeks</IonLabel>
              </IonItem>
              <IonItem>
                <IonButton onClick={() => executeCallable()}>
                  {executing ? "Loading..." : "Update Rankings"}
                </IonButton>
              </IonItem>
              <IonItem>
                <IonButton onClick={() => executeCallableTeams()}>
                  {executingTeams ? "Loading..." : "Update Teams"}
                </IonButton>
              </IonItem>
              <IonItem>
                <IonButton
                  onClick={async () => {
                    const res = await executeCallableSimulate({
                      weekId: val?.week ?? "1",
                      targetPlayerUID: user?.uid ?? "",
                    });
                    alert(JSON.stringify(res));
                  }}
                >
                  {executingSimulate ? "Loading..." : "Simulate Chance"}
                </IonButton>
              </IonItem>
              <IonItem>
                <IonButton
                  onClick={async () => {
                    const res = await executeCallableGetNewsFeed({
                      weekId: val?.week ?? "1",
                    });
                    alert(JSON.stringify(res));
                  }}
                >
                  {executingGetNewsFeed ? "Loading..." : "Fetch News Feed"}
                </IonButton>
              </IonItem>
              <IonItem>
                <IonButton
                  onClick={async () => {
                    const res = await executeCallableUpdateStats();
                    alert(JSON.stringify(res));
                  }}
                >
                  {executingUpdateStats ? "Loading..." : "Update Stats"}
                </IonButton>
              </IonItem>
              <IonItem>
                <IonButton
                  onClick={async () => {
                    const res = await executeCallableGetScoreboard();
                    alert(JSON.stringify(res));
                  }}
                >
                  {executingGetScoreboard ? "Loading..." : "Get Scoreboard"}
                </IonButton>
              </IonItem>
            </>
          )}
          {val?.isAdmin && (
            <>
              <IonItemDivider>Payments</IonItemDivider>
              <IonItem routerLink="/payments">
                <IonLabel>Payments</IonLabel>
              </IonItem>
            </>
          )}
          <IonItemDivider />
          <IonItem
            button={true}
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
          >
            <IonLabel> {loading ? "Signing out..." : "Sign out"}</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
}
