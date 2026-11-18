
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";

const letterForm = document.getElementById("letterForm");
const letterStatus = document.getElementById("letterStatus");
const submitButton = letterForm.querySelector('button[type="submit"]');
let currentUser = null;
let authResolved = false;

onAuthReady((user) => {
    currentUser = user;
    authResolved = true;
    submitButton.disabled = !user;

    if (!user) {
        const loginLink = document.createElement("a");
        loginLink.href = "./login.html";
        loginLink.textContent = "Log in";
        letterStatus.replaceChildren("Sign in to save a letter. ", loginLink);
    } else {
        letterStatus.textContent = "";
    }
});

letterForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("letterTitle").value.trim();
    const recipientEmail = document.getElementById("letterRecipient").value.trim().toLowerCase();
    const message = document.getElementById("letterMessage").value.trim();

    if (!authResolved || !currentUser) {
        letterStatus.textContent = "Sign in before saving a letter.";
        return;
    }

    if (title === "" || recipientEmail === "" || message === "") {
        letterStatus.textContent = "Please enter a title, recipient email, and message.";
        return;
    }

    submitButton.disabled = true;
    letterStatus.textContent = "Saving your letter...";

    try {
        await addDoc(collection(db, "letters"), {
            title,
            recipientEmail,
            message,
            senderUid: currentUser.uid,
            senderName: currentUser.displayName || currentUser.email || "User",
            createdAt: serverTimestamp(),
        });
        window.location.href = "./myletter.html";
    } catch (error) {
        console.error("Could not save letter:", error);
        letterStatus.textContent = "Could not save your letter. Check your connection and try again.";
        submitButton.disabled = false;
    }
});
