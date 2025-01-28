import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import { ref } from "firebase/database";
import { doc } from "firebase/firestore";
import { americanFootball, chevronBack } from "ionicons/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import { useObjectVal } from "react-firebase-hooks/database";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useParams } from "react-router";
import { auth, database, firestore } from "../firebase";
import { Scoreboard, UserDocument } from "../types";
import type { GameCast } from "../types/gamecast.types";
import { Picks } from "../types/picks.types";

export default function GameCast() {
  const router = useIonRouter();
  const [user] = useAuthState(auth);
  const realTimeRef = ref(database, user?.uid);
  const [val] = useObjectVal<UserDocument>(realTimeRef);
  const scoreboardRef = doc(firestore, "scoreboards", val?.week ?? "1");
  const [scoreboard] = useDocumentData<Scoreboard>(scoreboardRef as any);

  const id = useParams<{ gameId: string }>().gameId;
  const [gameCast] = useDocumentData<GameCast>(
    doc(firestore, "gamecasts", id) as any
  );
  const [picks] = useDocumentData<Picks>(doc(firestore, "picks", id) as any);
  if (!gameCast) return <IonSpinner />;
  const event = scoreboard?.events.find((c) =>
    c.name.includes(gameCast.teams[0].team.name || gameCast.teams[1].team.name)
  );
  const home = gameCast.teams.find((t) => t.homeAway === "home")!;
  const away = gameCast.teams.find((t) => t.homeAway === "away");
  if (!home || !away || !event || !picks) return null;
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButton slot="start" routerLink="/picks" color="dark" fill="clear">
            <IonIcon icon={chevronBack} slot="icon-only" />
          </IonButton>
          <IonTitle>
            {away.team.abbreviation} @ {home.team.abbreviation}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher
          slot="fixed"
          onIonRefresh={(event) => {
            setTimeout(() => {
              event.detail.complete();
            }, 1000);
          }}
        >
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <IonItem
          style={{
            "--border-radius": "0px",
          }}
        >
          <GameCastHeader gameCast={gameCast} event={event} />
        </IonItem>
        {event.status.type.name !== "STATUS_SCHEDULED" ? (
          <>
            <IonItem
              style={{
                "--border-radius": "0px",
              }}
              className="ion-no-padding"
            >
              <GameCastLive gameCast={gameCast} event={event} />
            </IonItem>
            <IonItem
              style={{
                "--border-radius": "0px",
              }}
              className="ion-no-padding"
            >
              <GameCastLastPlay
                gameCast={gameCast}
                event={event}
                picks={picks}
              />
            </IonItem>
            <IonItem
              style={{
                "--border-radius": "0px",
              }}
            >
              <GameCastBoxScore gameCast={gameCast} event={event} />
            </IonItem>
          </>
        ) : (
          <>
            <IonItem
              style={{
                "--border-radius": "0px",
              }}
            >
              <GameCastPreview gameCast={gameCast} picks={picks} />
            </IonItem>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}

function GameCastHeader({
  gameCast,
  event,
}: {
  gameCast: GameCast;
  event: Scoreboard["events"][0];
}) {
  const home = gameCast.teams.find((t) => t.homeAway === "home");
  const away = gameCast.teams.find((t) => t.homeAway === "away");
  if (!home || !away) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
      }}
    >
      <GameCastHeaderTeam team={away} side="left" />
      <GameCastPlayClock gameCast={gameCast} event={event} />
      <GameCastHeaderTeam team={home} side="right" />
    </div>
  );
}

