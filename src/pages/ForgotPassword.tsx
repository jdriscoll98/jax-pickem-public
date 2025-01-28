import {
  IonPage,
  IonContent,
  IonImg,
  IonItem,
  IonInput,
  IonButton,
  IonLabel,
  IonHeader,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { useState } from "react";
import { useSendPasswordResetEmail } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

export default function ForgotPassword() {
  // enter email and send email
  const [email, setEmail] = useState("");
  const [sendPasswordResetEmail, sending, error] =
    useSendPasswordResetEmail(auth);
  const [present] = useIonToast();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Forgot Password?</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding login-page">
        <IonLabel>
          Enter the email you used to sign up and we will send you a link to
          reset your password.
        </IonLabel>
        <IonItem className="ion-margin-vertical">
          <IonInput
            type="email"
            placeholder="Email"
            value={email}
            onIonInput={(e) => setEmail(e.detail.value!)}
          ></IonInput>
        </IonItem>

        <IonButton
          expand="full"
          onClick={() => {
            sendPasswordResetEmail(email)
              .then(() => {
                present({
                  message: "Password reset email sent",
                  duration: 3000,
                  color: "success",
                  position: "bottom",
                });
              })
              .catch((e) => {
                present({
                  message: e.message,
                  duration: 3000,
                  color: "danger",
                  position: "bottom",
                });
              });
          }}
        >
          {sending ? "Sending..." : "Send Email"}
        </IonButton>
        <IonButton
          expand="full"
          color="medium"
          routerLink={"/login"}
          buttonType="button"
        >
          Back To Login
        </IonButton>
        {error && (
          <IonItem className="ion-margin-vertical">
            <p>{error.message}</p>
          </IonItem>
        )}
      </IonContent>
    </IonPage>
  );
}
