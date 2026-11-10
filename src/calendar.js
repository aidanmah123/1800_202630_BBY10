import { onAuthReady } from "./authentication.js";

const calendarForm = document.getElementById("calendarForm");
const recipientEmailInput = document.getElementById("recipientEmail");
const unlockDateInput = document.getElementById("unlockDate");

let draftKey;
let draft;

onAuthReady(function (user) {
    if (!user) {
        location.href = "./index.html";
        return;
    }

    draftKey = `letterDraft:${user.uid}`;
    draft = JSON.parse(sessionStorage.getItem(draftKey));

    if (!draft) {
        location.href = "./create-letter.html";
        return;
    }

    recipientEmailInput.value = draft.recipientEmail ?? "";
    unlockDateInput.value = draft.unlockAt ?? "";
});

calendarForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!draft) {
        return;
    }

    const unlockAt = unlockDateInput.value;
    const unlockTime = new Date(unlockAt).getTime();

    if (!Number.isFinite(unlockTime) || unlockTime <= Date.now()) {
        alert("Please choose a date and time in the future.");
        return;
    }

    draft.recipientEmail = recipientEmailInput.value.trim();
    draft.unlockAt = unlockAt;

    sessionStorage.setItem(draftKey, JSON.stringify(draft));
    location.href = "./confirm.html";
});