import { logoutUser, onAuthReady } from "../authentication.js";

class SiteNavbar extends HTMLElement {
    constructor() {
        super();
        this.renderNavbar();
        this.renderAuthControls();
    }

    renderNavbar() {
        this.innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-light">
                <div class="container-fluid">
                    <a class="navbar-brand" href="/">
                        <img class="brand-logo" src="./images/logo.png" alt="">
                        <span>Time Capsule</span>
                    </a>

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
                            <li class="nav-item">
                                <a class="nav-link" href="/">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/myletter.html">My Capsules</a>
                            </li>
                        </ul>

                        <div class="d-flex align-items-center gap-2 ms-lg-2" id="rightControls">
                            <form class="d-flex align-items-center gap-2 my-2 my-lg-0" id="navSearch" role="search">
                                <input
                                    class="form-control d-none d-sm-block w-auto"
                                    type="search"
                                    placeholder="Search"
                                    aria-label="Search">
                                <button
                                    class="btn btn-outline-light d-none d-sm-inline-block"
                                    type="submit">
                                    Search
                                </button>
                            </form>

                            <div
                                id="authControls"
                                class="auth-controls d-flex align-items-center gap-2 my-2 my-lg-0">
                            </div>
                        </div>
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