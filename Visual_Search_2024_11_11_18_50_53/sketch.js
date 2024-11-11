/*

VISUAL SEARCH

INPUT: IMAGE, TARGET
OUTPUT: REACTION TIME, HIT/DISTANCE FROM TARGET

HOW TO USE:
1. In PROJECT_ID, write the name of the sheet you want to save the data to, preferrably as: "studentID_visualSearch"
2. Upload your image(s) to the images folder.
3. Write the names of the images in filenames.
4. Change setupMode to true
5. Run the code, marking the areas you want participants to search for.
6. Copy the coordinates into targetCoords in the code.
7. Change setupMode back to false.
> Click File>Share and send the "Fullscreen" link to your participants.

*/

// !! Change this to you own project's name in order to save your experiments data.
// This Id should consist of your student number followed by the project name
const PROJECT_ID = "<student_id>_visualSearch"

// Place the course secret here
const SAVING_SECRET = "ID4230_VCD"

// If you want your your data to be stored online set this to true.
const SAVE_TO_SERVER = true

// The data manager allows to save data to the server or you local machine. It can also load data from the server
const dataManager = new DataManager(SAVING_SECRET, PROJECT_ID, SAVE_TO_SERVER)

// write the filenames of your images as strings
const filenames = [
  "vatican.jpg", 
  "ajaxmadrid.jpg"
];

// set this to true to open the sketch in setup mode
const setupMode = false;

// change this to the copied coordinates
const targetCoords = [[[758, 377, 44, 79],[265, 263, 57, 71],[600, 2, 91, 65],],[[707, 263, 81, 42],[448, 2, 160, 105],[208, 223, 53, 53]]];

// set this to false to show targets in the selected order
const randomOrder = true;

// set this to false to show images in the order of filenames
const imgRandomOrder = true;

// ************* END OF PARAMETERS *************



//general variables
let max_width = 0,
  max_height = 0;

//setup mode variables
let selectionCount = 0;
let imgSelectionCount = 0;
let targetSelection = [];
let res;
let setupText =
  "Press Enter to save the canvas and go to the next image. <br>Copy the following into the code: <br>";
let targetsText = "[]";

//experiment variables
let images = [];
let clicks = 0;
var randomX, randomY;
var reactionTime = 0;
var startTime = 0;
var targets = [];
let presentationOrder = [],
  imgPresentationOrder = [];
let trial = 0,
  imgtrial = 0;

function preload() {
  for (i = 0; i < filenames.length; i++) {
    images[i] = loadImage("images/" + filenames[i]);
    imgPresentationOrder.push(i);

    // for setup mode
    targetSelection.push([]);
  }
}

function setup() {
  // determine which image has the biggest width/height
  for (let i = 0; i < images.length; i++) {
    if (images[i].width > max_width) {
      max_width = images[i].width;
    }
    if (images[i].height > max_height) {
      max_height = images[i].height;
    }
  }
  //use the image size for the canvas, SO MIND THAT YOU USE A SMALL ENOUGH IMAGE!
  cnv = createCanvas(max_width, max_height);

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
    //first random location for the target
    randomX = random(100, width - 100);
    randomY = random(100, height - 100);

    for (j = 0; j < targetCoords.length; j++) {
      image(images[j], 0, 0);
      presentationOrder.push([]);
      targets.push([]);
      for (i = 0; i < targetCoords[j].length; i++) {
        targets[j].push(
          get(
            targetCoords[j][i][0],
            targetCoords[j][i][1],
            targetCoords[j][i][2],
            targetCoords[j][i][3]
          )
        );
        presentationOrder[j][i] = i;
      }
      background(220);
    }

    if (randomOrder) {
      for (i = 0; i < presentationOrder.length; i++) {
        shuffle(presentationOrder[i], true);
      }
    }
    if (imgRandomOrder) {
      shuffle(imgPresentationOrder, true);
    }

    data = new p5.Table();
    data.columns = [
      "image",
      "target",
      "reaction time (ms)",
      "hit/distance",
      "x",
      "y",
    ];
  }
}

function draw() {
  //this code is to draw the rectangles
  if (setupMode) {
    background(0);
    image(images[imgSelectionCount], 0, 0);
    strokeWeight(1);
    textSize(16);
    for (i = 0; i < targetSelection[imgSelectionCount].length; i++) {
      let xs, ys, ws, hs;
      if (i == selectionCount) {
        rectfill = color(0, 200, 200);
        rectfill.setAlpha(100);
        fill(rectfill);
        stroke(0, 255, 255);
        if (mouseX > targetSelection[imgSelectionCount][i][0]) {
          xs = targetSelection[imgSelectionCount][i][0];
          ws = mouseX - xs;
        } else {
          xs = mouseX;
          ws = targetSelection[imgSelectionCount][i][0] - xs;
        }
        if (mouseY > targetSelection[imgSelectionCount][i][1]) {
          ys = targetSelection[imgSelectionCount][i][1];
          hs = mouseY - ys;
        } else {
          ys = mouseY;
          hs = targetSelection[imgSelectionCount][i][1] - ys;
        }
      } else {
        rectfill = color(255, 0, 255);
        rectfill.setAlpha(100);
        fill(rectfill);
        stroke(255, 0, 255);
        xs = targetSelection[imgSelectionCount][i][0];
        ys = targetSelection[imgSelectionCount][i][1];
        ws = targetSelection[imgSelectionCount][i][2];
        hs = targetSelection[imgSelectionCount][i][3];
        text(i + 1, xs, ys);
      }

      rect(xs, ys, ws, hs);
    }
  }

  //this is the regular experiment
  else {
    background(220);
    //search scene & arrow are shown anyway but...
    image(images[imgPresentationOrder[imgtrial]], 0, 0);

    //... with no mouseclicks, a white background occludes the scene and target is shown...
    if (clicks == 0) {
      showTarget(trial);
    } else if (clicks == 2) {
      background(255);
      text("Experiment over!", 30, 40);
      if (!dataManager.completionStatus) {
        text("Sending data...", 30, 60);
      } else {
        text("Data sent.", 30, 60);
      }
    }
  }
}

