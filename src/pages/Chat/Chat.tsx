import {
  IonAvatar,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonPage,
  IonRow,
  IonTextarea,
} from "@ionic/react";
import { ref } from "firebase/database";
import { arrayUnion, collection, doc, updateDoc } from "firebase/firestore";
import { send } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useObjectVal } from "react-firebase-hooks/database";
import { useDocumentData } from "react-firebase-hooks/firestore";
import Toolbar from "../../components/Toolbar";
import { auth, database, firestore } from "../../firebase";
import { ChatDocument, UserDocument, WeekDocument } from "../../types";
import "./Chat.css";
const Chat: React.FC = () => {
  const [user] = useAuthState(auth);
  const realTimeRef = ref(database, user?.uid);
  const [val] = useObjectVal<UserDocument>(realTimeRef);
  const reference = doc(collection(firestore, "weeks"), val?.week ?? "1");
  const [week] = useDocumentData<WeekDocument>(reference as any);
  const [newMessage, setNewMessage] = useState<string>("");
  const content = useRef<HTMLIonContentElement>(null);

  const sendMessage = async () => {
    if (!week) return;
    if (!user) return;
    const newChat: ChatDocument = {
      message: newMessage,
      timestamp: Date.now(),
      uid: user.uid,
      displayName: val?.displayName ?? `User ${user.uid.slice(-5)}`,
    };
    await updateDoc(reference, {
      chats: arrayUnion(newChat),
    });
    setNewMessage("");
    content.current?.scrollToBottom();
  };
  useEffect(() => {
    if (content.current) {
      content.current.scrollToBottom();
    }
  }, [week]);

  return (
    <IonPage>
      <IonHeader>
        <Toolbar title="Chat" />
      </IonHeader>
      <IonContent ref={content}>
        <IonGrid>
          {week?.chats?.length ? (
            week.chats.map((chat) =>
              chat.uid === user?.uid ? (
                <ChatRowRight key={chat.timestamp} chat={chat} />
              ) : (
                <ChatRowLeft key={chat.timestamp} chat={chat} />
              )
            )
          ) : (
            <span>No chats found</span>
          )}
        </IonGrid>
      </IonContent>
      <IonItem>
        <IonTextarea
          class="chat-page"
          rows={3}
          placeholder="Type a message..."
          value={newMessage}
          onIonInput={(e) => setNewMessage(e.detail.value!)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        ></IonTextarea>
        <IonButton expand="full" onClick={() => sendMessage()} color={"dark"}>
          <IonIcon icon={send} />
        </IonButton>
      </IonItem>
    </IonPage>
  );
};

const ChatRowRight = ({ chat }: { chat: ChatDocument }) => {
  return (
    <IonRow>
      <IonCol offset="2" size="10">
        <ChatBubble side="right" chat={chat} />
      </IonCol>
    </IonRow>
  );
};

const ChatRowLeft = ({ chat }: { chat: ChatDocument }) => {
  return (
    <IonRow>
      <IonCol size="10">
        <div className="chat-container">
          <IonAvatar>
            <img
              src={`https://ui-avatars.com/api/?name=${
                chat.displayName ?? "Anonymous"
              }&background=random&color=fff&size=25`}
              width={25}
              height={25}
            />
          </IonAvatar>
          <div className="chat-content">
            <span className="chat-display-name">
              {chat.displayName ?? "Anonymous"}
            </span>

            <ChatBubble side="left" chat={chat} />
          </div>
        </div>
      </IonCol>
    </IonRow>
  );
};

const ChatBubble = ({
  side,
  chat,
}: {
  side: "left" | "right";
  chat: ChatDocument;
}) => {
  return (
    <div className={`chat-bubble ${side}`}>
      <div className={`chat-bubble-content `}>
        <div className="chat-bubble-text">
          <p>{chat.message}</p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