function GameCastHeaderTeam({
  team,
  side,
}: {
  team: GameCast["teams"][0];
  side: "left" | "right";
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: side === "left" ? "row" : "row-reverse",
        alignItems: "center",
        width: "100%",
        gap: "10px",
        paddingBlock: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {team.team.logos[3].href && (
          <IonImg
            src={team.team.logos[3].href}
            style={{
              width: "40px",
            }}
          />
        )}

        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--ion-color-medium)",
          }}
        >
          {team.record[0].displayValue}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: side === "left" ? "row" : "row-reverse",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            fontWeight: "800",
            gap: "5px",
          }}
        >
          {team.score}
        </div>
        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--ion-color-large)",
          }}
        >
          {team.team.abbreviation}
        </span>
      </div>
      {team.possession && (
        <IonIcon size="small" icon={americanFootball} color="dark" />
      )}
    </div>
  );
}

function GameCastPlayClock({
  gameCast,
  event,
}: {
  gameCast: GameCast;
  event: Scoreboard["events"][0];
}) {
  const competition = event.competitions.find((e) => e.id === event.id);
  return (
    <div
      style={{
        fontWeight: "800",
        whiteSpace: "nowrap",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
      }}
    >
      <span>{competition?.status.type.shortDetail}</span>
      {competition?.status.type.name === "STATUS_IN_PROGRESS" && (
        <span
          style={{
            fontSize: "0.6rem",
            color: "var(--ion-color-medium)",
          }}
        >
          {competition.situation?.downDistanceText}
        </span>
      )}
    </div>
  );
}

function GameCastLive({
  gameCast,
  event,
}: {
  gameCast: GameCast;
  event: Scoreboard["events"][0];
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        backgroundColor: "var(--ion-color-light)",
      }}
    >
      <GameCastLiveHeader gameCast={gameCast} event={event} />
      <GameCastField gameCast={gameCast} event={event} />
    </div>
  );
}

function GameCastLiveHeader({
  gameCast,
  event,
}: {
  gameCast: GameCast;
  event: Scoreboard["events"][0];
}) {
  const situation = event.competitions[0].situation;
  if (gameCast.drives?.current?.isScore)
    return (
      <div
        style={{
          width: "100%",
          fontWeight: "800",
          paddingBlock: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
        }}
      >
        <IonImg
          style={{
            width: "30px",
          }}
          src={gameCast.drives.current.team.logos[3].href}
        />
        {gameCast.drives.current.displayResult}
      </div>
    );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        width: "100%",
        paddingBlock: "10px",
        fontSize: "0.7rem",
        borderBottom: "1px solid var(--ion-color-medium)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          borderRight: "1px solid var(--ion-color-medium)",
        }}
      >
        <span
          style={{
            color: "var(--ion-color-medium)",
            fontWeight: "800",
          }}
        >
          DOWN:
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontWeight: "800",
          }}
        >
          {event.competitions[0].situation?.shortDownDistanceText}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
        }}
      >
        <span
          style={{
            color: "var(--ion-color-medium)",
            fontWeight: "800",
          }}
        >
          BALL ON:
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontWeight: "800",
          }}
        >
          {situation?.possessionText}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          borderLeft: "1px solid var(--ion-color-medium)",
        }}
      >
        <span
          style={{
            color: "var(--ion-color-medium)",
            fontWeight: "800",
          }}
        >
          DRIVE:
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontWeight: "800",
          }}
        >
          {gameCast.drives?.current.description
            .split(", ")
            .slice(0, 2)
            .join(", ")}
        </div>
      </div>
    </div>
  );
}

