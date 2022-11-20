// -- KEYS and URLS -- //
const GOOGLE_API_KEY = "AIzaSyDytr4TFNF868tfXRWKHltqyAV9EdjLr6s";
const COHERE_API_KEY = "Jdw5DZ35BUXCc5zWqCHsQdiVPlUThGFWI4UCgMed";
const googleUrl = "https://vision.googleapis.com/v1/images:annotate?key=" + GOOGLE_API_KEY;
const cohereUrl = "https://api.cohere.ai/generate";

// Other things
let submitButton = document.querySelector(".sbmt-btn");


// RUNS WHEN THE USER CLICKS "GET THE FACTS"
// -- OnClick Listener -- //
document.querySelector("#uploadform").addEventListener("submit", (e) => {
    // Stops the button from reloading the page
    e.preventDefault();

    console.log("The button was pressed!");

    // Load image
    let imagePath = document.getElementById("file-ip-1").files[0];

    // Convert image to base64
    let fileReader = new FileReader();
    fileReader.readAsDataURL(imagePath);

    // Callback from base64: 
    fileReader.onloadend = (event) => {readTextFromImage(event)};
    return false; // Stops the button from reloading the page..?
});


// -- IMAGE READING -- //
// Reads the text contained within a base64-encoded image
let googleVisionTimeoutCounter = 0;
function readTextFromImage(event) {
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

    // SEND REQUEST
    let googleVisionReq = new XMLHttpRequest();
    googleVisionReq.open("POST",googleUrl);
    googleVisionReq.setRequestHeader("Accept", "application/json"); googleVisionReq.setRequestHeader("Content-Type", "application/json");

    googleVisionReq.onreadystatechange = () => {
        if (googleVisionReq.readyState == 4) {
            if (googleVisionReq.status != 200) {
                if (coHereTryCounter <= 5) {
                    setTimeout((text) => {
                        coHereTryCounter++;
                        console.log("Google's request didn't work! Trying for the " + googleVisionTimeoutCounter + "th time");
                        readTextFromImage(event);
                    }, 10000);
                } else {
                    alert("Google Vision didn't work! Try again...");
                    location.reload();
                }
            } else {
                onResponseFromGoogle(googleVisionReq.responseText);}
            }
    }; // Attach the onResponse function

    let paramsAsJSON = JSON.stringify(requestParams);
    googleVisionReq.send(paramsAsJSON);
    googleVisionIsWorking();
}

// Use this to update the UI when google is working on the image
function googleVisionIsWorking() {
    console.log("Waiting on Google Vision...");
    submitButton.textContent = "Reading image...";
}

// HANDLE RESPONSE FROM READ IMAGE
// Parses the text that was read and starts summarization
function onResponseFromGoogle(response) {
    console.log("Got a response from Google Vision!"); // DEBUG
    let capturedText = JSON.parse(response).responses[0].fullTextAnnotation.text;

    // TEXT PARSING
    let parsedSentences = capturedText.split("\n"); // 1. Break the book into sentences
    let finalText = "";

    // 2. Delete strings that contain "Page", just a number, or "copyright" -- etc
    for (let sentence of parsedSentences) {
        let shouldInclude = !(
            (sentence.toLowerCase().includes("page")) ||
            (sentence.toLowerCase().includes("copyright")) ||
            (sentence.toLowerCase().includes("for use only")) ||
            (sentence.split(" ").length <= 1) ||
            !Number.isNaN(Number(sentence))
        );

        if (shouldInclude) {finalText += (sentence + " ");}
    }

    // REQUEST TO COHERE
    console.log(finalText);
    summarize(finalText);
}


// -- TEXT SUMMARIZING -- //
// Sends the summarized text to coHere
let coHereTryCounter = 0;
function summarize(text) {

    // PROPERTIES, tune these to make the summary better!
    let cohere_props = {
        model: "xlarge",
        prompt: "Summarize this text:\n" + text,
        max_tokens: Math.round(text.split(" ").length*0.5), // Tokens needs to match the number of words
        temperature: 1,
        k: 0, p:1,
        frequency_penalty: 1, //restricts repetition of keys, no restriction set
        presence_penalty: 0, //restricts repetition of keys, no restriction set
        stop_sequences: ["--"], //Breaks apart entries
        return_likelihoods: 'NONE'
    };
    let cohereVersion = "2021-11-08";

    // PREPARE REQUEST
    let cohereReq = new XMLHttpRequest();
    cohereReq.open("POST", cohereUrl);
    cohereReq.setRequestHeader("accept", "application/json");
    cohereReq.setRequestHeader("Cohere-Version", cohereVersion);
    cohereReq.setRequestHeader("content-type", "application/json");
    cohereReq.setRequestHeader("authorization", "Bearer " + COHERE_API_KEY);

    // SEND REQUEST
    cohereReq.onreadystatechange = () => {
        if (cohereReq.readyState == 4) {
            if (cohereReq.status != 200) {
                if (coHereTryCounter <= 5) {
                    setTimeout((text) => {
                        coHereTryCounter++;
                        console.log("CoHere's request didn't work! Trying for the " + coHereTryCounter + "th time");
                        summarize(text);
                    }, 10000);
                } else {
                    alert("CoHere didn't work! Try again...");
                    location.reload();
                }
            } else {
                onResponseFromCohere(cohereReq.responseText);
            }
        }
    }; // Attach the onResponse function

    let paramsAsJSON = JSON.stringify(cohere_props);
    cohereReq.send(paramsAsJSON);
    coHereIsWorking();
}

// Use this to update the UI when cohere is working on the data
function coHereIsWorking() {
    console.log("Waiting on CoHere...");
    submitButton.textContent = "Making it simple...";
}

// ON RESPONSE -- This is called when the summarized text is successfully retrieved
function onResponseFromCohere(response) {
    console.log("Recieved a response from CoHere!");
    console.log("The summarized text: ");
    submitButton.textContent = "Get The Facts!";
    let summarizedText = JSON.parse(response).generations[0].text;
    console.log(summarizedText);

    var newWindow = window.open();

    let htmlSlice = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Your summary from FastFacts</title>
            </head>
            <body>
                <h1>Your summary:</h1>
                <p>${summarizedText.replace("\n", "<br>")}</p>
                <br>
                <br>
                <b><p>If this summary doesn't look right, go back to the previous tab and press "Get The Facts" again!</p></b>
            </body>
            <style>
                * {
                    background-color: black;
                }

                h1, p {
                    color: white;
                    padding: 20px;
                    font-family: sans-serif;
                }
            </style>
        </html>
    `;

    newWindow.document.write(htmlSlice);
}