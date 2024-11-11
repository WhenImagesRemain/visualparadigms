/*

IMPORTANNOTS PARADIGM

INPUT: IMAGE
OUTPUT: ANNOTATED AREAS

HOW TO USE:
1. In PROJECT_ID, write the name of the sheet you want to save the data to, preferrably as: "studentID_importAnnots"
2. Upload your image(s) to the images folder.
3. Write the names of the images in filenames.
> Click File>Share and send the "Fullscreen" link to your participants

*/

// !! Change this to you own project's name in order to save your experiments data.
// This Id should consist of your student number followed by the project name
const PROJECT_ID = "<student_id>_importAnnots"


// Place the course secret here
const SAVING_SECRET = "ID4230_VCD"

// If you want your your data to be stored online set this to true.
const SAVE_TO_SERVER = true

// The data manager allows to save data to the server or you local machine. It can also load data from the server
const dataManager = new DataManager(SAVING_SECRET, PROJECT_ID, SAVE_TO_SERVER)

// write the filenames of your images as strings
const filenames = [
  "ajaxmadrid.jpg", 
  "vatican.jpg"
];

// here you can write instructions for the user. Change to '' to remove.
const instruction = ["Mark the objects that stand out most to you by holding and dragging the mouse."];

// Here you can set the distance between lasso points in pixels.
const distanceBetweenLassoPoints = 5;

// here you can set the colors of the annotations in RGBA
const strokecolor = "rgba(71, 84, 248, 1.0)";
const fillcolor = "rgba(124, 242, 207, 0.44)";
const strokeselectcolor = "rgba(255, 0, 80, 1.0)";
const fillselectcolor = "rgba(255, 0, 225, 0.44)";

// set this to false to show images in the order of filenames
const randomOrder = true;

// ************* END OF PARAMETERS *************



let annotation;
let currentPoint;
let sub;
let presentationOrder = [],
  images = [];
let drawing = false,
  done = false;

// Used to store image data
let inputImage, imw, imh;
let trial = 0,
  imgtrial = 0;

function preload() {
  for (i = 0; i < filenames.length; i++) {
    images.push(loadImage("images/" + filenames[i]));
    presentationOrder.push(i);
  }
  if (randomOrder) {
    shuffle(presentationOrder, true);
  }
}

function setup() {
  // determine which image has the biggest width/height
  let max_width = 0,
    max_height = 0;
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
  cnv.mousePressed(pressOnCanvas);
  cnv.parent("sketch");
  document
    .getElementById("sketch")
    .setAttribute("style", "height:" + cnv.height + "px");

  res = select("#setuptext");
  if (instruction[presentationOrder[imgtrial]]) {
    res.html(instruction[presentationOrder[imgtrial]]);
  } else {
    res.html(instruction[0]);
  }

  sub = createButton("Submit").mousePressed(submit);

  data = new p5.Table();
  data.columns = ["image", "annot", "x", "y"];

  // store image dimensions in the header to be used by the visualizer
  for (i = 0; i < filenames.length; i++) {
    data.columns.push(filenames[i], images[i].width, images[i].height);
  }
}

function draw() {
  // Clear background
  background(0);
  // Draw the image
  image(images[presentationOrder[imgtrial]], 0, 0);

  for (i = 0; i <= trial; i++) {
    // set annotation border color
    stroke(strokecolor);
    // set annotation fill color
    fill(fillcolor);

    if (i == trial) {
      // set annotation border color
      stroke(strokeselectcolor);
      // set annotation fill color
      fill(fillselectcolor);
    }

    // Start the shape area
    beginShape();

    // for all the points draw a point on the canvas
    for (j = 1; j < data.rows.length; j++) {
      if (
        data.getString(j, "image") == filenames[presentationOrder[imgtrial]] &&
        data.getNum(j, "annot") == i
      ) {
        vertex(data.getNum(j, "x"), data.getNum(j, "y"));
      }
    }

    // Add the current point
    if (j == trial && currentPoint) {
      vertex(currentPoint.x, currentPoint.y);
    }

    // Close the shape
    endShape(CLOSE);
  }

  if (done) {
    background(255);
    noStroke();
    fill(0);
    textSize(16);
    text("Experiment over!", 30, 60);
    if (!dataManager.completionStatus) {
      text("Sending data...", 30, 90);
    } else {
      text("Data sent!", 30, 90);
    }
  }
}

function pressOnCanvas() {
  if (!done) {
    createPoint();
    drawing = true;
  }
}

function mouseDragged() {
  if (drawing) {
    // Check the previous point
    const previousPoint = createVector(
      data.getNum(data.rows.length - 1, "x"),
      data.getNum(data.rows.length - 1, "y")
    );

    // If we moved the the cursor at least X amount of pixels then add a new point
    currentPoint = createVector(mouseX, mouseY);

    if (previousPoint.dist(currentPoint) >= distanceBetweenLassoPoints) {
      createPoint();
      currentPoint = null;
    }
  }
}

function mouseReleased() {
  if (drawing) {
    trial++;
    drawing = false;
  }
}

function createPoint() {
  //STORE DATA!!
  let newRow = data.addRow();
  newRow.setString("image", filenames[presentationOrder[imgtrial]]);
  newRow.setNum("annot", trial);
  newRow.setNum("x", mouseX);
  newRow.setNum("y", mouseY);
}

function submit() {
  if (imgtrial + 1 == filenames.length) {
    done = true;
    res.html("");
    sub.remove();

    // Sends the p5 table to the server
    dataManager.saveP5Table(data)
    
  } else {
    imgtrial++;
    trial = 0;
    if (instruction[presentationOrder[imgtrial]]) {
      res.html(instruction[presentationOrder[imgtrial]]);
    } else {
      res.html(instruction[0]);
    }
  }
}
