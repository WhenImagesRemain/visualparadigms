// !! Change this to you own project's name in order to download visualizations of your experiment data, this should be identitical to the ID in your experiment sketch.
const PROJECT_ID = "<student_id>_zoomMaps"




// here you can set the color of the heatmap in HSB
const fillcolor = [300.0, 100.0, 100.0];
const strokecolor = [300.0, 100.0, 100.0];

// set the alpha value of the shapes manually (1.0=full opacity)
// if left at 0 the code will calculate its own alpha value
let fillalpha = 0.3;
let strokealpha = 1.0;

// set size of numbers, set to 1 to make text invisible
const textsize = 18;

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

let x, y;
let c;
let img;
let ready = false,
  setalpha = true;

async function setup() {
  // gather data from the sheet
  data = await dataManager.getProjectData();;
  ready = true;
}

function draw() {
  colorMode(HSB, 360, 100, 100, 1);

  if (ready) {
    //     if (alphavalue > 0) {
    //       setalpha = false;
    //     }

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
      // check how many unique images were used
      for (j = 4; j < data[k].data[0].length; j += 3) {
        images.push(data[k].data[0][j]);
      }

      for (j = 0; j < images.length; j++) {
        c = createCanvas(
          data[k].data[0][5 + j * 3],
          data[k].data[0][6 + j * 3]
        );

        // check which rows to visualize
        startcount = 0;
        count = 0;
        for (i = 1; i < data[k].data.length; i++) {
          if (data[k].data[i][0] == images[j]) {
            if (startcount == 0) {
              startcount = i;
            }
            count++;
          } else if (startcount != 0) {
            break;
          }
        }

        beginShape();
        let trial = 0;
        let n = 0;
        let xtotal = 0;
        let ytotal = 0;

        textAlign(CENTER, CENTER);
        textSize(textsize);
        stroke(strokecolor[0], strokecolor[1], strokecolor[2], strokealpha);
        fill(fillcolor[0], fillcolor[1], fillcolor[2], fillalpha);
        for (i = startcount; i < startcount + count; i++) {
          if (trial != data[k].data[i][1]) {
            endShape(CLOSE);

            noStroke();
            fill(fillcolor[0], fillcolor[1], fillcolor[2], 1.0);
            text(int(trial) + 1, xtotal / n, ytotal / n);
            n = 0;
            xtotal = 0;
            ytotal = 0;

            stroke(strokecolor[0], strokecolor[1], strokecolor[2], strokealpha);
            fill(fillcolor[0], fillcolor[1], fillcolor[2], fillalpha);

            beginShape();
          }

          n++;
          xtotal += int(data[k].data[i][2]);
          ytotal += int(data[k].data[i][3]);

          vertex(data[k].data[i][2], data[k].data[i][3]);
          trial = data[k].data[i][1];
        }

        endShape(CLOSE);

        noStroke();
        fill(fillcolor[0], fillcolor[1], fillcolor[2], 1.0);
        text(int(trial) + 1, xtotal / n, ytotal / n);

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
