import {
    collection,
    onSnapshot,
    query,
    where,
} from "firebase/firestore";
import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";

const capsuleList = document.getElementById("capsuleList");
const capsuleStatus = document.getElementById("capsuleStatus");
let stopListening = null;

function renderLetters(snapshot) {
    capsuleList.replaceChildren();

    const letters = snapshot.docs
        .map((letterSnapshot) => letterSnapshot.data())
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

    if (letters.length === 0) {
        capsuleStatus.textContent = "You have not created any letters yet.";
        return;
    }

    capsuleStatus.textContent = `${letters.length} ${letters.length === 1 ? "letter" : "letters"}`;

    for (const letter of letters) {
        const item = document.createElement("li");
        item.className = "capsule-card";

        const title = document.createElement("h2");
        title.textContent = letter.title || "Untitled letter";

        const recipient = document.createElement("p");
        recipient.className = "capsule-recipient";
        recipient.textContent = `To: ${letter.recipientEmail || "Unknown recipient"}`;

        const message = document.createElement("p");
        message.className = "capsule-message";
        message.textContent = letter.message || "";

        item.append(title, recipient, message);
        capsuleList.append(item);
    }
}

onAuthReady((user) => {
    stopListening?.();
    stopListening = null;
    capsuleList.replaceChildren();

    if (!user) {
        capsuleStatus.textContent = "Sign in to see the letters you created.";
        const loginLink = document.createElement("a");
        loginLink.href = "./login.html";
        loginLink.textContent = "Log in";
        capsuleStatus.append(" ", loginLink);
        return;
    }

    capsuleStatus.textContent = "Loading your letters...";
    const lettersQuery = query(
        collection(db, "letters"),
        where("senderUid", "==", user.uid),
    );

    stopListening = onSnapshot(
        lettersQuery,
        renderLetters,
        (error) => {
            console.error("Could not load letters:", error);
            capsuleStatus.textContent = "Could not load your letters. Check your connection and try again.";
        },
    );
});
