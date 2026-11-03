import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

let currentUser = null;

onAuthReady(function (user) {
    if (!user) {
        location.href = "index.html";
        return;
    }
    currentUser = user;
});

async function saveLetter(event) {
    event.preventDefault();

    if (!currentUser) {
        alert("Please wait a moment while we verify your login.");
        return;
    }

    const newLetter = {
        title: document.getElementById("letterTitle").value,
        message: document.getElementById("letterMessage").value,
        image: document.getElementById("letterUpload").value,
        owner: currentUser.uid,
        ownerName: currentUser.displayName || currentUser.email,
        last_updated: serverTimestamp()
    };

    try {
        await addDoc(collection(db, "Capsules"), newLetter);
        location.href = "myletter.html";
    } catch (error) {
        alert(`Error saving hike:\n${error.code || ""}\n${error.message || error}`);
    }
}

document.getElementById("letterForm").addEventListener("submit", saveLetter);