// JavaScript to handle POST request
document.getElementById("submitBtn").addEventListener("click", function() {
    var textValue = document.querySelector("textarea").value;

    document.getElementById("submitBtn").style.display = 'none';
    // Send the POST request with the value of the textarea
    handleCompute(textValue)
});


async function handleCompute(textValue) {
    try {
        // Send a POST request to the backend
        const response = await fetch("/compute", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({text: textValue})
        });

        document.getElementById("submitBtn").style.display = 'block';
        // Check if the response is ok
        if (response.ok) {
            const data = await response.json(); // Parse JSON response
            console.log('Received data:', data);


            document.getElementById("resultParagraphLink").innerText = "Link to stuff"
            document.getElementById("resultParagraphLink").href = data.message

        } else {
            console.error('Failed to fetch data:', response.status);
        }
    } catch (error) {
        console.error('Error during fetch:', error);
    }
}

// Event listener for 'optimizationCompleted'
window.addEventListener('optimizationCompleted', (e) => {
    console.log('Optimization completed:', e.detail); // Handle the event data
    alert(e.detail.message); // Example action, like showing an alert with the message
});
