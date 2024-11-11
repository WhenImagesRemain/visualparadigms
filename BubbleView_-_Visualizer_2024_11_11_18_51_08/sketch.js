// !! Change this to you own project's name in order to download visualizations of your experiment data, this should be identitical to the ID in your experiment sketch.
const PROJECT_ID = "<student_id>_bubbleView"




// here you can set the color of the heatmap in HSB
// if endcolor is different from startcolor, the rectangles will gradually change color to let you track chronology
const startcolor = [360.0, 100.0, 100.0];
const endcolor = [240.0, 100.0, 100.0];

// set the alpha value of each rectangle manually (1=full opacity), you can play with this if your results are too transparent or not transparent enough
// if left at 0 the code will calculate its own alpha value
let alphavalue = 0.0;

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
  data = await dataManager.getProjectData();
  ready = true;
}

function draw() {
  noStroke();
  colorMode(HSB, 360, 100, 100, 1);

  if (ready) {
    if (alphavalue > 0) {
      setalpha = false;
    }

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
      
      
      // check if rows were split
      while(isNaN(data[k].data[1][1]) || isNaN(data[k].data[1][2]) || isNaN(data[k].data[1][3])){
        data[k].data[0][data[k].data[0].length-1] += data[k].data[1][0]
        for(let h=1;h<data[k].data[1].length;h++){
          data[k].data[0].push(data[k].data[1][h])
        }
        data[k].data.splice(1, 1);
      }
      
      // check for commas
      let unsafeHeader = true
      
      while(unsafeHeader){
        unsafeHeader = false
        let mistake = 0
        for(let j=5;j<data[k].data[0].length; j += 4){
          if( isNaN(data[k].data[0][j]) || 
              isNaN(data[k].data[0][j+1])) {
            unsafeHeader = true
            mistake = j;
            break
          }
        }
        if(unsafeHeader){
          data[k].data[0][mistake-2] += data[k].data[0].splice(mistake-1, 1)
        }
      }
      
      // check how many unique images were used
      for (j = 4; j < data[k].data[0].length; j += 4) {
        images.push(data[k].data[0][j]);
      }

      for (j = 0; j < images.length; j++) {
        c = createCanvas(
          data[k].data[0][5 + 4 * j],
          data[k].data[0][6 + 4 * j]
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

        colorinterval = [];
        for (i = 0; i < startcolor.length; i++) {
          colorinterval.push((endcolor[i] - startcolor[i]) / count);
        }

        if (setalpha) {
          alphavalue = 5.0 / float(count);
        }

        hsb = startcolor.slice();
        fill(hsb[0], hsb[1], hsb[2], alphavalue);

        for (i = startcount; i < startcount + count; i++) {
          for (ii = 0; ii < hsb.length; ii++) {
            hsb[ii] += colorinterval[ii];
          }
          fill(hsb[0], hsb[1], hsb[2], alphavalue);

          x = float(data[k].data[i][1]);
          y = float(data[k].data[i][2]);
          r = float(data[k].data[i][3]);
          circle(x, y, r * 2);
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