function GameCastField({
  gameCast,
  event,
}: {
  gameCast: GameCast;
  event: Scoreboard["events"][0];
}) {
  const possessionTeam = gameCast.teams.find((t) => t.possession);
  const isHome = possessionTeam?.homeAway === "home";
  return (
    <div
      style={{
        height: "180px",
        width: "360px",
        marginInline: "auto",
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        position: "relative",
      }}
    >
      {/* endzone 1 */}
      <div
        style={{
          height: "100%",
          backgroundColor: "#" + gameCast.teams[1].team.color,
          borderRight: "2px solid white",
          width: "100%",
        }}
      ></div>
      {/* Yard Lines (10 yards each) */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: "100%",
            backgroundColor: i % 2 === 0 ? "#74c476" : "green",
            borderRight: "2px solid white",
            width: "100%",
          }}
        ></div>
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: "100%",
            backgroundColor: (i + 1) % 2 === 0 ? "green" : "#74c476",
            borderRight: "2px solid white",
            width: "100%",
          }}
        ></div>
      ))}
      {/* endzone 2 */}
      <div
        style={{
          height: "100%",
          backgroundColor: "#" + gameCast.teams[0].team.color,
          width: "100%",
        }}
      ></div>
      {/* current position of the ball */}
      {possessionTeam && (
        <>
          <div
            style={{
              position: "absolute",
              top: "calc(50% - 56px)",
              border: "2px solid white",
              right: `calc(${
                ((event.competitions[0].situation?.yardLine ?? 0) + 10) * 3
              }px - 25px)`,
              background: "black",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: "1",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <IonImg
                style={{
                  width: "20px",
                }}
                src={possessionTeam?.team.logos[3].href}
              />
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              top: "calc(50% - 3px)",
              ...(isHome
                ? {
                    left: `calc(${
                      (100 -
                        (event.competitions[0].situation?.yardLine ?? 0) +
                        10) *
                      3
                    }px - 3px)`,
                  }
                : {
                    right: `calc(${
                      ((event.competitions[0].situation?.yardLine ?? 0) + 10) *
                      3
                    }px - 3px)`,
                  }),
              background: "black",
              height: "6px",
              width: `${(gameCast.drives?.current.yards ?? 0) * 3}px`,
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              top: "calc(50% - 4px)",
              right: `calc(${
                ((event.competitions[0].situation?.yardLine ?? 0) + 10) * 3
              }px - 4px)`,
              background: "white",
              borderRadius: "50%",
              height: "8px",
              width: `8px`,
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              top: "calc(50% - 4px)",
              right: `calc(${
                ((gameCast.drives?.current.start.yardLine ?? 0) + 10) * 3
              }px - 4px)`,
              background: "white",
              borderRadius: "50%",
              height: "8px",
              width: `8px`,
            }}
          ></div>
        </>
      )}
    </div>
  );
}

