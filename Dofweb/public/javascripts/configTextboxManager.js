// JavaScript to handle POST request
var currentProfile = 1
var contents
var tabs

function UpdateProfiles(){
    for (var i = 1; i <= 10; i++){
        let profileNameValue = localStorage.getItem("profileName" + i)
        if (profileNameValue == null || profileNameValue.length === 0){
            document.getElementById("saveFile"+i).innerText = "Profile " + i;
        }
        else{
            document.getElementById("saveFile"+i).innerText = profileNameValue;
        }
    }
}

function Submit(){
    var textValue = editor.getValue();  // Use the 'editor' variable to get the content
    localStorage.setItem('lastText' + currentProfile, textValue);
    var profileName = document.getElementById("profileName").value
    if (profileName.length > 0){
        localStorage.setItem("profileName" + currentProfile, profileName)
    }
    UpdateProfiles()
    // Hide the submit button after the click
    document.getElementById("submitBtn").style.display = 'none';
    document.getElementById("resultParagraphLink").innerText = "";
    document.getElementById("resultParagraphScore").innerText = "";
    // Send the POST request with the value of the Ace editor
    handleCompute(textValue);
}
document.getElementById("submitBtn").addEventListener("click", function() {
    Submit()
});

function TrySetLastValue(){
    let textValue = localStorage.getItem("lastText" + currentProfile)
    if (textValue){
        editor.setValue(textValue)
    }
    let profileNameValue = localStorage.getItem("profileName" + currentProfile)
    document.getElementById("profileName").value = ""
    if (profileNameValue){
        document.getElementById("profileName").placeholder = profileNameValue
    }
    else{
        document.getElementById("profileName").placeholder = "Profile " + currentProfile
    }
}

document.getElementById("resetBtn").addEventListener("click", function() {
    editor.setValue(baseInput.text) 
});

document.getElementById("saveFile").addEventListener("change", function(){
    currentProfile = document.getElementById("saveFile").value
    TrySetLastValue()
})

document.getElementById("profileName").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        Submit()
    }
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
            else{
                var outputText = "A stuff has been found !\n" //todo : score field
                outputText += "Score : " + data.result + "\n\n";
                for(var i = 0; i < data.items.length; i++){
                    outputText+= "- " + data.items[i] + "\n";
                }
                
                tabs[3].click()
                contents[3].innerHTML = outputText;
                
                document.getElementById("resultParagraphLink").innerText = "Link to stuff"
                document.getElementById("resultParagraphLink").href = data.link
                
            }

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

document.addEventListener('DOMContentLoaded', () => {
    tabs = document.querySelectorAll('.tab');
    contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Hide all tab contents
            contents.forEach(content => content.classList.remove('active'));

            // Activate the clicked tab
            tab.classList.add('active');
            // Show the corresponding content
            const tabContent = document.getElementById(tab.dataset.tab);
            tabContent.classList.add('active');
        });
    });
    
    UpdateProfiles()
});

TrySetLastValue()