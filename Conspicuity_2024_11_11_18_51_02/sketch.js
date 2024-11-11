/*

CONSPICUITY

INPUT: IMAGE, TARGET
OUTPUT: TARGET CONSPICUITY

HOW TO USE:
1. In PROJECT_ID, write the name of the sheet you want to save the data to, preferrably as: "studentID_conspicuity"
2. Upload your own image(s) to the "images" folder and change filename in the code below to match. Canvas size is determined by image size, so watch out with images that are too big or small.
3. (Optional) Write instructions for which targets participants should click (const targets).
4. (Optional) add instructions at the start (let instruct0).
> Click File>Share and send the "Fullscreen" link to your participants, or do it yourself.

*/

// !! Change this to you own project's name in order to save your experiments data.
// This Id should consist of your student number followed by the project name
const PROJECT_ID = "<student_id>_conspicuity"


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

// write instructions for where participants should click. change to false to show no instructions. (i.e. targets = false;)
// make sure to write them as a subarray for each image, like this:
// [[img1instruct1, img1instruct2], [img2instruct1, img2instruct2, img2instruct3]]
const targets = [
  [
    "the club logo on the shirt of the leftmost player",
    "the red jacket",
    "the shirtless man's left nipple"
  ],
  [
    "the clock", 
    "the head of the pope"
  ],
];

// if you want to add instructions for users before the image is shown, such as where to click, you can write them here as a string.
let instruct0 = false;

// shows images and target instructions in random order for each participant, change to false to show them in the order as written above
const randomOrder = false,
  targetRandomOrder = false;

// ************* END OF PARAMETERS *************



let instruct1 = "Click ";
let instruct2 = [
  "Move the cursor away from the target while keeping you eyes fixated on it.",
  "When you can no longer distinguish the target, click again.",
];

let topmargin = 58;
let images = [];
let presentationOrder = [],
  targetPresentationOrder = [];
let clicks = 0;
let trial = 0,
  imgtrial = 0;
let trialdata = [];
var max_height = 0;
var max_width = 0;
let done = false;

function preload() {
  // load images
  for (i = 0; i < filenames.length; i++) {
    images.push(loadImage("images/" + filenames[i]));
    presentationOrder[i] = i;
  }

  if (randomOrder) {
    presentationOrder = shuffle(presentationOrder);
  }
  for (i = 0; i < targets.length; i++) {
    targetPresentationOrder[i] = [];
    for (j = 0; j < targets[i].length; j++) {
      targetPresentationOrder[i][j] = j;
    }
    if (targetRandomOrder) {
      targetPresentationOrder[i] = shuffle(targetPresentationOrder[i]);
    }
  }
}

function setup() {
  textSize(15);
  // determine which image has the biggest width/height
  for (let i = 0; i < images.length; i++) {
    if (images[i].width > max_width) {
      max_width = images[i].width;
    }
    if (images[i].height > max_height) {
      max_height = images[i].height;
    }
  }

  // create a table to store results
  data = new p5.Table();
  data.columns = [
    "image",
    "target",
    "target x",
    "target y",
    "conspicuity x",
    "conspicuity y",
  ];

  for (i = 0; i < filenames.length; i++) {
    data.columns.push(filenames[i], images[i].width, images[i].height);
  }

  if (textWidth(instruct2[1]) + 20 > max_width) {
    instruct2 = [
      "Move the cursor away from the target",
      "while keeping you eyes fixated on it.",
      "When you can no longer see the target",
      "in your peripheral vision, click again.",
    ];
    topmargin += 16 * 2;
  }

  createCanvas(max_width, max_height + topmargin);
  noCursor();

  if (instruct0) {
    clicks = -1;
  }
}