// function GameCastFieldFancy() {
//   return (
//     <svg
//       id="drivechart"
//       className="field-svg field-svg--mobile"
//       viewBox="0 0 372 92"
//       preserveAspectRatio="xMinYMin"
//     >
//       <rect
//         className="field-bottom"
//         x="185.468"
//         y="67.814"
//         width="1.055"
//         height="4.043"
//         rx="0"
//         ry="0"
//         fill="#2c7b3d"
//         stroke="#000"
//       ></rect>
//       <path
//         className="field-bottom"
//         fill="#356732"
//         d="M216.127,67.814L216.086,71.857L186.523,71.857L186.523,67.814Z"
//       ></path>
//       <path
//         className="field-bottom"
//         fill="#356732"
//         d="M247.854,67.814L247.77,71.857L216.087,71.857L216.127,67.814Z"
//       ></path>
//       <path
//         className="field-bottom"
//         fill="#356732"
//         d="M278.514,67.814L278.389,71.857L247.77,71.857L247.854,67.814Z"
//       ></path>
//       <path
//         className="field-bottom"
//         fill="#356732"
//         d="M311.285,67.814L311.115,71.857L278.388,71.857L278.513,67.814Z"
//       ></path>
//       <path
//         className="field-bottom"
//         fill="#356732"
//         d="M340.898,67.814L340.689,71.857L311.116,71.857L311.285,67.814Z"
//       ></path>
//       <path
//         className="field-bottom"
//         fill="#9c9c9d"
//         d="M341.955,67.814L341.744,71.857L340.689,71.857L340.899,67.814Z"
//       ></path>
//       <path
//         className="field-bottom"
//         fill="#2a443b"
//         d="M371.559,67.814L371.308,71.857L341.744,71.857L341.955,67.814Z"
//       ></path>
//       <path
//         className="field-bottom"
//         fill="#356732"
//         d="M185.467,67.814L185.468,71.857L153.794,71.857L153.751,67.814Z"
//       ></path>
//       <path
//         className="field-bottom"
//         fill="#356732"
//         d="M153.751,67.814L153.795,71.857L123.177,71.857L123.091,67.814Z"
//       ></path>
//       <path
//         className="field-bottom"
//         fill="#356732"
//         d="M123.091,67.814L123.176,71.857L92.548,71.857L92.421,67.814Z"
//       ></path>
//       <path
//         className="field-bottom"
//         fill="#356732"
//         d="M92.421,67.814L92.548,71.857L61.93,71.857L61.762,67.814Z"
//       ></path>
//       <path
//         className="field-bottom"
//         fill="#356732"
//         d="M61.762,67.814L61.93,71.857L31.312,71.857L31.102,67.814Z"
//       ></path>
//       <path
//         className="field-bottom"
//         fill="#9c9c9d"
//         d="M31.102,67.814L31.312,71.857L29.202,71.857L28.989,67.814Z"
//       ></path>
//       <path
//         className="field-bottom"
//         fill="#2a443b"
//         d="M28.989,67.814L29.202,71.857L0.693,71.857L0.442,67.814Z"
//       ></path>
//       <path
//         className="field-top"
//         fill="#359f47"
//         d="M186.468,40.427L186.523,67.814L185.467,67.814L185.523,40.427Z"
//       ></path>
//       <path
//         className="field-top"
//         fill="#39b54a"
//         d="M212.943,40.427L216.127,67.814L186.524,67.814L186.468,40.427Z"
//       ></path>
//       <path
//         className="field-top"
//         fill="#359f47"
//         d="M241.315,40.427L247.854,67.814L216.127,67.814L212.943,40.427Z"
//       ></path>
//       <path
//         className="field-top"
//         fill="#39b54a"
//         d="M268.734,40.427L278.513,67.814L247.853,67.814L241.315,40.427Z"
//       ></path>
//       <path
//         className="field-top"
//         fill="#359f47"
//         d="M298.043,40.427L311.285,67.814L278.514,67.814L268.734,40.427Z"
//       ></path>
//       <path
//         className="field-top"
//         fill="#39b54a"
//         d="M324.527,40.427L340.898,67.814L311.285,67.814L298.043,40.427Z"
//       ></path>
//       <path
//         className="field-top"
//         fill="#cdcccc"
//         d="M325.471,40.427L341.955,67.814L340.899,67.814L324.526,40.427Z"
//       ></path>
//       <path
//         className="field-top field-home"
//         fill="#461d7c"
//         d="M351.945,40.427L371.559,67.814L341.955,67.814L325.472,40.427Z"
//       ></path>
//       <path
//         className="field-top"
//         fill="#39b54a"
//         d="M185.523,40.427L185.468,67.814L153.75,67.814L157.16,40.427Z"
//       ></path>
//       <path
//         className="field-top"
//         fill="#359f47"
//         d="M157.16,40.427L153.75,67.814L123.091,67.814L129.741,40.427Z"
//       ></path>
//       <path
//         className="field-top"
//         fill="#39b54a"
//         d="M129.741,40.427L123.092,67.814L92.422,67.814L102.313,40.427Z"
//       ></path>
//       <path
//         className="field-top"
//         fill="#359f47"
//         d="M102.313,40.427L92.421,67.814L61.762,67.814L74.894,40.427Z"
//       ></path>
//       <path
//         className="field-top"
//         fill="#39b54a"
//         d="M74.893,40.427L61.761,67.814L31.101,67.814L47.474,40.427Z"
//       ></path>
//       <path
//         className="field-top"
//         fill="#cdcccc"
//         d="M47.474,40.427L31.102,67.814L28.989,67.814L45.585,40.427Z"
//       ></path>
//       <path
//         className="field-top field-away"
//         fill="#9e1632"
//         d="M45.584,40.427L28.989,67.814L0.441,67.814L20.055,40.427Z"
//       ></path>
//       <text
//         className="field-text field-text-team"
//         x="20"
//         y="86.814"
//         text-anchor="start"
//       >
//         <tspan dy="3.493687499999993">ALA</tspan>
//       </text>
//       <text
//         className="field-text field-text-team"
//         x="350"
//         y="86.814"
//         text-anchor="end"
//       >
//         <tspan dy="3.493687499999993">LSU</tspan>
//       </text>
//       <text
//         className="field-text field-number"
//         x="186.00000000000000"
//         y="87.814"
//         text-anchor="middle"
//       >
//         <tspan dy="3.493687499999993">50</tspan>
//       </text>
//       <text
//         className="field-text red-zone-left"
//         x="92.50000000000000"
//         y="87.814"
//         text-anchor="middle"
//       >
//         <tspan dy="3.493687499999993">20</tspan>
//       </text>
//       <text
//         className="field-text red-zone-right"
//         x="279.00000000000000"
//         y="87.814"
//         text-anchor="middle"
//       >
//         <tspan dy="3.493687499999993">20</tspan>
//       </text>
//       <path
//         className="goal-post-left"
//         fill="#818181"
//         d="M8.294,54.432L9.304,53.236L9.304,44.868L8.294,46.064Z"
//       ></path>
//       <rect
//         className="goal-post-left"
//         x="6.275"
//         y="46.064"
//         width="2.02"
//         height="8.367"
//         rx="0"
//         ry="0"
//         fill="#2a443b"
//         stroke="#000"
//       ></rect>
//       <path
//         className="goal-post-left"
//         fill="#989898"
//         d="M7.285,44.869L9.305,44.869L8.294,46.063L6.274,46.063Z"
//       ></path>
//       <path
//         className="goal-post-left"
//         fill="none"
//         stroke="#faed24"
//         d="M13.726,36.307H12.018C9.207,36.307,7.765000000000001,38.137,7.765000000000001,43.909000000000006V44.55700000000001"
//         stroke-width="2"
//         stroke-linecap="square"
//         stroke-linejoin="round"
//         stroke-miterlimit="10"
//         stroke-opacity="1"
//       ></path>
//       <path
//         className="goal-post-left"
//         fill="none"
//         stroke="#f8ed40"
//         d="M14.268,35.791H11.761000000000001C8.950000000000001,35.791,7.5070000000000014,38.620999999999995,7.5070000000000014,44.393V45.557"
//         stroke-miterlimit="10"
//       ></path>
//       <path
//         className="goal-post-left"
//         fill="#f8ed40"
//         d="M11.171,39.062L16.721,33.946L16.155,33.557L10.605,38.67Z"
//       ></path>
//       <path
//         className="goal-post-left"
//         fill="#f8ed40"
//         d="M16.156,33.994L16.698,33.994L16.698,8.38L16.156,7.701Z"
//       ></path>
//       <rect
//         className="goal-post-left"
//         x="10.663"
//         y="11.922"
//         width="0.587"
//         height="27.804"
//         rx="0"
//         ry="0"
//         fill="#faed24"
//       ></rect>
//       <path
//         className="goal-post-left"
//         fill="#f8ed40"
//         d="M10.181,39.725C10.181,39.725,10.191999999999998,40.124,10.353,40.421C10.514,40.717999999999996,10.722999999999999,40.671,10.722999999999999,40.671V12.483L10.181,11.702V39.725Z"
//       ></path>
//       <path
//         className="goal-post-left"
//         fill="#818181"
//         d="M363.967,54.432L362.957,53.236L362.957,44.868L363.967,46.064Z"
//       ></path>
//       <rect
//         className="goal-post-left"
//         x="363.967"
//         y="46.064"
//         width="2.02"
//         height="8.367"
//         rx="0"
//         ry="0"
//         fill="#2a443b"
//         stroke="#000"
//       ></rect>
//       <path
//         className="goal-post-left"
//         fill="#989898"
//         d="M364.977,44.869L362.957,44.869L363.967,46.063L365.987,46.063Z"
//       ></path>
//       <path
//         className="goal-post-left"
//         fill="none"
//         stroke="#faed24"
//         d="M358.536,36.307H360.244C363.055,36.307,364.497,38.137,364.497,43.909000000000006V44.55700000000001"
//         stroke-width="2"
//         stroke-linecap="square"
//         stroke-linejoin="round"
//         stroke-miterlimit="10"
//         stroke-opacity="1"
//       ></path>
//       <path
//         className="goal-post-left"
//         fill="none"
//         stroke="#f8ed40"
//         d="M357.994,35.791H360.50100000000003C363.31300000000005,35.791,364.75600000000003,38.620999999999995,364.75600000000003,44.393V45.557"
//         stroke-miterlimit="10"
//       ></path>
//       <path
//         className="goal-post-left"
//         fill="#f8ed40"
//         d="M361.09,39.062L355.54,33.946L356.106,33.557L361.656,38.67Z"
//       ></path>
//       <path
//         className="goal-post-left"
//         fill="#f8ed40"
//         d="M356.105,33.994L355.564,33.994L355.564,8.38L356.105,7.701Z"
//       ></path>
//       <rect
//         className="goal-post-left"
//         x="361.012"
//         y="11.922"
//         width="0.586"
//         height="27.804"
//         rx="0"
//         ry="0"
//         fill="#faed24"
//       ></rect>
//       <path
//         className="goal-post-left"
//         fill="#f8ed40"
//         d="M362.081,39.725C362.081,39.725,362.07,40.124,361.908,40.421C361.748,40.717999999999996,361.539,40.671,361.539,40.671V12.483L362.08099999999996,11.702V39.725Z"
//       ></path>
//       <g className="PlayFader">
//         <g>
//           <circle fill="white" cx="280.16999999999996" cy="54" r="3"></circle>
//           <path stroke="white" d="M 280.16999999999996 54 L 212.665 54"></path>
//         </g>
//         <circle className="Dot" cx="212.665" cy="54" r="3"></circle>
//         <g>
//           <path
//             stroke="#e2ce23"
//             stroke-width="2"
//             d="M 167.96 68 L 169.32 40"
//           ></path>
//         </g>
//         <path
//           className="Arc"
//           d="M 212.665 54 C 208.99625, 30 201.65875, 30,197.99 54"
//           // style="stroke-dasharray: 40.53px; stroke-dashoffset: 40.53px;"
//           style={{
//             strokeDasharray: "40.53px",
//             strokeDashoffset: "40.53px",
//           }}
//         ></path>
//         <g
//           className="TeamLogoBubble fadeIn"
//           // style="transform: translate(-14.67px, 0px);"
//           style={{
//             transform: "translate(-14.67px, 0px)",
//           }}
//         >
//           <path
//             className="TeamLogoBubble__bubble"
//             d="m230.165 25 c0 9.76-17.6 26.4-17.6 26.4s-17.6-16.72-17.6-26.4 7.84-17.6 17.6-17.6 17.6 7.84 17.6 19.2z"
//           ></path>
//           <image
//             className="TeamLogoBubble__image"
//             // xlink:href="https://a.espncdn.com/i/teamlogos/ncaa/500/99.png"
//             preserveAspectRatio="none"
//             x="198.465"
//             y="12"
//             width="27"
//             height="27"
//           ></image>
//           <path
//             className="TeamLogoBubble__arrow"
//             d="m213.165 50.5 -4.2 3.5 4.2 3.5v-7zm0 2.6h2.4v2h-2.4z"
//           ></path>
//         </g>
//       </g>
//     </svg>
//   );
// }

