
const letterForm = document.getElementById("letterForm");
const letterStatus = document.getElementById("letterStatus");

letterForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("letterTitle").value.trim();
    const message = document.getElementById("letterMessage").value.trim();
    const file = document.getElementById("letterUpload").files[0];

    if (title === "" || message === "") {
        letterStatus.textContent = "Please enter a title and message.";
        return;
    }

    console.log("Letter Box button clicked!");
    console.log("Letter title:", title);
    console.log("Letter message:", message);

    if (file) {
        console.log("Attached file:", file.name);
    }

    letterStatus.textContent =
        "Letter ready! ";
});
