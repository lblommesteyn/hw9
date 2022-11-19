// KNOWN BUG: DOESN'T WORK WITH JPG FILES
// SOLUTION: RENAME THE JPG TO PNG AND IT WILL WORK
// I HAVE NO IDEA WHY

// KEYS
// TODO MAKE KEY PRIVATE AAA
const API_KEY = ""; // API KEY HERE
const host = "https://vision.googleapis.com/v1/images:annotate?key=" + API_KEY;


// MAIN
document.querySelector("#uploadform").addEventListener("submit", (e) => {
    // PRESET DEFAULTS
    e.preventDefault();

    // Load image
    let imagePath = document.getElementById("file-ip-1").files[0];

    // Convert image to base64
    let fileReader = new FileReader();
    fileReader.readAsDataURL(imagePath);
    fileReader.onloadend = function(event) {
        let base64image = event.target.result.replace(/^data:image\/(png|jpg);base64,/, "");
    
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
                                type:"TEXT_DETECTION", 
                                maxResults:10
                            }
                        ]
                    }
                ]
            };
        const url = host;

        // SEND REQUEST
        let googleVisionReq = new XMLHttpRequest();
        googleVisionReq.open("POST",host);
        googleVisionReq.setRequestHeader("Accept", "application/json"); googleVisionReq.setRequestHeader("Content-Type", "application/json");

        googleVisionReq.onreadystatechange = () => {
            if (googleVisionReq.readyState == 4) {onResponse(googleVisionReq.responseText);}
        }; // Attach the onResponse function

        let paramsAsJSON = JSON.stringify(requestParams);
        googleVisionReq.send(paramsAsJSON);
    }
    return false;
});

// ON RESPONSE -- once we recieve the search string back from Google
function onResponse(response) {
    console.log("Got a response! " + response); // DEBUG
}