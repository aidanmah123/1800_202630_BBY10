import "bootstrap/dist/css/bootstrap.min.css";

import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import {
    collection,
    getDocs,
    query,
    where
} from "firebase/firestore";

const status = document.getElementById("videoStatus");
const videoList = document.getElementById("videoList");

onAuthReady(async function (user) {
    videoList.replaceChildren();

    if (!user) {
        status.textContent = "Please log in to see your video capsules.";
        return;
    }

    status.textContent = "Loading...";

    try {
        const myCapsules = query(
            collection(db, "Capsules"),
            where("ownerId", "==", user.uid)
        );

        const snapshot = await getDocs(myCapsules);
        let count = 0;

        snapshot.forEach(function (capsuleDoc) {
            const capsule = capsuleDoc.data();

            if (capsule.type !== "video") {
                return;
            }

            count += 1;

            const column = document.createElement("div");
            column.className = "col-12 col-md-6 col-lg-4";

            const card = document.createElement("article");
            card.className = "card shadow-sm h-100";

            const body = document.createElement("div");
            body.className = "card-body";

            const title = document.createElement("h2");
            title.className = "card-title h5";
            title.textContent = capsule.title;

            const message = document.createElement("p");
            message.className = "card-text";
            message.textContent = capsule.content;

            const unlockDate = document.createElement("p");
            unlockDate.className = "text-secondary small";

            const date = capsule.unlockAt?.toDate();
            unlockDate.textContent = date
                ? "Scheduled unlock: " + date.toLocaleString()
                : "No unlock date set.";

            body.append(title, message, unlockDate);
            card.appendChild(body);
            column.appendChild(card);
            videoList.appendChild(column);
        });

        status.textContent = count === 0
            ? "No video capsules found."
            : "Your video capsule details are loaded.";
    } catch (error) {
        console.error("Could not load capsules:", error);
        status.textContent = "Could not load your capsules.";
    }
});