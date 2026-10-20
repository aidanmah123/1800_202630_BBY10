import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../styles/style.css';
import { app } from './firebaseConfig.js';
console.log('Firebase initialized:', app.options.projectId);

function sayHello() {

}
// document.addEventListener('DOMContentLoaded', sayHello);
import { onAuthReady } from "./authentication.js";

function showName() {
    onAuthReady(function(user) {
        const nameElement =
            document.getElementById("name-goes-here");

        if (!nameElement) {
            return;
        }

        if (user) {
            const name = user.displayName || user.email;
            nameElement.textContent = name + "!";
        } else {
            nameElement.textContent = "";
        }
    });
}

showName();