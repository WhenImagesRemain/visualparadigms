/*

CHANGE BLINDNESS

INPUT: IMAGE PAIR, TARGET
OUTPUT: REACTION TIME, HIT/DISTANCE FROM TARGET

HOW TO USE:
0. Photoshop your image(s) to create differences.
1. In PROJECT_ID, write the name of the sheet you want to save the data to, preferrably as: "studentID_changeBlindness"
2. Upload all your (edited and unedited) images to the images folder.
3. Write the file names for the unedited images in "prenames" and for the edited ones in "postnames"
4. Change setupMode to true.
5. Run the sketch, marking the areas where you made a change. (should be the only ones shown in white)
6. Copy the coordinates into targetCoords in the code.
7. Change setupMode back to false.
> Click File>Share and send the "Fullscreen" link to your participants.

*/

// !! Change this to you own project's name in order to save your experiments data.
// This Id should consist of your student number followed by the project name
const PROJECT_ID = "<student_id>_changeBlindness"


// Place the course secret here
const SAVING_SECRET = "ID4230_VCD"

// If you want your your data to be stored online set this to true.
const SAVE_TO_SERVER = true

// The data manager allows to save data to the server or you local machine. It can also load data from the server
const dataManager = new DataManager(SAVING_SECRET, PROJECT_ID, SAVE_TO_SERVER)

// write the filenames of your unedited images as strings
const prenames = [
  "0_pre.png",
  "1_pre.png",
  "2_pre.png",
  "3_pre.png",
  "4_pre.png",
  "5_pre.jpg"
];
// write the filenames of your edited images as strings
// make sure they both are in the same order so that prenames[n] corresponds with postnames[n]
const postnames = [
  "0_post.png",
  "1_post.png",
  "2_post.png",
  "3_post.png",
  "4_post.png",
  "5_post.jpg"
];

// set this to true to open the sketch in setup mode
const setupMode = false;

// copy the coordinates from setup mode here
const targetCoords = [[194, 67, 55, 49],[272, 372, 106, 95],[186, 175, 50, 43],[392, 56, 84, 57],[292, 402, 68, 62],[175, 311, 63, 38]];

// set this to false to show images in the order of filenames
const randomOrder = true;

// ************* END OF PARAMETERS *************



//setup mode variables
let selecting = false;
let selectionCount = 0;
let targetSelection = [];
let res;
let setupText =
  "Press Enter to go to the next image <br> Copy the following into the code: <br>";
let targetsText = "[]";

//experiment variables
var stimuli = [];
let presentationOrder = [];
var trial = 0;
let randomtrial;
var max_height = 0;
var max_width = 0;
var image_offset = 50;
var stimulus;
let startTime;
var experiment = false;

function preload() {
  // create a table to store results
  data = new p5.Table();
  data.columns = ["target", "reaction time (ms)", "hit/distance", "x", "y"];

  for (let i = 0; i < prenames.length; i++) {
    stimuli.push([
      loadImage("images/" + prenames[i]),
      loadImage("images/" + postnames[i]),
    ]);
    presentationOrder[i] = i;
  }

  if (randomOrder) {
    presentationOrder = shuffle(presentationOrder);
  }
}

function setup() {
  // determine which image has the biggest width/height
  for (let i = 0; i < stimuli.length; i++) {
    pair = stimuli[i];
    if (max(pair[0].width, pair[1].width) > max_width) {
      max_width = max(pair[0].width, pair[1].width);
    }
    if (max(pair[0].height, pair[1].height) > max_height) {
      max_height = max(pair[0].height, pair[1].height);
    }
  }
  // create canvas equal to the largest image, plus a little extra space for text
  cnv = createCanvas(max_width, max_height + image_offset);

  if (setupMode) {
    res = select("#setuptext");
    res.html(setupText);

    cnv.mousePressed(startSelect);
    cnv.mouseReleased(endSelect);
    cnv.parent("sketch");
    document
      .getElementById("sketch")
      .setAttribute("style", "height:" + cnv.height + "px");
  } else {
    cnv.mouseClicked(clickOnCanvas);

    background(255);
    textSize(16);
    text("Try to spot the difference", 30, 30);
    text("Click to start the task", 30, 50);
    frameRate(10);
  }
}

