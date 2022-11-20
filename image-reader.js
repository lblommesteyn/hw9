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
            (sentence.toLowerCase().includes("page")) || // Page number sentences
            (sentence.toLowerCase().includes("copyright")) || // Since some textbooks put copyrigts on each page
            (sentence.toLowerCase().includes("for use only")) || // More copyright things
            (sentence.split(" ").length <= 1) // Empties
        );

        if (shouldInclude) {
            // Strip brackets and other special characters
            finalText += (sentence.replace(/[^a-zA-Z ]/g, "") + " ");
        }
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
        model: "xlarge-20221108",
        prompt: "Summarize this text: When you graduate, you might decide to start your own business. If you do, you may choose to set up a proprietorship. A proprietorship is a business owned by one person, known as a proprietor. It is often called a “sole” proprietorship because there is a single owner. The proprietorship form of business organization is simple to set up and gives the owner control over the business. In most cases, only a relatively small amount of money (capital) is needed to start in business as a proprietorship. The owner receives any income, suffers any losses, and is personally liable (responsible) for all debts of the business. This is known as unlimited liability. There is no legal distinction between the business as an economic unit and the owner. Accordingly, the life of the proprietorship is limited to the life of the owner. The business income is reported as self-employment income and taxed on the owner’s personal income tax return. However, for accounting purposes, the business records of the proprietorship must be kept separate from those related to the owner’s personal activities. The separation of business and personal records is known in its simplest form as the reporting entity concept. The reporting entity concept requires that the economic activity that can be identified with a particular business be kept separate and distinct from the personal or non-business activities of the owner and of all other economic entities. The objective of the reporting entity concept is to ensure that the entity’s financial statements faithfully represent only its economic activities. This concept applies not only to proprietorships, but also to partnerships and corporations, which are discussed in the next sections. Small service businesses such as hair salons, plumbers, and mechanics are often proprietorships, as are many small-scale farms and small retail stores.\n\nSummary: A proprietorship is a businessed owned by one person. It is seimple to set up and gives the owner control over the business. A small amount of money is needed to start. The owner receives all income, losses, and is liable for all debts. This is unlimited liability. The businesses and the owner have no legal distinction. The life of the business is limited to the life of the owner. Business income is reported as personal income. The business records must be seperate from the owner\'s records. The reporting entity concept requires economic activity of a business be kept separate from personal activities. Small service businesses are usually proprietorships. \n--\nSummarize this text:\nAnother possibility after graduating would be for you to join forces with other individuals to form a partnership. A partnership is a business owned by more than one person. In most respects, a partnership is similar to a proprietorship except that there is more than one owner. Partnerships are often formed because one person does not have enough economic resources to start or expand the business, or because partners bring unique skills or other resources to the partnership.Partnerships are normally formalized in a written partnership agreement that outlines the formation of the partnership, partners’ contributions, how net income and losses are shared, provisions for withdrawals of assets and/or partners, dispute resolution, and partnership liquidation. The need to develop a partnership agreement makes establishing a partnership more complex and costly than establishing a proprietorship. Although there are advantages to working with others, there are also disadvantages. Each partner generally has unlimited liability for all debts of the partnership, even if one of the other partners created the debt. However, there are certain situations where partnerships can be formed with limited liability for selected partners.Similar to a proprietorship, the income of the partnership is reported as self-employment income and taxed on each partner’s personal income tax return. In addition, the reporting entity concept requires that partnership records be kept separate from each partner’s personal activities.Partnerships are typically used to organize professional service businesses, such as the practices of lawyers, doctors, architects, engineers, and accountants.\n\nSummary: A partnership is a business owned by multiple owners. They are formed when one person does not have enough economic resources or a partner brings unique skills to the partnership. Partnerships are formalized in written partnership agreements that outline formation, contributions, how net incomee and losses are shared, how to withdraw assets or partners, dispute resolution, and liquidation. Partnerships are more complex and costly than proprietoships. Each partner generally has unlimited liability. Partnerships may be formed with limited liability. Income is reported as self-employment income. The reporting entity concept requires partnership records be seperate from partner personal activities. Professional service businesses are typically partnerships.\n--\nSummarize this text: " + text+"\n;Summary: ",
        max_tokens: 250, // Math.round(text.split(" ").length*1.2), // Tokens needs to match the number of words
        temperature: 0.7,
        k:3, p:0.2,
        frequency_penalty: 1, //restricts repetition of keys, no restriction set
        presence_penalty: 0, //restricts repetition of keys, no restriction set
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
