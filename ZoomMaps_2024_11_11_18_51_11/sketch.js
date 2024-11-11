/*

ZOOM MAPS

INPUT: IMAGE, PROMPT
OUTPUT: VIEWING COORDINATES, PROMPT RESPONSE

HOW TO USE:
1. In PROJECT_ID, write the name of the sheet you want to save the data to, preferrably as: "studentID_zoomMaps"
2. Upload your image(s) to the images folder.
3. Write the names of the images in filenames.
4. Write a prompt for the participant to answer and to give them a goal in viewing the image
OR do not write a prompt and set freelook to true.
> Click File>Share and send the "Fullscreen" link to your participants

*/

// !! Change this to you own project's name in order to save your experiments data.
// This Id should consist of your student number followed by the project name
const PROJECT_ID = "<student_id>_zoomMaps"


// Place the course secret here
const SAVING_SECRET = "ID4230_VCD"

// If you want your your data to be stored online set this to true.
const SAVE_TO_SERVER = true

// The data manager allows to save data to the server or you local machine. It can also load data from the server
const dataManager = new DataManager(SAVING_SECRET, PROJECT_ID, SAVE_TO_SERVER)

// write the filenames of your images as strings
const filenames = [
  "sisyphus.jpg",
  "yama.jpg"
];

// Here you can change the prompt the user gets in the text box.
// If you want specific ones for each image, write them in the array in the same order as filenames
const prompt = ["Describe the scene..."];

// Set this to false to remove the text input
const freelook = false;

// set the width and height of the viewing window
const canvasW = 400;
const canvasH = 400;

// set this to false to show images in the order of filenames
const randomOrder = true;

// ************* END OF PARAMETERS *************



let presentationOrder = [];
let imgtrial = 0;
let curimg;

const canvasRat = canvasW / canvasH;

let imgW, imgH, imgRat;
let images = [];
let i;

let imgX = 0;
let imgY = 0;
let zooomlvl = 1;
let orgzoomlvl;

let data;
let sub;
let readmove = false;
let done = false;

function preload() {
  for (i = 0; i < filenames.length; i++) {
    images.push(loadImage("images/" + filenames[i]));
    presentationOrder[i] = i;
  }

  if (randomOrder) {
    shuffle(presentationOrder, true);
  }
}

function setup() {
  cnv = createCanvas(canvasW, canvasH);
  cnv.mouseWheel(zoom);
  cnv.parent("sketch");

  document
    .getElementById("sketch")
    .setAttribute("style", "height:" + canvasH + "px");

  data = new p5.Table();
  data.columns = ["image", "timestamp", "x", "y", "zoomlvl", canvasW, canvasH];

  for (i = 0; i < filenames.length; i++) {
    data.columns.push(
      filenames[i],
      images[i].width,
      images[i].height,
      "answer"
    );
  }

  sub = createButton("Submit").mousePressed(submit);
  if (freelook) {
    sub.position(0, cnv.height);
  } else {
    sub.position(0, cnv.height + 100);
  }

  setImageAndPrompt();
}

function draw() {
  background(0);

  if (readmove && (mouseX != pmouseX || mouseY != pmouseY)) {
    imgX += mouseX - pmouseX;
    imgY += mouseY - pmouseY;

    writeRow();
  }

  image(curimg, imgX, imgY, curimg.width * zoomlvl, curimg.height * zoomlvl);

  if (done) {
    background(255);
    textSize(16);
    text("Experiment done!", 30, 60);
    if (!dataManager.completionStatus) {
      text("Sending data...", 30, 90);
    } else {
      text("Data sent!", 30, 90);
    }
  }
}

function mousePressed() {
  readmove = true;
}

function mouseReleased() {
  readmove = false;
}

function zoom(event) {
  if (event.deltaY < 0) {
    //adjust position
    imgX -= ((mouseX - imgX) / (curimg.width * zoomlvl)) * (curimg.width * 0.1);
    imgY -=
      ((mouseY - imgY) / (curimg.height * zoomlvl)) * (curimg.height * 0.1);

    // zoom in: increase image scale
    zoomlvl += 0.1;
  }

  if (event.deltaY > 0 && zoomlvl > orgzoomlvl) {
    // adjust position
    imgX += ((mouseX - imgX) / (curimg.width * zoomlvl)) * (curimg.width * 0.1);
    imgY +=
      ((mouseY - imgY) / (curimg.height * zoomlvl)) * (curimg.height * 0.1);

    // zoom out: decrease image scale
    zoomlvl -= 0.1;
  }

  writeRow();
}

function writeRow() {
  let newRow = data.addRow();
  newRow.setString("image", filenames[presentationOrder[imgtrial]]);
  newRow.setNum("timestamp", millis());
  newRow.setNum("x", -imgX / zoomlvl);
  newRow.setNum("y", -imgY / zoomlvl);
  newRow.setNum("zoomlvl", 1 / zoomlvl);
}

function submit() {
  if (!freelook) {
    data.columns[10 + presentationOrder[imgtrial] * 4] = document.getElementById(
      "input"
    ).value;
    document.getElementById("input").value = "";
  }

  if (imgtrial + 1 == filenames.length) {
    done = true;
    sub.remove();

    // adds a timestamp to evaluate the time spent in the final view
    let newRow = data.addRow();
    newRow.setNum("timestamp", millis());
    
    // Sends the p5 table to the server
    dataManager.saveP5Table(data)
    
  } else {
    imgtrial++;
    setImageAndPrompt();
  }
}

function setImageAndPrompt() {
  if (!freelook) {
    if (prompt[presentationOrder[imgtrial]]) {
      document.getElementById("input").placeholder =
        prompt[presentationOrder[imgtrial]];
    } else {
      document.getElementById("input").placeholder = prompt[0];
    }
  } else if (document.getElementById("input")) {
    document.getElementById("input").remove();
  }

  curimg = images[presentationOrder[imgtrial]];
  if (curimg.width / curimg.height > canvasRat) {
    zoomlvl = canvasW / curimg.width;
    orgzoomlvl = zoomlvl;
  } else {
    zoomlvl = canvasH / curimg.height;
    orgzoomlvl = zoomlvl;
  }
  imgX = 0;
  imgY = 0;
}
