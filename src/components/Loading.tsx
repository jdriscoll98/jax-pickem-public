import {
  IonContent,
  IonImg,
  IonLabel,
  IonLoading,
  IonPage,
  IonSpinner,
} from "@ionic/react";

export default function Loading() {
  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <IonImg
          alt="logo"
          src={
            "https://firebasestorage.googleapis.com/v0/b/jax-pickem.appspot.com/o/logo.webp?alt=media&token=8480ee55-a50c-47a2-8e71-a9e91bfc86fb"
          }
          className="logo"
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <IonLabel>Loading...</IonLabel>
          <IonSpinner />
        </div>
      </IonContent>
    </IonPage>
  );
}
