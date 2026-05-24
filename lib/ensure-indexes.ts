import { getDb } from "./mongodb";

let indexesCreated = false;

export async function ensureIndexes() {
  if (indexesCreated) return;

  try {
    const db = await getDb();
    await db.collection("posts").createIndex(
      { title: "text", description: "text" },
      { name: "posts_text_search" }
    );
    indexesCreated = true;
  } catch {
    // Index may already exist, that's fine
    indexesCreated = true;
  }
}
