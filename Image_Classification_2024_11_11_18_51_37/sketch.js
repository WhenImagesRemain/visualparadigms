/*

IMAGE CLASSIFICATION

INPUT: IMAGES, CLASSIFICATION ICONS
OUTPUT: CLASSIFICATIONS

HOW TO USE:
1. In PROJECT_ID, write the name of the sheet you want to save the data to, preferrably as: "studentID_imageClassification"
2. Upload your image(s) to the images folder.
3. Write the names of the images in filenames.
4. Upload the icons you want to classify your images with to the icons folder.
  Make sure they all have roughly the same aspect ratio
5. Write the names of the icons in iconnames.
> Click File>Share and send the "Fullscreen" link to your participants.

*/

// !! Change this to you own project's name in order to save your experiments data.
// This Id should consist of your student number followed by the project name
const PROJECT_ID = "<student_id>_imageClassification"


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

// write the names of the icons as strings
const iconnames = [
  "premo_01.png", 
  "premo_02.png", 
  "premo_03.png", 
  "premo_04.png", 
  "premo_05.png", 
  "premo_06.png", 
  "premo_07.png", 
  "premo_08.png", 
  "premo_09.png", 
  "premo_10.png", 
  "premo_11.png", 
  "premo_12.png", 
  "premo_13.png", 
  "premo_14.png", 
];

// write the prompt the user sees here
const prompt = "Click the icons that best describe your feelings about this image."

// make true to let users select multiple icons
const selectMultiple = true;

// set this to false to show images in the order of filenames
const randomOrder = true;

// adjust these if you want to make your icons bigger or smaller
const iconwidth = 78;
const marginY = 120;
const iconsPerRow = 7;

// ************* END OF PARAMETERS *************



var presentationOrder = [];
var clicked = [];
var hoverS, hoverBool;
var ratings = [];
var imgX = 100;
var imgY = 30;
var aspectRatio = 1.5;
var imgHeight = 400;
var imgWidth = aspectRatio * imgHeight;
var iconY = imgY + imgHeight + 100;
var images = [];
var icons = [];
var trialNumber = 0;

function preload() {
  for (i = 0; i < filenames.length; i++) {
    images[i] = loadImage("images/" + filenames[i]);
    presentationOrder[i] = i;
  }
  
  for (i = 0; i < iconnames.length; i++) {
    icons[i] = loadImage("icons/" + iconnames[i]);
  }
  
  if (randomOrder) {
    presentationOrder = shuffle(presentationOrder);
  }
}

function setup() {
  createCanvas(800, 700 + marginY * (ceil(float(icons.length) / float(iconsPerRow) ) - 1));

  data = new p5.Table();
  data.addColumn("image");
  if(selectMultiple){
    
    for(i=0;i<icons.length;i++){
      data.addColumn("icon " + (i+1))
    }
    
    button = createButton('Continue');
    button.position(imgX, height - 50);
    button.size(imgWidth)
    button.mousePressed(nextTrial);
    
  } else {
    data.addColumn("icon");
  }
}

function draw() {
  background(240);

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
      prompt,
      100,
      480
    );

    hoverBool = false;
    for (i = 0; i < icons.length; i++) {
      drawIcon(i);
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

function drawIcon(i) {
  
  if(clicked.includes(iconnames[i])){
    fill(180);
    rect(imgX + (iconwidth + 10) * (i%iconsPerRow), iconY + marginY * floor(float(i)/float(iconsPerRow)), iconwidth, icons[i].height * (iconwidth/icons[i].width));
  }
  //darken background if user hovers over icon
  else if(hoverIcon(i)){
    fill(210);
    rect(imgX + (iconwidth + 10) * (i%iconsPerRow), iconY + marginY * floor(float(i)/float(iconsPerRow)), iconwidth, icons[i].height * (iconwidth/icons[i].width));
  }

  //draw icon
  image(icons[i], imgX + (iconwidth + 10) * (i%iconsPerRow), iconY + marginY * floor(float(i)/float(iconsPerRow)), iconwidth, icons[i].height * (iconwidth/icons[i].width));

}

function mousePressed() {
  if (trialNumber < filenames.length) {
    for(i=0; i< icons.length; i++){
      if(hoverIcon(i)){
        if(clicked.includes(iconnames[i])){
          let index = clicked.indexOf(iconnames[i]);
          clicked.splice(index, 1);
        } else{
          clicked.push(iconnames[i])
        }
        if(!selectMultiple){
          nextTrial(i);
        }
      }
    }
  }
}

function nextTrial(img){
  let newRow = data.addRow();
  newRow.setString("image", filenames[presentationOrder[trialNumber]]);
  if(selectMultiple){
    for(j=0;j<clicked.length;j++){
      newRow.setString("icon " + (j + 1), clicked[j]);
    }
  } else{
    newRow.setString("icon", iconnames[img]);
  }
  
  clicked = [];
  
  trialNumber++;
  if (trialNumber == filenames.length) {
    button.remove();
    
    // Sends the p5 table to the server
    dataManager.saveP5Table(data)

  }
}

function hoverIcon(i) {
  x = imgX + (iconwidth + 10) * (i%iconsPerRow);
  x2 = x + iconwidth;
  y = iconY + marginY * floor(float(i)/float(iconsPerRow));
  y2 = y + icons[i].height * (iconwidth/icons[i].width);
  if(mouseX >= x && mouseX <= x2 && mouseY >= y && mouseY <= y2){
    return true
  } else {
    return false
  }
}