//called when mouse is pressed in setup mode
function startSelect() {
  targetSelection[imgSelectionCount].push([mouseX, mouseY]);
}

//called when mouse is released in setup mode
function endSelect() {
  //sort numbers so they're in "x,y,w,h" format
  let xs, ys, ws, hs;
  if (mouseX > targetSelection[imgSelectionCount][selectionCount][0]) {
    xs = targetSelection[imgSelectionCount][selectionCount][0];
    ws = mouseX - xs;
  } else {
    xs = mouseX;
    ws = targetSelection[imgSelectionCount][selectionCount][0] - xs;
  }
  if (mouseY > targetSelection[imgSelectionCount][selectionCount][1]) {
    ys = targetSelection[imgSelectionCount][selectionCount][1];
    hs = mouseY - ys;
  } else {
    ys = mouseY;
    hs = targetSelection[imgSelectionCount][selectionCount][1] - ys;
  }

  targetSelection[imgSelectionCount][selectionCount] = [
    int(xs),
    int(ys),
    int(ws),
    int(hs),
  ];

  //translates targetSelection to a string (targetsText)
  targetsText = "[";
  for (i = 0; i < targetSelection.length; i++) {
    for (j = 0; j < targetSelection[i].length; j++) {
      if (j == 0) {
        targetsText += "[[" + targetSelection[i][j] + "]";
      } else {
        targetsText += ", [" + targetSelection[i][j] + "]";
      }
    }

    if (i < targetSelection.length - 1) {
      targetsText += "], ";
    } else {
      targetsText += "]]";
    }
  }

  res.html(setupText + targetsText);

  selectionCount++;
}

// Here we keep track of reaction time and how many times has been clicked:
function clickOnCanvas() {
  if (clicks == 0) {
    startTime = millis();
    clicks++;
    randomX = random(100, width - 100);
    randomY = random(100, height - 100);
  } else if (clicks == 1) {
    // check accuracy

    let imgnum = imgPresentationOrder[imgtrial];
    let target = targetCoords[imgnum][presentationOrder[imgnum][trial]];

    let d;
    if (
      mouseX >= target[0] &&
      mouseX <= target[0] + target[2] &&
      mouseY >= target[1] &&
      mouseY <= target[1] + target[3]
    ) {
      d = 0;
    } else {
      var dx = Math.max(
        target[0] - mouseX,
        0,
        mouseX - (target[0] + target[2])
      );
      var dy = Math.max(
        target[1] - mouseY,
        0,
        mouseY - (target[1] + target[3])
      );
      d = sqrt(dx * dx + dy * dy);
    }

    // write results to the table
    let newRow = data.addRow();
    newRow.setString("image", filenames[imgnum]);
    newRow.setNum("target", presentationOrder[imgnum][trial]+1);
    newRow.setNum("reaction time (ms)", millis() - startTime);
    newRow.setNum("hit/distance", int(d));
    newRow.setNum("x", int(mouseX));
    newRow.setNum("y", int(mouseY));

    if (trial + 1 == targetCoords[imgnum].length) {
      if (imgtrial + 1 == targetCoords.length) {
        // Sends the p5 table to the server
        dataManager.saveP5Table(data)

        //lock the sketch
        clicks = 2;
      } else {
        imgtrial++;
        trial = 0;
        clicks = 0;
      }
    } else {
      trial++;
      clicks = 0;
    }
  }
}

function keyPressed() {
  // only called in setup mode
  if (keyCode == ENTER && setupMode) {
    saveCanvas(filenames[imgSelectionCount], 'png');
    if(imgSelectionCount < filenames.length - 1){
      imgSelectionCount++;
      selectionCount = 0;
    }
    
  }
}

function showTarget(i) {
  background(255);
  noStroke();
  textSize(16);
  text("Try to find the target a.s.a.p.", 30, 40);
  text("Click to start the task", 30, 60);
  image(
    targets[imgPresentationOrder[imgtrial]][
      presentationOrder[imgPresentationOrder[imgtrial]][trial]
    ],
    randomX,
    randomY
  );
}
