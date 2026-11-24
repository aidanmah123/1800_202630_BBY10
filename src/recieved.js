import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getIdToken, reload, sendEmailVerification } from "firebase/auth";
import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";

const capsuleList = document.getElementById("capsuleList");
const capsuleStatus = document.getElementById("capsuleStatus");
const refreshButton = document.getElementById("refreshLetters");
let stopListening = null;
let currentUser = null;
let authVersion = 0;
let renderVersion = 0;
let unlockTimer = null;
let updateCards = [];

function stopLetters() {
    stopListening?.();
    stopListening = null;
    capsuleList.replaceChildren();
    renderVersion++;
    clearInterval(unlockTimer);
    unlockTimer = null;
    updateCards = [];
}

function renderLetters(snapshot) {
    const render = ++renderVersion;
    const version = authVersion;
    capsuleList.replaceChildren();
    updateCards = [];
    const letters = snapshot.docs
        .map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }))
        .filter((capsule) => capsule.type === "letter")
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

    if (letters.length === 0) {
        capsuleStatus.textContent = "You have not received any letters yet.";
        return;
    }
    capsuleStatus.textContent = `${letters.length} received ${letters.length === 1 ? "letter" : "letters"}`;

    for (const letter of letters) {
        const item = document.createElement("li");
        item.className = "capsule-card";
        const title = document.createElement("h2");
        title.textContent = letter.title || "Untitled letter";
        const sender = document.createElement("p");
        sender.className = "capsule-sender";
        sender.textContent = `From: ${letter.senderEmail || "Sender not recorded"}`;
        const date = document.createElement("p");
        date.className = "capsule-unlock-date";
        const unlockAt = letter.unlockAt?.toDate?.();
        date.textContent = unlockAt ? `Unlock date: ${unlockAt.toLocaleString()}` : "Unlock date unavailable.";
        const state = document.createElement("p");
        const openButton = document.createElement("button");
        openButton.type = "button";
        const body = document.createElement("div");
        body.hidden = true;
        let opened = false;
        const canOpen = () => unlockAt && unlockAt.getTime() <= Date.now();
        const update = () => {
            if (opened) return;
            openButton.disabled = !canOpen();
            openButton.textContent = canOpen() ? "Open letter" : "Locked";
            state.textContent = canOpen() ? "Ready to open" : "Locked until the unlock date";
        };
        updateCards.push(update);
        update();
        openButton.onclick = () => {
            if (version !== authVersion || render !== renderVersion || opened || !canOpen()) return;
            // Front-end presentation lock only: the snapshot already contains
            // the full letter. No database-enforced time lock is applied.
            const content = document.createElement("p");
            content.className = "capsule-message";
            content.textContent = letter.content || "";
            body.replaceChildren(content);
            const photo = letter.photo;
            if (photo && ["image/jpeg", "image/png", "image/webp"].includes(photo.contentType)
                && typeof photo.data?.toBase64 === "function") {
                const image = document.createElement("img");
                image.src = `data:${photo.contentType};base64,${photo.data.toBase64()}`;
                image.alt = photo.name || "Letter attachment";
                image.loading = "lazy";
                image.style.maxWidth = "100%";
                body.append(image);
            }
            opened = true;
            body.hidden = false;
            state.textContent = "Opened";
            openButton.textContent = "Opened";
            openButton.disabled = true;
        };
        item.append(title, sender, date, state, openButton, body);
        capsuleList.append(item);
    }
}

function listenForLetters(user, version) {
    stopLetters();
    capsuleStatus.textContent = "Loading received letters...";
    const receivedQuery = query(
        collection(db, "Capsules"),
        where("recipientEmail", "==", user.email),
    );
    stopListening = onSnapshot(receivedQuery, (snapshot) => {
        if (version === authVersion) renderLetters(snapshot);
    }, (error) => {
        if (version !== authVersion) return;
        console.error("Could not load received letters:", error);
        capsuleList.replaceChildren();
        renderVersion++;
        updateCards = [];
        capsuleStatus.textContent = "Could not load received letters. Check your connection and try again.";
    });
    // Recheck button labels locally as dates arrive; this does not poll Firestore.
    unlockTimer = setInterval(() => updateCards.forEach((update) => update()), 1000);
}

function showVerification(user, version) {
    capsuleStatus.textContent = "Verify your account email before opening received letters. ";
    const sendButton = document.createElement("button");
    sendButton.type = "button";
    sendButton.textContent = "Send verification email";
    const checkButton = document.createElement("button");
    checkButton.type = "button";
    checkButton.textContent = "I have verified my email";
    const message = document.createElement("span");

    sendButton.onclick = async () => {
        sendButton.disabled = true;
        try {
            await sendEmailVerification(user);
            if (version === authVersion) message.textContent = " Verification email sent. Check your inbox.";
        } catch (error) {
            console.error("Could not send verification email:", error);
            if (version === authVersion) {
                message.textContent = " Could not send verification email. Please try again later.";
                sendButton.disabled = false;
            }
        }
    };
    checkButton.onclick = async () => {
        checkButton.disabled = true;
        try {
            await reload(user);
            if (version !== authVersion) return;
            if (!user.emailVerified) {
                message.textContent = " Your email has not been verified yet.";
                return;
            }
            await getIdToken(user, true);
            if (version === authVersion) listenForLetters(user, version);
        } catch (error) {
            console.error("Could not refresh verification:", error);
            if (version === authVersion) message.textContent = " Could not check verification. Please try again.";
        } finally {
            checkButton.disabled = false;
        }
    };
    capsuleStatus.append(sendButton, " ", checkButton, message);
}


onAuthReady((user) => {
    const version = ++authVersion;
    currentUser = user;
    stopLetters();
    if (!user) {
        capsuleStatus.textContent = "Sign in to see letters sent to you. ";
        const link = document.createElement("a");
        link.href = "./login.html";
        link.textContent = "Log in";
        capsuleStatus.append(link);
        return;
    }
    if (!user.email) {
        capsuleStatus.textContent = "An account with an email address is required to receive letters.";
        return;
    }
    if (!user.emailVerified) {
        showVerification(user, version);
        return;
    }
    listenForLetters(user, version);
});

window.addEventListener("pagehide", () => {
    authVersion++;
    stopLetters();
});
window.addEventListener("pageshow", (event) => {
    if (event.persisted && currentUser?.emailVerified) {
        listenForLetters(currentUser, authVersion);
    }
});
