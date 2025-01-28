import {
  IonApp,
  IonButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import "@ionic/react/css/core.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/palettes/dark.system.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/palettes/dark.always.css";
import {
  americanFootball,
  barChartOutline,
  newspaper,
  podium,
} from "ionicons/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import { Redirect, Route } from "react-router-dom";
import { auth, functions } from "./firebase";
import AddGame from "./pages/AddGame";
import AddWeek from "./pages/AddWeek";
import Chat from "./pages/Chat/Chat";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import Login from "./pages/Login/Login";
import MyPicks from "./pages/MyPicks";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Week from "./pages/Week";
import Weeks from "./pages/Weeks";
import "./theme/variables.css";
import Loading from "./components/Loading";
import PickSummary from "./pages/PickSummary/PickSummary";
import Rules from "./pages/Rules/Rules";
import Payments from "./pages/Payments";
import UpdateNotification from "./components/UpdateNotification";
import News from "./pages/News/News";
import NewsDetail from "./pages/NewsDetail";
import Profile from "./pages/Profile/Profile";
import GameCast from "./pages/GameCast";
import { ErrorBoundary } from "react-error-boundary";
import { httpsCallable } from "firebase/functions";

setupIonicReact();

const App: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  if (loading) return <Loading />;
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => {
        return (
          <div
            style={{
              padding: "10px",
              textAlign: "center",
            }}
            role="alert"
          >
            <p>Something went wrong:</p>
            <pre style={{ color: "red" }}>{error.message}</pre>
            <IonButton onClick={resetErrorBoundary} style={{}} color={"danger"}>
              Reload App
            </IonButton>
          </div>
        );
      }}
      onError={async (error) => {
        httpsCallable(
          functions,
          "logError"
        )({
          error: error.message,
        });
      }}
      onReset={() => {
        window.location.href = "/";
      }}
    >
      <IonApp>
        <UpdateNotification />
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/picks">
                {user ? <MyPicks /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/picks/:uid">
                {user ? <PickSummary /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/leaderboard">
                {user ? <Leaderboard /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/chat">
                {user ? <Chat /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/settings">
                {user ? <Settings /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/login">
                {user ? <Redirect to="/picks" /> : <Login />}
              </Route>
              <Route exact path="/signup">
                {user ? <Redirect to="/picks" /> : <Signup />}
              </Route>
              <Route exact path="/forgot-password">
                {user ? <Redirect to="/picks" /> : <ForgotPassword />}
              </Route>
              <Route exact path="/weeks">
                {user ? <Weeks /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/add-week">
                {user ? <AddWeek /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/weeks/:id">
                {user ? <Week /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/weeks/:id/add-game">
                {user ? <AddGame /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/weeks/:id/games/:gameId">
                {user ? <Game /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/payments">
                {user ? <Payments /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/">
                {user ? <Redirect to="/picks" /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/news">
                {user ? <News /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/news/:weekId/:gameId">
                {user ? <NewsDetail /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/profile">
                {user ? <Profile /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/gamecast/:gameId">
                {user ? <GameCast /> : <Redirect to="/login" />}
              </Route>

              <Route exact path="/rules">
                <Rules />
              </Route>
            </IonRouterOutlet>
            <IonTabBar
              color="light"
              className={`${
                typeof window !== "undefined" &&
                ["/login", "signup"].includes(window.location.pathname)
                  ? "ion-hide"
                  : ""
              }`}
              slot="bottom"
            >
              <IonTabButton tab="picks" href="/picks/">
                <IonIcon aria-hidden="true" icon={americanFootball} />
                <IonLabel>Picks</IonLabel>
              </IonTabButton>
              <IonTabButton tab="leaderboard" href="/leaderboard">
                <IonIcon aria-hidden="true" icon={podium} />
                <IonLabel>Leaderboard</IonLabel>
              </IonTabButton>
              <IonTabButton tab="News" href="/news">
                <IonIcon aria-hidden="true" icon={newspaper} />
                <IonLabel>News</IonLabel>
              </IonTabButton>
              <IonTabButton tab="profile" href="/profile">
                <IonIcon aria-hidden="true" icon={barChartOutline} />
                <IonLabel>Stats</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>
      </IonApp>
    </ErrorBoundary>
  );
};

export default App;
