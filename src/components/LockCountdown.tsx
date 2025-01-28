import { IonItem, IonLabel } from "@ionic/react";
import { useCountdown } from "../hooks/useCountdown";

export const LockCountdown = ({ lockTime }: { lockTime: number }) => {
  const countdown = useCountdown(lockTime);
  return (
    <IonItem>
      <IonLabel className="ion-text-center">Game locks in {countdown}</IonLabel>
    </IonItem>
  );
};
