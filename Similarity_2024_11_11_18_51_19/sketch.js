/*

SIMILARITY

INPUT: IMAGES
OUTPUT: SIMILARITY RATINGS

HOW TO USE:
1. In PROJECT_ID, write the name of the sheet you want to save the data to, preferrably as: "studentID_similarity"
2. Upload your images to the images folder.
3. Write the names of the images in filenames.
> Click File>Share and send the "Fullscreen" link to your participants

*/

// !! Change this to you own project's name in order to save your experiments data.
// This Id should consist of your student number followed by the project name
const PROJECT_ID = "<student_id>_similarity"


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
  "3.jpg", 
  "4.jpg"
];

// Here you can change the prompts the user gets.
const instruction = "Please rate the similarity of the 2 objects shown above";
const leftLabel = "not so similar";
const rightLabel = "very similar";

// set this to false to show images in the order of filenames
const randomOrder = true;

// ************* END OF PARAMETERS *************



var imgX1 = 340;
var imgX2 = 860;
var imgY = 270;
var imgSize = 480;

var lineY = imgY + imgSize/2 + 160;
var images = [];
var sliderX1 = 150;
var sliderX2 = 1050;
var sliderBallRadius = 18;
var ratingValue;
var labelYOffset = 35;
var trialNumber = 1;
var imgMatrix = makeCombinations(filenames.length);

function preload() {
  for (var i = 0; i < filenames.length; i++) {
    images[i] = loadImage("images/" + filenames[i]);
  }
}

function setup() {
  if (randomOrder) {
    shuffleMatrix(imgMatrix);
  }
  createCanvas(1200, 800);
  
  print(imgMatrix);

  data = new p5.Table();
  data.addColumn("Image 1");
  data.addColumn("Image 2");
  data.addColumn("Similarity Ratings");
  imageMode(CENTER);
}

function draw() {
  background(220);

  if (trialNumber <= imgMatrix.length) {
    let shown = imgMatrix[trialNumber - 1];
    for(i=0;i<2;i++){
      if(images[shown[i]].width > images[shown[i]].height){
        image(images[shown[i]], imgX1 + i * 520, imgY, imgSize, images[shown[i]].height * (imgSize/images[shown[i]].width));
      } else{
        image(images[shown[i]], imgX1 + i * 520, imgY, images[shown[i]].width * (imgSize/images[shown[i]].height), imgSize);
      }
    }
    
    
    image(images[imgMatrix[trialNumber - 1][1]], imgX2, imgY, imgSize, imgSize);

    fill(0, 102, 153);
    noStroke();
    textSize(22);
    textAlign(LEFT);
    text(instruction, 100, 560);

    fill(80);
    textSize(18);
    text(
      "Move mouse horizontally to adjust slider, click to respond and proceed to next trial.",
      100,
      590
    );

    strokeWeight(4);
    stroke(80);
    line(sliderX1, lineY, sliderX2, lineY);
    drawSliderTicks();

    fill(158, 194, 208);
    stroke(50);
    strokeWeight(4);
    ellipse(sliderX(mouseX), lineY, sliderBallRadius);

    fill(0);
    noStroke();
    textSize(18);
    text(leftLabel, sliderX1, lineY + labelYOffset);
    textAlign(RIGHT);
    text(rightLabel, sliderX2, lineY + labelYOffset);
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

function mouseClicked() {
  if (trialNumber <= imgMatrix.length) {
    ratingValue = round(100 * ratingX(mouseX));

    // save the data
    let newRow = data.addRow();
    newRow.setString("Image 1", filenames[imgMatrix[trialNumber - 1][0]]);
    newRow.setString("Image 2", filenames[imgMatrix[trialNumber - 1][1]]);
    newRow.setNum("Similarity Ratings", ratingValue);

    trialNumber++;
    if (trialNumber > imgMatrix.length) {
      
      // Sends the p5 table to the server
      dataManager.saveP5Table(data)
      
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

function drawSliderTicks() {
  var tickHeight = -8;
  var nTicks = 6;
  for (var i = 0; i < nTicks; i++) {
    var xtemp = map(i, 0, nTicks - 1, sliderX1, sliderX2);
    line(xtemp, lineY, xtemp, lineY - tickHeight);
  }
}

function makeCombinations(n) {
  //create a 2 by n matrix
  holder = [];
  for (var i = 0; i < n; i++) {
    for (var j = i; j < n; j++) {
      if(i!=j){
        holder.push([i, j]);
      }
    }
  }
  return holder;
}

function shuffleMatrix(matrix) {
  shuffle(matrix, true);
  for (var i = 0; i < matrix.length; i++) {
    shuffle(matrix[i], true);
  }
}
