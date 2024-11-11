// !! Change this to you own project's name in order to download visualizations of your experiment data, this should be identitical to the ID in your experiment sketch.
const PROJECT_ID = "<student_id>_codeCharts"




// set the color of the markers in RGB
const markercolor = [0,0,0];
// set the size of the markers in pixels
const markersize = 5;

// enable numbers showing the order in which codes were observed
const showNumber = true;

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
      for (j = 3; j < data[k].data[0].length; j += 3) {
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
          if (data[k].data[i][0] == images[j] && data[k].data[i][1] != "N/A") {
            drawMarker(int(data[k].data[i][1]), int(data[k].data[i][2]));
            if(showNumber){
              fill(markercolor[0], markercolor[1], markercolor[2]);
              textSize(fontsize);
              text(
                i,
                int(data[k].data[i][1]) + markersize * 2,
                int(data[k].data[i][2])
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

function drawMarker(x, y) {
  stroke(markercolor[0], markercolor[1], markercolor[2]);
  line(x - markersize, y, x + markersize, y);
  line(x, y - markersize, x, y + markersize);
  noStroke();
}