function draw() {
  //this code is to draw the rectangles
  if (setupMode) {
    background(255);

    // Show the difference between the two images
    image(stimuli[selectionCount][0], 0, 50);
    blendMode(DIFFERENCE);
    image(stimuli[selectionCount][1], 0, 50);
    filter(THRESHOLD, 0.1);
    blendMode(NORMAL);

    strokeWeight(1);

    if (selecting) {
      let xs, ys, ws, hs;
      rectfill = color(0, 200, 200);
      rectfill.setAlpha(100);
      fill(rectfill);
      stroke(0, 255, 255);

      if (mouseX > targetSelection[selectionCount][0]) {
        xs = targetSelection[selectionCount][0];
        ws = mouseX - xs;
      } else {
        xs = mouseX;
        ws = targetSelection[selectionCount][0] - xs;
      }
      if (mouseY > targetSelection[selectionCount][1]) {
        ys = targetSelection[selectionCount][1];
        hs = mouseY - ys;
      } else {
        ys = mouseY;
        hs = targetSelection[selectionCount][1] - ys;
      }

      rect(xs, ys, ws, hs);
    }
  }

  if (experiment) {
    text("Click where you see the change.", 30, 30);
    randomtrial = presentationOrder[trial];

    stimulus = stimuli[randomtrial];

    if (frameCount < 5) {
      // we show the first image at frame 1,2,3,4
      image(stimulus[0], 0, 50);
    } else if ((frameCount > 5) & (frameCount < 10)) {
      // second image @ 6,7,8,9
      image(stimulus[1], 0, 50);
    } else {
      // we show the background at frame 5 and 10
      background(128);
    }

    if (frameCount == 10) {
      frameCount = 0;
    }
  } else if (trial == stimuli.length) {
    background(255);
    text("That's the end of the experiment!", 30, 30);
    if (!dataManager.completionStatus) {
      text("Sending data...", 30, 50);
    } else {
      text("Data sent!", 30, 50);
    }
  }
}

function clickOnCanvas() {
  if (experiment) {
    // check accuracy
    let randomtrial = presentationOrder[trial]; //i really dont like this
    let d;
    if (
      mouseX >= targetCoords[randomtrial][0] &&
      mouseX <= targetCoords[randomtrial][0] + targetCoords[randomtrial][2] &&
      mouseY >= targetCoords[randomtrial][1] &&
      mouseY <= targetCoords[randomtrial][1] + targetCoords[randomtrial][3]
    ) {
      d = 0;
    } else {
      var dx = Math.max(
        targetCoords[randomtrial][0] - mouseX,
        0,
        mouseX - (targetCoords[randomtrial][0] + targetCoords[randomtrial][2])
      );
      var dy = Math.max(
        targetCoords[randomtrial][1] - mouseY,
        0,
        mouseY - (targetCoords[randomtrial][1] + targetCoords[randomtrial][3])
      );
      d = sqrt(dx * dx + dy * dy);
    }

    //write result to table
    let newRow = data.addRow();
    newRow.setNum("target", presentationOrder[trial]);
    newRow.setNum("reaction time (ms)", millis() - startTime);
    newRow.setNum("hit/distance", int(d));
    newRow.setNum("x", int(mouseX));
    newRow.setNum("y", int(mouseY));

    nextTrial();
  } else if (trial < stimuli.length) {
    // first time, after that ignore
    frameCount = 0;
    experiment = true;
    console.log("experiment start");
    background(128);
    startTime = millis();
  }
}

//called when mouse is pressed in setup mode
function startSelect() {
  targetSelection.push([mouseX, mouseY]);
  selecting = true;
}

//called when mouse is released in setup mode
function endSelect() {
  //sort numbers so they're in "x,y,w,h" format
  let xs, ys, ws, hs;
  if (mouseX > targetSelection[selectionCount][0]) {
    xs = targetSelection[selectionCount][0];
    ws = mouseX - xs;
  } else {
    xs = mouseX;
    ws = targetSelection[selectionCount][0] - xs;
  }
  if (mouseY > targetSelection[selectionCount][1]) {
    ys = targetSelection[selectionCount][1];
    hs = mouseY - ys;
  } else {
    ys = mouseY;
    hs = targetSelection[selectionCount][1] - ys;
  }

  targetSelection[selectionCount] = [int(xs), int(ys), int(ws), int(hs)];

  for (i = 0; i < targetSelection.length; i++) {
    if (i == 0) {
      targetsText = "[[" + targetSelection[i] + "]";
    } else {
      targetsText += ", [" + targetSelection[i] + "]";
    }
  }
  targetsText += "]";

  res.html(setupText + targetsText);

  selecting = false;
  selectionCount++;
  print(targetSelection);
}

function nextTrial() {
  // start the next trial
  trial++;
  frameCount = 0;
  background(128);

  if (trial == stimuli.length) {
    experiment = false; // experiment has ended
    console.log("experiment end");
    
    // Sends the p5 table to the server
    dataManager.saveP5Table(data);
  }
}
