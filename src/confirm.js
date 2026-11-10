import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";

onAuthReady(function (user) {
    if (!user) {
        location.href = "./index.html";
        return;
    }

    const draftKey = `letterDraft:${user.uid}`;
    const draft = JSON.parse(sessionStorage.getItem(draftKey));

    if (!draft) {
        location.href = "./create-letter.html";
        return;
    }

    if (!draft.recipientEmail || !draft.unlockAt) {
        location.href = "./calendar.html";
        return;
    }

    document.getElementById("confirmTitle").textContent = draft.title;
    document.getElementById("confirmContent").textContent = draft.content;
    document.getElementById("confirmEmail").textContent = draft.recipientEmail;
    document.getElementById("confirmUnlockAt").textContent =
        new Date(draft.unlockAt).toLocaleString();
        
    const media = document.getElementById("confirmMedia");

    if (draft.photoName) {
        media.textContent = `1 photo (${draft.photoName})`;
    } else {
        media.textContent = "No attachments";
    }



    const lockButton = document.getElementById("lockCapsule");
    lockButton.disabled = false;

    lockButton.onclick = async function () {
        const unlockDate = new Date(draft.unlockAt);

        if (!(unlockDate.getTime() > Date.now())) {
            alert("Please go back and choose a future unlock date.");
            return;
        }

        lockButton.disabled = true;

        const capsule = {
            type: "letter",
            title: draft.title,
            content: draft.content,
            recipientEmail: draft.recipientEmail,
            unlockAt: Timestamp.fromDate(unlockDate),
            createdAt: serverTimestamp(),
            ownerId: user.uid
        };

        try {
            await addDoc(collection(db, "Capsules"), capsule);
        } catch (error) {
            console.error("Failed to save capsule", error);
            alert("Could not save the letter. Your draft is still here.");
            lockButton.disabled = false;
            return;
        }

        sessionStorage.removeItem(draftKey);
        location.replace("./myletter.html");
    };
});