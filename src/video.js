
const videoForm = document.getElementById("videoForm");
const videoStatus = document.getElementById("videoStatus");

videoForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("videoTitle").value.trim();
    const message = document.getElementById("videoMessage").value.trim();
    const video = document.getElementById("videoUpload").files[0];

    if (title === "" || message === "") {
        videoStatus.textContent = "Please enter a title and message.";
        return;
    }

    if (!video) {
        videoStatus.textContent = "Please select a video.";
        return;
    }

    if (!video.type.startsWith("video/")) {
        videoStatus.textContent = "Please select a valid video file.";
        return;
    }

    console.log("Video Box button clicked!");
    console.log("Video title:", title);
    console.log("Video message:", message);
    console.log("Selected video:", video.name);

   
    window.location.href = "./myvideo.html";
});
