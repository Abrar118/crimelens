import { getDatabase } from "firebase-admin/database";
import { initAdmin } from "./firebase-admin";

export async function createNotification(userId: string, data: {
  type: string;
  post_id?: string;
  actor_id: string;
  message: string;
}) {
  initAdmin();
  const db = getDatabase();
  const ref = db.ref(`notifications/${userId}`).push();
  await ref.set({
    ...data,
    read: false,
    created_at: Date.now(),
  });
}
