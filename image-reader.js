// TODO: jpg bug
// KNOWN BUG: DOESN'T WORK WITH JPG FILES
// SOLUTION: RENAME THE JPG TO PNG AND IT WILL WORK
// I HAVE NO IDEA WHY


// -- KEYS and URLS -- //
const API_KEY = "AIzaSyAT1WUId8XUhUnIDBRC2lUAYxdbfAD2J5A"; // API KEY HERE
const googleUrl = "https://vision.googleapis.com/v1/images:annotate?key=" + API_KEY;
const cohereUrl = "https://api.cohere.ai/generate";


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
        if (googleVisionReq.readyState == 4) {onResponseFromGoogle(googleVisionReq.responseText);}
    }; // Attach the onResponse function

    let paramsAsJSON = JSON.stringify(requestParams);
    googleVisionReq.send(paramsAsJSON);
    googleVisionIsWorking();
}

// Use this to update the UI when google is working on the image
function googleVisionIsWorking() {
    console.log("Waiting on google vision...");
}

// HANDLE RESPONSE FROM READ IMAGE
// Parses the text that was read and starts summarization
function onResponseFromGoogle(response) {
    console.log("Got a response from google vision!"); // DEBUG
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
function summarize(text) {
    // PROPERTIES, tune these to make the summary better!
    let cohere_props = {
        model: "xlarge",
        prompt: "Summarize this text:\n" + text,
        max_tokens: Math.round(text.split(" ").length*1.25), // Tokens needs to match the number of words
        temperature: 0.5,
        k: 0, p:1,
        frequency_penalty: 0, //restricts repetition of keys, no restriction set
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
    cohereReq.setRequestHeader("authorization", "Bearer kenKGGv8CbudCkg0xQTakC5LwL4lrcNTALj3quJU");

    // SEND REQUEST
    cohereReq.onreadystatechange = () => {
        if (cohereReq.readyState == 4) {onResponseFromCohere(cohereReq.responseText);}
    }; // Attach the onResponse function

    let paramsAsJSON = JSON.stringify(cohere_props);
    cohereReq.send(paramsAsJSON);
    coHereIsWorking();
    console.log(cohere_props);
}

// Use this to update the UI when cohere is working on the data
function coHereIsWorking() {
    console.log("Waiting on cohere...");
}

// ON RESPONSE -- This is called when the summarized text is successfully retrieved
function onResponseFromCohere(response) {
    console.log("Recieved a response from cohere!");
    console.log("The summarized text: ");
    let summarizedText = JSON.parse(response).generations[0].text;
    console.log(summarizedText);
}