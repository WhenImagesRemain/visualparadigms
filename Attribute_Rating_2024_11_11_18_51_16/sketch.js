/*

ATTRIBUTE RATING

INPUT: IMAGES, ATTRIBUTES
OUTPUT: ATTRIBUTE RATINGS

HOW TO USE:
1. In PROJECT_ID, write the name of the sheet you want to save the data to, preferrably as: "studentID_attributeRating"
2. Upload your image(s) to the images folder.
3. Write the names of the images in filenames.
4. Write the attributes you would like participants to score.
5. Adjust the labels accordingly.
> Click File>Share and send the "Fullscreen" link to your participants.

*/

// !! Change this to you own project's name in order to save your experiments data.
// This Id should consist of your student number followed by the project name
const PROJECT_ID = "<student_id>_attributeRating"


// Place the course secret here
const SAVING_SECRET = "ID4230_VCD"

// If you want your your data to be stored online set this to true.
const SAVE_TO_SERVER = true

// The data manager allows to save data to the server or you local machine. It can also load data from the server
const dataManager = new DataManager(SAVING_SECRET, PROJECT_ID, SAVE_TO_SERVER)

// write the filenames of your images as strings
const filenames = [
  "1.jpg", 
  "2.jpg", 
  "3.jpg"
];

// Here you can change the prompts the user gets.
const attributes = [
  "attractiveness", 
  "uniqueness", 
  "luxuriousness"
];
const leftLabel = [
  "not so attractive", 
  "not so unique", 
  "not so luxurious"
];
const rightLabel = [
  "very attractive", 
  "very unique", 
  "very luxurious"
];

// set this to false to show images in the order of filenames
const randomOrder = true;

// ************* END OF PARAMETERS *************



var presentationOrder = [];
var hoverS, hoverBool;
var ratings = [];
var imgX = 100;
var imgY = 30;
var aspectRatio = 1.5;
var imgHeight = 400;
var imgWidth = aspectRatio * imgHeight;
var lineY = imgY + imgHeight + 100;
var marginY = 80;
var images = [];
var sliderX1 = 150;
var sliderX2 = 650;
var sliderBallRadius = 18;
var tickHeight = -8;
var nTicks = 6;
var ratingValue;
var labelYOffset = 35;
var trialNumber = 0;

function preload() {
  for (var i = 0; i < filenames.length; i++) {
    images[i] = loadImage("img/" + filenames[i]);
    presentationOrder[i] = i;
  }
  if (randomOrder) {
    presentationOrder = shuffle(presentationOrder);
  }
}

function setup() {
  createCanvas(800, 700 + marginY * (attributes.length - 1));

  data = new p5.Table();
  data.addColumn("image");
  for (i = 0; i < attributes.length; i++) {
    data.addColumn(attributes[i]);
    ratings.push(-1);
  }
}

function draw() {
  background(220);

  if (trialNumber < filenames.length) {
    let shown = images[presentationOrder[trialNumber]];
    if(shown.width/shown.height > aspectRatio){
      image(shown, imgX, imgY, imgWidth, shown.height * (imgWidth/shown.width));
    } else{
      image(shown, imgX, imgY, shown.width * (imgHeight/shown.height), imgHeight);
    }
    

    fill(0, 102, 153);
    noStroke();
    textSize(22);
    text(
      "Please rate the object in the image on the following attributes:",
      100,
      480
    );

    hoverBool = false;
    for (i = 0; i < attributes.length; i++) {
      drawSlider(i);
    }
  } else {
    //final page, data download instruction
    fill(0, 102, 153);
    noStroke();
    textSize(28);
    textAlign(CENTER);
    text("Experiment over!", 400, 300);

    fill(100);
    textSize(20);
    if (!dataManager.completionStatus) {
      text("Sending data...", 400, 350);
    } else {
      text("The data has been sent.", 400, 350);
    }
  }
}

function drawSlider(i) {
  strokeWeight(4);
  stroke(80);
  line(sliderX1, lineY + i * marginY, sliderX2, lineY + i * marginY);

  //draw ticks
  for (var j = 0; j < nTicks; j++) {
    var xtemp = map(j, 0, nTicks - 1, sliderX1, sliderX2);
    line(xtemp, lineY + i * marginY, xtemp, lineY - tickHeight + i * marginY);
  }

  //draw slider ball
  fill(158, 194, 208);
  stroke(50);
  strokeWeight(4);
  if (
    mouseY > lineY + i * marginY - marginY / 2 &&
    mouseY < lineY + i * marginY + marginY / 2 &&
    ratings[i] < 0
  ) {
    ellipse(sliderX(mouseX), lineY + i * marginY, sliderBallRadius);
    hover = i;
    hoverBool = true;
  }

  if (ratings[i] != -1) {
    fill(128, 128, 128);
    ellipse(
      map(ratings[i], 0, 100, sliderX1, sliderX2),
      lineY + i * marginY,
      sliderBallRadius
    );
  }

  fill(0);
  noStroke();
  textSize(18);

  text(leftLabel[i], sliderX1, lineY + labelYOffset + i * marginY);
  textAlign(RIGHT);
  text(rightLabel[i], sliderX2, lineY + labelYOffset + i * marginY);
  textAlign(LEFT);
}

function mouseClicked() {
  if (trialNumber < filenames.length && hoverBool) {
    ratings[hover] = round(100 * ratingX(mouseX));

    // save the data
    if (checkSliders()) {
      let newRow = data.addRow();
      newRow.setString("image", filenames[presentationOrder[trialNumber]]);
      for (i = 0; i < attributes.length; i++) {
        newRow.setNum(attributes[i], ratings[i]);
        ratings[i] = -1;
      }
      trialNumber++;
      if (trialNumber == filenames.length) {
        
        // Sends the p5 table to the server
        dataManager.saveP5Table(data)

      }
    }
  }
}

function sliderX(mx) {
  var mq = max([mx, sliderX1]);
  return min([mq, sliderX2]);
}

function ratingX(mx) {
  var mq = max([mx, sliderX1]);
  mq = min([mq, sliderX2]);
  return map(mq, sliderX1, sliderX2, 0, 1);
}

function checkSliders() {
  for (i = 0; i < attributes.length; i++) {
    if (ratings[i] < 0) {
      return false;
    }
  }
  return true;
}
