/*

CODE CHARTS

INPUT: IMAGE
OUTPUT: VIEWING COORDINATES

HOW TO USE:
1. In PROJECT_ID, write the name of the sheet you want to save the data to, preferrably as: "studentID_codeCharts"
2. Upload your image(s) to the images folder.
3. Write the names of the images in filenames.
> Click File>Share and send the "Fullscreen" link to your participants

*/

// !! Change this to you own project's name in order to save your experiments data.
// This Id should consist of your student number followed by the project name
const PROJECT_ID = "<student_id>_codeCharts"


// Place the course secret here
const SAVING_SECRET = "ID4230_VCD"

// If you want your your data to be stored online set this to true.
const SAVE_TO_SERVER = true

// The data manager allows to save data to the server or you local machine. It can also load data from the server
const dataManager = new DataManager(SAVING_SECRET, PROJECT_ID, SAVE_TO_SERVER)


// write the filenames of your images as strings
const filenames = [
  "sisyphusmedium.jpg",
  "yamamedium.jpg",
  "sisyphusmedium.jpg"
];

//Here you can set the spacing, size and deviation of the codes.
const codemargin = 35;
const codesize = 13;

// how much the codes' positions can deviate, at 0.0 codes are shown in a square grid
const deviation = 0.5; 

// Here you can set how long each phase takes in seconds
const countdownTime = 3.0;
const imageTime = countdownTime + 1.0;
const codechartTime = imageTime + 0.8;

// set this to true to show images in random order
const randomOrder = false;

// ************* END OF PARAMETERS *************



let codeArray = [];
// array of [code, x, y]
let codeChart = [];

// Here you can change the instructions
const explanations = [
  "Look attentively at the image that will appear", 
  "You will see an image for a couple of seconds",
  "followed by a chart of codes,",
  "each code consists of a letter and two digits (e.g. A23)", 
  "You will be asked to write down the last code you saw.", 
  "Please click the button below to start."];

const debrief1 = "Which code did you read?";
const debrief2 = "Type in the code you remember below";

const codeSuccess = "Thank you!";
const codeFail = "Couldn't find that code, please try again or skip if you missed it.";
const submittingText = "Sending data...";
const submittedText = "Data sent.";

let max_width = 0,
  max_height = 0;
let images = [];
let imgmargin = 0;
let textmargin = 15;
let readyBoolean = false,
  finalBoolean = true,
  found = false,
  notfound = false;
submitted = false;
let submitButton, inputBox;
let time = 0;
let on = false;
let startTime = 0;
let trial = 0;
let presentationOrder = [];

function preload() {
  // load images
  for (i = 0; i < filenames.length; i++) {
    images.push(loadImage("images/" + filenames[i]));
    presentationOrder[i] = i;
  }
  if (randomOrder) {
    shuffle(presentationOrder, true);
  }

  //generate codes
  for (i = 0; i < 26; i++) {
    for (j = 0; j < 100; j++) {
      if (j < 10) {
        codeArray.push(String.fromCharCode(65 + i) + "0" + j);
      } else {
        codeArray.push(String.fromCharCode(65 + i) + j);
      }
    }
  }
}

function setup() {
  // determine which image has the biggest width/height
  for (i = 0; i < images.length; i++) {
    if (images[i].width > max_width) {
      max_width = images[i].width;
    }
    if (images[i].height > max_height) {
      max_height = images[i].height;
    }
  }
  //use the image size for the canvas, so mind that your images are the right size!
  cnv = createCanvas(max_width, max_height);

  data = new p5.Table();
  data.columns = ["image", "x", "y"];

  // store image dimensions in the header to be used by the heatmap generator
  for (i = 0; i < filenames.length; i++) {
    data.columns.push(filenames[i], images[i].width, images[i].height);
  }

  //check how many codes there should be
  const gridx = int(width / codemargin);
  const gridy = int(height / codemargin);

  //generate an array with all the codes and their coordinates
  for (i = 0; i < gridy; i++) {
    for (j = 0; j < gridx; j++) {
      codeChart.push([
        codeArray.splice(floor(random() * codeArray.length), 1)[0],
        codemargin / 2 +
          j * codemargin +
          floor(
            random() * codemargin * deviation - codemargin * (deviation / 2)
          ),
        codemargin / 2 +
          i * codemargin +
          floor(random() * codemargin * deviation) -
          codemargin * (deviation / 2),
      ]);
    }
  }

  startButton = createButton("Start").mousePressed(startCountdown);
  startButton.position(textmargin, 210);
}

