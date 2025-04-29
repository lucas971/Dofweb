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

const eventSource = new EventSource('/compute');

eventSource.onmessage = (e) => {
    console.log('progress')
};

async function handleCompute(textValue) {
    try {
        const response = await fetch("/compute", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: textValue })
        });

        if (!response.body) {
            throw new Error("Readable stream not supported in response");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = "";
        let intermediateResults = 0;
        let percentage = 100.0
        // Read the stream
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode and append the chunk
            const chunk = decoder.decode(value, { stream: true });
            console.log(chunk)

            const jsonObjects = chunk.match(/({[^}]+})/g);

            if (jsonObjects) {
                for (const obj of jsonObjects) {
                    try {
                        const json = JSON.parse(obj);
                        if (json.error){
                            document.getElementById("resultParagraphLink").innerText = "";
                            document.getElementById("resultParagraphScore").innerText = data.error
                        }
                        else if (json.percentage){
                            tabs[3].click()
                            percentage = parseFloat(json.percentage)
                        }
                        else if (json.intermediate){
                            tabs[3].click()
                            intermediateResults++
                            const intermediateText = '<a target="_blank" href="' + json.link + '">Intermediate result ' + intermediateResults.toString() + '</a>';

                            result = intermediateText + "\n\n----------------------------------------------\n\n" + result
                        }
                        else{
                            tabs[3].click()
                            var outputText = '<a target="_blank" href="' + json.link + '">The perfect stuff has been found</a>\n';
                            outputText += "Score : " + json.score + "\n\n";
                            for(var i = 0; i < json.items.length; i++){
                                outputText+= "- " + json.items[i] + "\n";
                            }

                            result = outputText + "\n\n----------------------------------------------\n\n" + result
                            document.getElementById("resultParagraphLink").innerText = "Link to stuff"
                            document.getElementById("resultParagraphLink").href = json.link
                        }
                        let progressText = "";
                        if (percentage >= 0.1){
                            progressText = "CURRENT PROGRESS : ["+(100.0 - percentage).toString() +"%]\n"
                        }
                        contents[3].innerHTML = progressText + result;
                    } catch (e) {
                        console.error("Invalid JSON chunk:", obj, e);
                    }
                }
            }
        }

        document.getElementById("submitBtn").style.display = 'block';
        
        // Check if the response is ok
        /*
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
        }*/
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