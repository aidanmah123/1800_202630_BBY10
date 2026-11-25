import { logoutUser, onAuthReady } from "../authentication.js";

class SiteNavbar extends HTMLElement {
    constructor() {
        super();
        this.renderNavbar();
        this.renderAuthControls();
    }

    renderNavbar() {
        const currentPath = window.location.pathname;

        const navLinks = [
            { text: "Create a Capsule", href: "/box-creation.html" },
            { text: "Created/Sent Capsules", href: "/myletter.html" },
            { text: "Recieved Capsules", href: "/recievedletter.html" },
            { text: "Logout", href: "/" }
        ];

        const linksHTML = navLinks.map(link => {
            const isActive = currentPath === link.href || currentPath.endsWith(link.href);
            const activeClass = isActive ? " active" : "";
            
            return `
                <li class="nav-item">
                    <a class="nav-link${activeClass}" href="${link.href}">${link.text}</a>
                </li>
            `;
        }).join("");

        this.innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-light">
                <div class="container-fluid">
                    <div class="navbar-brand">
                        <img
                            class="brand-logo"
                            src="./images/timecapsulelogo.png"
                            alt="Time Capsule Logo"/>
                    </div>
                    <button
                        class="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto">
                            ${linksHTML}
                        </ul>
                        <div id="authControls" class="d-flex"></div>
                    </div>
                </div>
            </nav>
        `;
    }

    renderAuthControls() {
        const authControls = this.querySelector("#authControls");

        authControls.innerHTML = `
            <div class="btn btn-outline-light"
                 style="visibility: hidden; min-width: 80px;">
                Log out
            </div>
        `;

        onAuthReady((user) => {
            if (user) {
                authControls.innerHTML = `
                    <button
                        class="btn btn-outline-light"
                        id="signOutBtn"
                        type="button"
                        style="min-width: 80px;">
                        Log out
                    </button>
                `;

                authControls
                    .querySelector("#signOutBtn")
                    .addEventListener("click", logoutUser);
            } else {
                authControls.innerHTML = `
                    <a
                        class="btn btn-outline-light"
                        id="loginBtn"
                        href="/login.html"
                        style="min-width: 80px;">
                        Log in
                    </a>
                `;
            }
        });
    }
}

customElements.define("site-navbar", SiteNavbar);