import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
    build: {
        rollupOptions: {
            input: [
                "index.html",
                "box-creation.html",
                "calendar.html",
                "confirm.html",
                "create-letter.html",
                "create-video.html",
                "login.html",
                "myletter.html",
                "myvideo.html",
                "sent-letter.html",
            ].map((page) => resolve(projectRoot, page)),
        },
    },
});
