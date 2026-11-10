// import { db } from "./firebaseConfig.js";
// import { onAuthReady } from "./authentication.js";
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// let currentUser = null;

// onAuthReady(function (user) {
//     if (!user) {
//         location.href = "index.html";
//         return;
//     }
//     currentUser = user;
// });

// async function saveLetter(event) {
//     event.preventDefault();

//     if (!currentUser) {
//         alert("Please wait a moment while we verify your login.");
//         return;
//     }

//     const newLetter = {
//         title: document.getElementById("letterTitle").value,
//         message: document.getElementById("letterMessage").value,
//         image: document.getElementById("letterUpload").value,
//         owner: currentUser.uid,
//         ownerName: currentUser.displayName || currentUser.email,
//         last_updated: serverTimestamp()
//     };

//     try {
//         await addDoc(collection(db, "Capsules"), newLetter);
//         location.href = "myletter.html";
//     } catch (error) {
//         alert(`Error saving hike:\n${error.code || ""}\n${error.message || error}`);
//     }
// }

// document.getElementById("letterForm").addEventListener("submit", saveLetter);
import { onAuthReady } from "./authentication.js";

const titleInput = document.getElementById("letterTitle");
const messageInput = document.getElementById("letterMessage");
const letterForm = document.getElementById("letterForm");

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

function goToCalendar(event) {
    event.preventDefault();

    if (!currentUser) {
        alert("Please wait a moment while we verify your login.");
        return;
    }

    const title = titleInput.value.trim();
    const content = messageInput.value.trim();

    if (!title || !content) {
        alert("Please enter a title and message.");
        return;
    }

    const draftKey = `letterDraft:${currentUser.uid}`;
    const draft = JSON.parse(sessionStorage.getItem(draftKey)) ?? {};

    draft.title = title;
    draft.content = content;

    const photoInput = document.getElementById("letterUpload");
    const photo = photoInput.files[0];

    if (photo) {
        draft.photoName = photo.name;
    }

    sessionStorage.setItem(draftKey, JSON.stringify(draft));
    location.href = "./calendar.html";
}

letterForm.addEventListener("submit", goToCalendar);