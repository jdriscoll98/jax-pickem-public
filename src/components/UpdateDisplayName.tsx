import { IonToast, useIonRouter } from "@ionic/react";
import { ref } from "firebase/database";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useObjectVal } from "react-firebase-hooks/database";
import { auth, database } from "../firebase";
import { UserDocument } from "../types";

const UpdateDisplayName: React.FC = () => {
  const [user] = useAuthState(auth);
  const realTimeRef = ref(database, user?.uid);
  const [val] = useObjectVal<UserDocument>(realTimeRef);
  const router = useIonRouter();

  return (
    <IonToast
      isOpen={!!(val && !val?.displayName)}
      message="Click here to update your display name!"
      position="bottom"
      buttons={[
        {
          text: "Update",
          handler: () => {
            router.push("/settings");
          },
        },
        {
          text: "Dismiss",
          role: "cancel",
        },
      ]}
    />
  );
};

export default UpdateDisplayName;