function GameCastLastPlay({
  gameCast,
  event,
  picks,
}: {
  gameCast: GameCast;
  event: Scoreboard["events"][0];
  picks: Picks;
}) {
  const homeHasHigherPercent =
    picks.winProbability[picks.winProbability.length - 1].homeWinPercentage >=
    0.5;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          justifyContent: "space-between",
          padding: "5px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              marginRight: "5px",
              color: "var(--ion-color-medium)",
              fontSize: "0.8rem",
            }}
          >
            LAST PLAY:
          </span>
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: "800",
            }}
          >
            {event.competitions[0].situation?.downDistanceText}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "start",
            gap: "5px",
            fontSize: "0.8rem",
            color: "var(--ion-color-medium)",
          }}
        >
          Win %:
          <IonImg
            style={{
              width: "20px",
              height: "20px",
            }}
            src={
              gameCast.teams.find(
                (t) => t.homeAway === (homeHasHigherPercent ? "home" : "away")
              )?.team.logos[3].href
            }
          />
          <span
            style={{
              fontWeight: "800",
            }}
          >
            {homeHasHigherPercent
              ? (
                  picks.winProbability[picks.winProbability.length - 1]
                    .homeWinPercentage * 100
                ).toFixed(1)
              : (
                  (1 -
                    picks.winProbability[picks.winProbability.length - 1]
                      .homeWinPercentage) *
                  100
                ).toFixed(1)}
          </span>
        </div>
      </div>
      <span
        style={{
          fontSize: "0.8rem",
          color: "var(--ion-color-medium)",
          padding: "5px",
        }}
      >
        {event.competitions[0].situation?.lastPlay?.text}
      </span>
    </div>
  );
}

