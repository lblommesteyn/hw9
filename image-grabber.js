// KEYS
const API_KEY = "";
const host = "https://vision.googleapis.com/v1/images:annotate?key="; // TODO: MAKE PRIVATE


// MAIN
document.getElementById("form").addEventListener("submit", (e) => {
    // PRESET DEFAULTS
    console.log("Starting request!"); // DEBUG
    e.preventDefault();

    // Load image
    let imagePath = document.getElementById("img").files[0];

    // Convert image to base64
    let fileReader = new FileReader();
    fileReader.readAsDataURL(imagePath);
    fileReader.onloadend = function(event) {
        let base64image = event.target.result.replace(/^data:image\/(png|jpg);base64,/, "");
        console.log("Base64 conversion complete!"); // DEBUG
    
        // BUILD URL / set up parameters
        const requestParams = {
            requests: [
                {
                    image:
                        {
                            content:base64image
                        } ,
                        
                        features: [
                            {
                                type:"LABEL_DETECTION", 
                                maxResults:1
                            }
                        ]
                    }
                ]
            };
        const url = host + API_KEY;
        console.log("Sending a request to " + url); // TODO: REMOVE AS IT WILL BREAK API KEY PRIVACY

        // SEND REQUEST
        let googleVisionReq = new XMLHttpRequest();
        googleVisionReq.open("POST",host);
        googleVisionReq.setRequestHeader("Accept", "application/json"); googleVisionReq.setRequestHeader("Content-Type", "application/json");

        googleVisionReq.onreadystatechange = () => {
            if (googleVisionReq.readyState == 4) {onResponse(googleVisionReq.responseText);}
        }; // Attach the onResponse function

        let paramsAsJSON = JSON.stringify(requestParams);
        console.log(paramsAsJSON);
        googleVisionReq.send(paramsAsJSON);
    }
    return false;
});

// ON RESPONSE -- once we recieve the search string back from Google
function onResponse(response) {
    console.log("Got a response! " + response); // DEBUG
}