// JavaScript to handle POST request
document.getElementById("submitBtn").addEventListener("click", function() {
    var textValue = editor.getValue();  // Use the 'editor' variable to get the content
    
    // Hide the submit button after the click
    document.getElementById("submitBtn").style.display = 'none';

    // Send the POST request with the value of the Ace editor
    handleCompute(textValue);
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

            if (data.error){
                document.getElementById("resultParagraphLink").innerText = "";
                document.getElementById("resultParagraphScore").innerText = data.error
            }
            document.getElementById("resultParagraphLink").innerText = "Link to stuff"
            document.getElementById("resultParagraphLink").href = data.link
            document.getElementById("resultParagraphScore").innerText = "Score : " + data.result

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
