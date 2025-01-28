import { onSchedule } from "firebase-functions/v2/scheduler";
import {
  getScoreboardHelper,
  initializeWeekHelper,
  updateLocksHelper,
  updateOddsHelper,
  updateResultsHelper,
} from "./utils";
import { db } from ".";
import { log, error } from "firebase-functions/logger";
import * as dayjs from "dayjs";
import cfb from "./cfb";

export const updateOddsSchedule = onSchedule(
  {
    schedule: "every hour",
  },
  async () => {
    log("Running updateOddsSchedule");
    const week = await db
      .collection("weeks")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    if (!week.docs.length) return;
    const res = await updateOddsHelper(week.docs[0].id);
    if (res.error) {
      error(res.error);
    } else {
      log("Successfully updates odds");
    }
  }
);

export const updateLocksAndResultsSchedule = onSchedule(
  {
    schedule: "*/5 * * * *",
  },
  async () => {
    log("Running updateLocksAndResultsSchedule");
    const week = await db
      .collection("weeks")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    if (!week.docs.length) return;
    const res = await updateLocksHelper(week.docs[0].id);
    if (res.error) {
      error(res.error);
    } else {
      log("Successfully updates locks");
    }
    log(`Updating results for week ${week.docs[0].id}`);
    const res2 = await updateResultsHelper(week.docs[0].id);
    if (res2.error) {
      error(res.error);
    } else {
      log("Successfully updates results");
    }
  }
);

export const initializeWeekSchedule = onSchedule(
  {
    schedule: "2 7 * * 2",
    timeZone: "America/New_York",
  },
  async () => {
    log("Running initializeWeekSchedule");
    const week = await db
      .collection("weeks")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    const count = await db.collection("weeks").count().get();
    if (!week.docs.length) return;
    const today = dayjs();
    const from = today.toISOString().split("T")[0];
    const to = today.add(7, "days").toISOString().split("T")[0];
    const res = await initializeWeekHelper(
      from,
      to,
      `Week ${count.data().count + 1}`
    );
    if (res.error) {
      error(res.error);
    } else {
      log("Successfully initialized week");
    }
  }
);

export const fetchScoreboardSchedule = onSchedule(
  {
    schedule: "* * * * *",
    timeZone: "America/New_York",
  },
  async () => {
    log("Running fetchScoreboardSchedule");
    const week = await db
      .collection("weeks")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    if (!week.docs.length) return;
    await getScoreboardHelper(week.docs[0].data() as any);
  }
);
