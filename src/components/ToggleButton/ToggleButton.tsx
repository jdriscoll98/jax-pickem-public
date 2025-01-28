import { IonButton } from "@ionic/react";
import styles from "./ToggleButton.module.css";

const ToggleButton = ({
  label = "Toggle",
  selected,
  leadingIcon,
  icon,
  onClick,
}: {
  label?: string;
  selected?: boolean;
  leadingIcon?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <IonButton
      expand="block"
      onClick={onClick}
      className={`${styles.default} ${selected ? styles.selected : ""}`}
      style={{
        position: "relative",
        whiteSpace: "nowrap",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "8px",
        }}
      >
        {leadingIcon}
        {label}
        {icon}
      </div>
    </IonButton>
  );
};

export default ToggleButton;
