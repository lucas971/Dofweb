// JavaScript to handle POST request
document.getElementById("submitBtn").addEventListener("click", function() {
    var textValue = document.querySelector("textarea").value;

    // Send the POST request with the value of the textarea
    fetch("/compute", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({text: textValue})
    })
        .then(response => response.json())
        .then(data => {
            console.log("Success:", data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
});
    
