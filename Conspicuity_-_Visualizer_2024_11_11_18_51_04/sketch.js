// !! Change this to you own project's name in order to download visualizations of your experiment data, this should be identitical to the ID in your experiment sketch.
const PROJECT_ID = "<student_id>_conspicuity"




// set the color of the markers in RGB
const markercolor = [0,0,0];
// set the size of the markers in pixels
const markersize = 5;

// show the order in which targets were tried
const showNumber = false;

const fontsize = 16;

// change these to download only a few sheets at a time if you are experiencing errors
let firstSheet = undefined; //from which sheets should it start reading
let numberOfSheets = undefined; //from  how many sheets should it download visualizations
// so to use this you would for example first set firstSheet to 0 and numberOfSheets to 3, then repeat with firstSheet set to 3, 6, 9 etc.

// at 1.0 it downloads the data visualization at the size/resolution of the image you uploaded to your experiment sketch.
// change this value to download the image at a different size
const scaleImage = 1.0;

// ************* END OF PARAMETERS *************



const SAVING_SECRET = "ID4230_VCD"
const SAVE_TO_SERVER = false
const dataManager = new DataManager(SAVING_SECRET, PROJECT_ID, SAVE_TO_SERVER);

let data = [];
let ready = false;
let images = [];
let dimensions = [];

async function setup() {
  // gather data from the sheet
  data = await dataManager.getProjectData();
  ready = true;
}

function draw() {
  // wait until data is collected from sheets
  if (ready) {
    
    if(!firstSheet){
      firstSheet = 0;
    }
    if(!numberOfSheets){
      numberOfSheets = data.length;
    }
    if(firstSheet + numberOfSheets > data.length){
      numberOfSheets = data.length - firstSheet;
    }

    for (k = firstSheet; k < firstSheet + numberOfSheets; k++) {
      images = [];
      dimensions = [];
      // check how many unique images were used
      for (j = 6; j < data[k].data[0].length; j += 3) {
        if (!images.includes(data[k].data[0][j])) {
          images.push(data[k].data[0][j]);
          dimensions.push([
            int(data[k].data[0][1 + j]),
            int(data[k].data[0][2 + j]),
          ]);
        }
      }

      // loop once for each unique image
      for (j = 0; j < images.length; j++) {
        c = createCanvas(dimensions[j][0], dimensions[j][1]);

        // draws markers for each location observed
        for (i = 1; i < data[k].data.length; i++) {
          if (data[k].data[i][0] == images[j]) {
            drawMarker(
              int(data[k].data[i][2]),
              int(data[k].data[i][3]),
              int(data[k].data[i][4]),
              int(data[k].data[i][5])
            );
            if (showNumber) {
              textSize(fontsize);
              fill(markercolor[0], markercolor[1], markercolor[2]);
              text(
                i,
                int(data[k].data[i][2]) + markersize * 2,
                int(data[k].data[i][3])
              );
            }
          }
        }

        // here it has to scale the canvas down by half because p5 doubles the resolution
        pg = createGraphics(
          (scaleImage * c.width) / 2,
          (scaleImage * c.height) / 2
        );
        pg.image(c, 0, 0, pg.width, pg.height);
        resizeCanvas(pg.width, pg.height);
        image(pg, 0, 0);
        saveCanvas(c, data[k].fileName.replace(/\,/, "") + images[j], "png");
      }
    }

    noLoop();
  }
}

function drawMarker(x1, y1, x2, y2) {
  stroke(markercolor[0], markercolor[1], markercolor[2]);
  noFill();
  line(x1 - markersize, y1, x1 + markersize, y1);
  line(x1, y1 - markersize, x1, y1 + markersize);
  ellipse(x1, y1, 2 * abs(x1 - x2), 2 * abs(y1 - y2));
  noStroke();
}
