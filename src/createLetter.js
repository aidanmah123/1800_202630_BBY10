import { onAuthReady } from "./authentication.js";

const titleInput = document.getElementById("letterTitle");
const messageInput = document.getElementById("letterMessage");
const letterForm = document.getElementById("letterForm");
const photoInput = document.getElementById("letterUpload");

let currentUser = null;

onAuthReady(function (user) {
    currentUser = user;

    if (!user) {
        location.href = "./index.html";
        return;
    }

    const draftKey = `letterDraft:${user.uid}`;
    const draft = JSON.parse(sessionStorage.getItem(draftKey));

    if (draft) {
        titleInput.value = draft.title;
        messageInput.value = draft.content;
    }
});

function readPhoto(photo) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(photo);
    });
}

async function goToCalendar(event) {
    event.preventDefault();

    if (!currentUser) {
        alert("Please wait a moment while we verify your login.");
        return;
    }

    const title = titleInput.value.trim();
    const content = messageInput.value.trim();
    const photo = photoInput.files[0];

    if (!title || !content) {
        alert("Please enter a title and message.");
        return;
    }

    if (photo) {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(photo.type) || photo.size > 512 * 1024) {
            alert("Please choose a JPG, PNG, or WebP photo up to 512 KB.");
            return;
        }
    }

    const draftKey = `letterDraft:${currentUser.uid}`;
    const draft = JSON.parse(sessionStorage.getItem(draftKey)) ?? {};

    draft.title = title;
    draft.content = content;


    try {
        if (photo) {
            draft.photo = await readPhoto(photo);
            draft.photoName = photo.name;
            draft.photoId = crypto.randomUUID();
        }

        sessionStorage.setItem(draftKey, JSON.stringify(draft));
        location.href = "./calendar.html";

    } catch (error) {
        console.error("Failed to save the draft", error);
        alert("Could not save the draft. Please try again.");
    }

}

letterForm.addEventListener("submit", goToCalendar);