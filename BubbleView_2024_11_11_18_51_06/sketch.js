/*

BUBBLE VIEW

INPUT: IMAGE, PROMPT
OUTPUT: VIEWING COORDINATES, PROMPT RESPONSE

HOW TO USE:
1. In PROJECT_ID, write the name of the sheet you want to save the data to, preferrably as: "studentID_bubbleView"
2. Upload your image(s) to the images folder.
3. Write the names of the images in filenames.
4. Write a prompt for the participant to answer and to give them a goal in viewing the image
OR do not write a prompt and set freelook to true.
> Click File>Share and send the "Fullscreen" link to your participants

*/

// !! Change this to you own project's name in order to save your experiments data.
// This Id should consist of your student number followed by the project name
const PROJECT_ID = "<student_id>_bubbleView"


// Place the course secret here
const SAVING_SECRET = "ID4230_VCD"

// If you want your your data to be stored online set this to true.
const SAVE_TO_SERVER = true

// The data manager allows to save data to the server or you local machine. It can also load data from the server
const dataManager = new DataManager(SAVING_SECRET, PROJECT_ID, SAVE_TO_SERVER)

// write the filenames of your images as strings
const filenames = [
  "sanmarco.jpg", 
  "vatican.jpg"
];

// Here you can change the prompt the user gets in the text box.
// If you want specific ones for each image, write them in the array in the same order as filenames
const prompt = ["Describe the scene..."];

// Set this to false to remove the text input
const freelook = false;

// radius of the aperture
let radius = [50];

// set this to false to show images in the order of filenames
const randomOrder = true;

// ************* END OF PARAMETERS *************



let blurims = [],
  sharpims = [];
let presentationOrder = [];
let aperture, currad;
let mwidth, mheight;

let trial = 0,
  imgtrial = 0;

let data, data2;

let max_width = 0,
  max_height = 0;
let imgscale;
let sub;

let clicked = false,
  done = false;

function preload() {
  for (i = 0; i < filenames.length; i++) {
    sharpims.push(loadImage("images/" + filenames[i]));
    blurims.push(loadImage("images/" + filenames[i]));
  }
}

function setup() {
  // determine which image has the biggest width/height
  for (i = 0; i < sharpims.length; i++) {
    presentationOrder[i] = i;
    blurims[i].filter(BLUR, 10);

    if (sharpims[i].width > max_width) {
      max_width = sharpims[i].width;
    }
    if (sharpims[i].height > max_height) {
      max_height = sharpims[i].height;
    }
  }

  if (randomOrder) {
    shuffle(presentationOrder, true);
  }

  //use the image size for the canvas, so mind that your images are the right size
  cnv = createCanvas(max_width, max_height);
  cnv.parent("sketch");
  document
    .getElementById("sketch")
    .setAttribute("style", "height:" + max_height + "px");
  cnv.mouseClicked(clickOnCanvas);

  setApertureAndPrompt();

  noCursor();

  sub = createButton("Submit").mousePressed(submit);
  if (freelook) {
    sub.position(0, cnv.height);
  } else {
    sub.position(0, cnv.height + 100);
  }

  data = new p5.Table();
  data.columns = ["image", "x", "y", "r"];
  for (i = 0; i < filenames.length; i++) {
    data.addColumn(filenames[i]);
    data.addColumn(sharpims[i].width);
    data.addColumn(sharpims[i].height);
    data.addColumn("answer");
  }
}

function draw() {
  background(0);
  imageMode(CORNER);
  image(blurims[presentationOrder[imgtrial]], 0, 0);
  imageMode(CENTER);

  if (clicked) {
    image(aperture, data.getNum(trial - 1, "x"), data.getNum(trial - 1, "y"));
  }

  noFill();
  stroke(255, 0, 0);
  circle(mouseX, mouseY, 2 * currad);

  if (done) {
    textSize(16);
    noStroke();
    fill(0);
    cursor(ARROW);
    background(255);
    text("Experiment over!", 30, 60);
    if (!dataManager.completionStatus) {
      text("Sending data...", 30, 90);
    } else {
      text("Data sent!", 30, 90);
    }
  }
}

function setApertureAndPrompt() {
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

  currad = radius[presentationOrder[imgtrial]];
  if (currad) {
    aperture = createImage(2 * currad, 2 * currad);
  } else {
    aperture = createImage(2 * radius[0], 2 * radius[0]);
    currad = radius[0];
  }
}

function clickOnCanvas() {
  if (!done) {
    trial++;

    sharpims[presentationOrder[imgtrial]].loadPixels();
    aperture.loadPixels();
    let c;

    for (let i = 0; i < aperture.width; i++) {
      for (let j = 0; j < aperture.height; j++) {
        if (
          dist(i, j, aperture.width / 2, aperture.height / 2) <
          aperture.width / 2
        ) {
          c = sharpims[presentationOrder[imgtrial]].get(
            mouseX + i - aperture.width / 2,
            mouseY + j - aperture.height / 2
          );
          aperture.set(i, j, c);
        } else {
          aperture.set(i, j, color(0, 0, 0, 0));
        }
      }
    }
    aperture.updatePixels();

    let newRow = data.addRow();
    newRow.setString("image", filenames[presentationOrder[imgtrial]]);
    newRow.setNum("x", int(mouseX));
    newRow.setNum("y", int(mouseY));
    newRow.setNum("r", currad);

    if (clicked) {
      clicked = true;
    } else {
      clicked = true;
    }
  }
}

function submit() {
  clicked = false;
  if (!freelook) {
    data.columns[7 + presentationOrder[imgtrial] * 4] = document.getElementById(
      "input"
    ).value;
    document.getElementById("input").value = "";
  }
  // document.getElementById("input").placeholder = 'New placeholder...';

  if (imgtrial + 1 == filenames.length) {
    done = true;
    if(!freelook){
      document.getElementById("input").remove();
    }
    sub.remove();        
    
    // Sends the p5 table to the server
    dataManager.saveP5Table(data)
    
  } else {
    imgtrial++;
    setApertureAndPrompt();
  }
}