function draw() {
  background(255, 255, 255);
  textStyle(NORMAL);

  if (on) {
    time = millis() - startTime;
  }

  // Phase 1: show explanation
  if (on == false) {
    textSize(20);
    text(explanations[0], textmargin, 60);

    textSize(16);
    for(i=1;i<explanations.length;i++){
      text(explanations[i], textmargin, 90 + 20*i);
    }
  }

  // Phase 2: show countdown
  if (on && time < countdownTime * 1000) {
    textSize(200);
    text(
      countdownTime - Math.floor(time / 1000),
      width / 2 - 100,
      textmargin + 250
    );
  }

  // Phase 3: show image
  else if (on && time < imageTime * 1000) {
    background(0);
    image(images[presentationOrder[trial]], imgmargin, imgmargin);
  }

  // Phase 4: show chart
  else if (on && time < codechartTime * 1000) {
    // image(num, imgmargin, imgmargin, imw, imh);

    background(0);
    fill(150);
    textSize(codesize);
    for (i = 0; i < codeChart.length; i++) {
      text(codeChart[i][0], codeChart[i][1], codeChart[i][2]);
    }
  }

  // Phase 5: data collection
  else if (on && time >= codechartTime * 1000) {
    if (finalBoolean) {
      inputBox = createInput();
      inputBox.position(textmargin, 100);
      submitButton = createButton("Submit").mousePressed(submitCode);
      submitButton.position(textmargin + inputBox.width + 5, 100);
      finalBoolean = false;
    }
    fill(0);
    textSize(20);
    text(debrief1, textmargin, textmargin + 50);

    textSize(13);
    text(debrief2, textmargin, textmargin + 70);

    if (found) {
      text(codeSuccess, textmargin, 150);
    } else if (notfound) {
      text(codeFail, textmargin, 150);
    }

    if (submitted && !dataManager.completionStatus) {
      text(submittingText, textmargin, 170);
    }
    if (submitted && dataManager.completionStatus) {
      text(submittedText, textmargin, 170);
    }
  }
}

function startCountdown() {
  startButton.remove();
  on = true;
  startTime = millis();
}

function submitCode() {
  for (i = 0; i < codeChart.length; i++) {
    if (codeChart[i][0] == inputBox.value().toUpperCase()) {
      let newRow = data.addRow();
      newRow.setString("image", filenames[presentationOrder[trial]]);
      newRow.setNum("x", codeChart[i][1]);
      newRow.setNum("y", codeChart[i][2]);
      found = true;
      submitButton.remove();
    }
  }
  notfound = true;
  try {
    nextButton.remove();
  } catch {}
  nextButton = createButton("Continue").mousePressed(nextImage);
  nextButton.position(textmargin, 170);
}

function nextImage() {
  if (!found) {
    let newRow = data.addRow();
    newRow.setString("image", filenames[presentationOrder[trial]]);
    newRow.setString("x", "N/A");
    newRow.setString("y", "N/A");
  }
  if (trial + 1 < images.length) {
    inputBox.remove();
    submitButton.remove();
    nextButton.remove();
    finalBoolean = true;
    found = false;
    notfound = false;
    startTime = millis();
    trial++;
  } else {
    inputBox.remove();
    submitButton.remove();
    nextButton.remove();
    submitted = true;

    // Sends the p5 table to the server
    dataManager.saveP5Table(data)
    
  }
}
