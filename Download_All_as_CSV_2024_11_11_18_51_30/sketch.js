// !! Change this to you own project's name in order to save your experiments data.
// This Id should consist of your student number followed by the project name
const PROJECT_ID = "<student_id>_visualSearch"


// Place the course secret here
const SAVING_SECRET = "ID4230_VCD"

// If you want your your data to be stored online set this to true.
const SAVE_TO_SERVER = false

// The data manager allows to save data to the server or you local machine. It can also load data from the server
const dataManager = new DataManager(SAVING_SECRET, PROJECT_ID, SAVE_TO_SERVER);


// ************* END OF PARAMETERS *************


async function setup() {
  
  let projectData = await dataManager.getProjectData();
  
  for(let k=0;k<projectData.length;k++){
    
    let data = projectData[k].data;
    let table = new p5.Table();
    for(let i=0;i<data[0].length;i++){
      table.addColumn(data[0][i]);
    }
    for(let i=1;i<data.length;i++){
      let newRow = table.addRow();
      for(let j=0;j<data[i].length;j++){
        newRow.setString(data[0][j], data[i][j]);
      }

    }

    saveTable(table,  PROJECT_ID + projectData[k].fileName)
    
  }
  
}
