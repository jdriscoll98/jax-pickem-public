import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonInput,
  IonButton,
  IonLabel,
  IonPage,
  useIonRouter,
  useIonToast,
  IonHeader,
  IonTitle,
  IonItem,
  IonImg,
} from "@ionic/react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const Signup: React.FC = () => {
  const router = useIonRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [present] = useIonToast();

  const [createUserWithEmailAndPassword, _, loading, error] =
    useCreateUserWithEmailAndPassword(auth);

  async function handleSignup() {
    if (!email || !password) {
      present({
        message: "Please fill out all fields",
        duration: 3000,
        position: "bottom",
      });
      return;
    }
    if (!email.includes("@")) {
      present({
        message: "Please enter a valid email",
        duration: 3000,
        position: "bottom",
      });
      return;
    }
    const user = await createUserWithEmailAndPassword(email, password);
    if (user) {
      router.push("/picks");
    } else {
      present({
        message: error?.message ?? "Error creating user",
        duration: 3000,
        position: "bottom",
      });
    }
  }

  useEffect(() => {
    if (error) {
      present({
        message: error.message,
        duration: 3000,
        position: "bottom",
      });
    }
  }, [error]);

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding login-page">
        <IonImg
          alt="logo"
          src={
            "https://firebasestorage.googleapis.com/v0/b/jax-pickem.appspot.com/o/logo.webp?alt=media&token=8480ee55-a50c-47a2-8e71-a9e91bfc86fb"
          }
          className="logo"
        />
        <IonItem className="ion-margin-vertical">
          <IonInput
            type="email"
            placeholder="Email"
            value={email}
            onIonInput={(e) => setEmail(e.detail.value!)}
          ></IonInput>
        </IonItem>
        <IonItem className="ion-margin-vertical">
          <IonInput
            type="password"
            placeholder="Password"
            value={password}
            onIonInput={(e) => setPassword(e.detail.value!)}
          ></IonInput>
        </IonItem>

        <IonButton expand="full" onClick={handleSignup} color="dark">
          {loading ? "Loading..." : "Sign Up"}
        </IonButton>
        <IonButton
          expand="full"
          color="secondary"
          onClick={() => router.push("/login")}
          buttonType="button"
        >
          Go To Login
        </IonButton>
        <IonButton
          expand="full"
          color="light"
          onClick={() => router.push("/rules")}
          buttonType="button"
        >
          Rules
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Signup;