function GameCastPreview({
  gameCast,
  picks,
}: {
  gameCast: GameCast;
  picks: Picks;
}) {
  return <></>;
}

function GameCastBoxScore({
  gameCast,
  event,
}: {
  gameCast: GameCast;
  event: Scoreboard["events"][0];
}) {
  const boxScore = gameCast.boxScore;
  const [team1, team2] = boxScore.teams.sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "5fr repeat(5, 1fr)",
        gridTemplateRows: "1fr 1px 1fr",
        width: "100%",
        gap: "4px",
        fontSize: "0.8rem",
        padding: "10px",
      }}
    >
      <div></div>
      <div>1</div>
      <div>2</div>
      <div>3</div>
      <div>4</div>
      <div style={{ fontWeight: "800" }}>T</div>
      <div
        style={{
          gridColumn: "1 / span 6",
          background: "var(--ion-color-medium)",
        }}
      ></div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <IonImg
          src={team1.team.logo}
          style={{
            width: "20px",
            height: "20px",
          }}
        />
        {team1.team.shortDisplayName}
      </div>
      <div>{gameCast.teams[1].linescores[0]?.displayValue}</div>
      <div>{gameCast.teams[1].linescores[1]?.displayValue}</div>
      <div>{gameCast.teams[1].linescores[2]?.displayValue}</div>
      <div>{gameCast.teams[1].linescores[3]?.displayValue}</div>
      <div
        style={{
          fontWeight: "800",
        }}
      >
        {gameCast.teams[1].score}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <IonImg
          src={team2.team.logo}
          style={{ width: "20px", height: "20px" }}
        />
        {team2.team.shortDisplayName}
      </div>
      <div>{gameCast.teams[0].linescores[0]?.displayValue}</div>
      <div>{gameCast.teams[0].linescores[1]?.displayValue}</div>
      <div>{gameCast.teams[0].linescores[2]?.displayValue}</div>
      <div>{gameCast.teams[0].linescores[3]?.displayValue}</div>
      <div
        style={{
          fontWeight: "800",
        }}
      >
        {gameCast.teams[0].score}
      </div>
    </div>
  );
}