import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { PickDocument, WeekDocument } from "./types";
import { keysDiff } from "./utils";
import { FieldValue } from "firebase-admin/firestore";
import { db } from ".";
import { getDatabase } from "firebase-admin/database";
import { getFunctions } from "firebase-admin/functions";

export const onWeekUpdate = onDocumentWritten("weeks/{id}", async (snap) => {
  if (!snap.data) return;
  const before = snap.data.before.data();
  const after = snap.data.after.data();
  if (!before || !after) return;
  // prevent infinite loop
  if (after.reverted) {
    await snap.data.after.ref.update({ reverted: FieldValue.delete() });
    return;
  }

  if (!before.published && after.published) {
    const latestWeek = await db
      .collection("weeks")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    if (!latestWeek.empty) {
      const latestWeekDoc = latestWeek.docs[0].data() as WeekDocument;
      if (latestWeekDoc.id === after.id) {
        // update everyones realtime ref to the latest week
        const database = getDatabase();
        const usersRef = database.ref("/");
        const users = await usersRef.once("value");
        if (users.exists()) {
          const usersDoc = users.val() as Record<string, any>;
          for (const uid in usersDoc) {
            await usersRef.child(uid).update({ week: latestWeekDoc.id });
          }
        }
      }
    }
  }
  const diff = keysDiff(before, after);
  if (diff.picks) {
    const uid = Object.keys(diff.picks)[0];
    const oldValue = diff.picks[uid].oldValue as PickDocument[];
    const newValue = diff.picks[uid].newValue as PickDocument[];
    // find any games that have different picks than before
    const updates = oldValue.map(async (pick) => {
      const newPick = newValue.find(
        (p) => p.game === pick.game
      ) as PickDocument;
      if (!newPick) return;
      const game = (after as WeekDocument)?.games?.find(
        (g) => g.id === newPick.game
      );
      if (
        pick.winner !== newPick.winner ||
        pick.overUnder !== newPick.overUnder
      ) {
        if (!game?.locked) {
          // calculate new chances  to win
          const simulateResults = getFunctions().taskQueue("runSimulations");
          await simulateResults.enqueue({
            weekId: after.id,
          });
          return;
        } else {
          return snap.data?.after.ref.update({
            [`picks.${uid}`]: oldValue,
            reverted: true, // flag to prevent infinite loop
          });
        }
      }
    });
    await Promise.all(updates);
  }
});