function draw() {
  background(220);
  image(images[presentationOrder[imgtrial]], 0, topmargin);
  fixationCross(mouseX, mouseY);

  noStroke();

  if (clicks == -1) {
    textSize(24);
    background(255);
    text(instruct0, 20, 60);
  } else if (clicks == 0) {
    textSize(15);
    if (targets) {
      if (
        targets[presentationOrder[imgtrial]][
          targetPresentationOrder[presentationOrder[imgtrial]][trial]
        ]
      ) {
        text(
          instruct1 +
            targets[presentationOrder[imgtrial]][
              targetPresentationOrder[presentationOrder[imgtrial]][trial]
            ],
          20,
          26
        );
      } else {
        text(instruct1 + "the target.", 20, 26);
      }
    } else {
      text(instruct1 + "the target.", 20, 26);
    }
  } else if (clicks == 1 || clicks == 2) {
    textSize(15);
    for (i = 0; i < instruct2.length; i++) {
      text(instruct2[i], 20, 10 + 16 * (1 + i));
    }
  } else if (clicks == 3) {
    background(255);
    textSize(20);
    text(
      "Target = (" + trialdata[0] + "," + (trialdata[1] + topmargin) + ")",
      30,
      60
    );
    text(
      "Conspicuity location = (" +
        trialdata[2] +
        "," +
        (trialdata[3] + topmargin) +
        ")",
      30,
      90
    );
    text(
      "Conspicuity distance = X:" +
        abs(trialdata[0] - trialdata[2]) +
        " Y:" +
        abs(trialdata[1] - trialdata[3]),
      30,
      120
    );
    if (targets) {
      text(
        "Targets left on this image: " +
          (targets[presentationOrder[imgtrial]].length - trial - 1),
        30,
        150
      );
    }
    if (done && !dataManager.completionStatus) {
      text("Experiment completed, sending data...", 30, 180);
    }
    if (done && dataManager.completionStatus) {
      text("Experiment completed, data sent!", 30, 180);
    }
  }
}

function fixationCross(x, y) {
  var w = 10;
  strokeWeight(4);
  stroke(255, 0, 0);
  if (clicks == 1) {
    line(x, trialdata[1] + topmargin - w, x, trialdata[1] + topmargin + w);
    line(x - w, trialdata[1] + topmargin, x + w, trialdata[1] + topmargin);
  } else if (clicks == 2) {
    line(trialdata[0], y - w, trialdata[0], y + w);
    line(trialdata[0] - w, y, trialdata[0] + w, y);
  } else {
    line(x, y - w, x, y + w);
    line(x - w, y, x + w, y);
  }
}

function mouseClicked() {
  if (clicks == -1) {
    clicks++;
  } else if (clicks == 0) {
    //First two array entries are the x & y coordinate of the target
    trialdata[0] = mouseX;
    trialdata[1] = mouseY - topmargin;
    clicks++;
  } else if (clicks == 1) {
    trialdata[2] = mouseX;
    clicks++;
  } else if (clicks == 2) {
    trialdata[3] = mouseY - topmargin;

    let newRow = data.addRow();
    newRow.setString("image", filenames[presentationOrder[imgtrial]]);
    if (targets) {
      if (
        targets[presentationOrder[imgtrial]][
          targetPresentationOrder[presentationOrder[imgtrial]][trial]
        ]
      ) {
        target =
          targets[presentationOrder[imgtrial]][
            targetPresentationOrder[presentationOrder[imgtrial]][trial]
          ];
      } else {
        target = "target";
      }
    } else {
      target = "target";
    }
    newRow.setString("target", target);
    newRow.setNum("target x", trialdata[0]);
    newRow.setNum("target y", trialdata[1]);
    newRow.setNum("conspicuity x", trialdata[2]);
    newRow.setNum("conspicuity y", trialdata[3]);

    clicks++;

    repeatButton = createButton("Repeat image").mousePressed(repeatImage);
    repeatButton.position(35, 170);
    nextButton = createButton("Continue").mousePressed(nextImage);
    nextButton.position(140, 170);
    cursor(ARROW);
  }
}

function repeatImage() {
  noCursor();
  repeatButton.remove();
  nextButton.remove();
  trial++;
  clicks = 0;
}

function nextImage() {
  noCursor();
  repeatButton.remove();
  nextButton.remove();
  if (imgtrial < images.length - 1) {
    trialdata = [];
    imgtrial++;
    trial = 0;
    clicks = 0;
  } else {
    
    cursor(ARROW);
    done = true;
    
    // Sends the p5 table to the server
    dataManager.saveP5Table(data)
  }
}
