import {
  IonButton,
  IonContent,
  IonImg,
  IonInput,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonPage,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
const Login: React.FC = () => {
  const router = useIonRouter();
  const [present] = useIonToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginWithEmailAndPassword, , loading, error] =
    useSignInWithEmailAndPassword(auth);

  const handleLogin = async () => {
    const user = await loginWithEmailAndPassword(email, password);
    if (user) {
      router.push("/picks");
    }
  };

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
            value={email}
            placeholder="Email"
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

        <IonButton expand="full" onClick={handleLogin} color="primary">
          {loading ? "Loading..." : "Login"}
        </IonButton>

        <IonButton
          expand="full"
          color="dark"
          onClick={() => router.push("/signup")}
          buttonType="button"
        >
          Go To Sign Up
        </IonButton>
        <IonButton
          expand="full"
          color="medium"
          routerLink={"/forgot-password"}
          buttonType="button"
        >
          Forgot Password?
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

export default Login;
