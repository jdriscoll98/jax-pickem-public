import React from "react";
import { IonToast } from "@ionic/react";
import { useRegisterSW } from "virtual:pwa-register/react";

const UpdateNotification: React.FC = () => {
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onNeedRefresh: () => {
      console.log("SW needs to be refreshed");
    },
    onRegisteredSW: () => {
      console.log("SW is registered");
    },
    onRegisterError: (error) => {
      console.log("SW registration failed: ", error);
    },
  });

  return (
    <IonToast
      isOpen={needRefresh[0]}
      message="New version is available!"
      position="bottom"
      buttons={[
        {
          text: "Update",
          handler: () => {
            updateServiceWorker(true);
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

export default UpdateNotification;
