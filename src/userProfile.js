import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

// Creates the profile for new AND existing Auth accounts.
// The transaction avoids resetting createdAt or overwriting an existing profile.
export async function ensureUserProfile(user) {
  if (!user?.uid) throw new Error("Sign in before saving a user profile.");
  const ref = doc(db, "users", user.uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) {
      transaction.set(ref, {
        name: (user.displayName || user.email || "User").trim().slice(0, 100),
        email: user.email || "",
        createdAt: serverTimestamp(),
      });
    }
  });
}

export async function getUserProfile(user) {
  if (!user?.uid) throw new Error("Sign in before reading a user profile.");
  const snapshot = await getDoc(doc(db, "users", user.uid));
  return snapshot.exists() ? snapshot.data() : null;
}

