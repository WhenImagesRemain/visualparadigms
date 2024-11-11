const SERVER_URL = "https://visualparadigms.io.tudelft.nl/api"
class DataManager {

    constructor (secret, projectId, saveToServer = false) {
        this.secret = secret
        this.projectId = projectId
        this._saveToServer = saveToServer
        this.completionStatus = false
    }


    /**
     *	Saves an instance of a P5 table.
     *	@param table - The table to save
     */
    async saveP5Table(table) {

        if (!this._saveToServer)
            return this.saveLocally(table, "csv")

        let dataExport = table.getArray();
        dataExport.unshift(table.columns);
        await this.saveCSV(dataExport)
    }

    /**
     *	Saves the data as a csv file to the server.
     *	@param data - The data to save to the server.
     */
    async saveCSV(data){



        if (this._saveToServer) {
            const request_data = {
                secret: this.secret,
                id: this.projectId,
                type: "csv",
                data: data
            }

            return this.saveToServer(request_data)
        } else {
            this.saveLocally(data, "csv")
        }

    }

    /**
     *	Saves the data as a csv file to the server.
     *	@param data - The data to save to the server.
     */
    async saveJson(data) {

        if (this._saveToServer) {
            const request_data = {
                secret: this.secret,
                id: this.projectId,
                type: "json",
                data: data
            }

            return await this.saveToServer(request_data)
        } else {
            this.saveLocally(data, "json")
        }
    }


    async saveToServer(request_data) {
        const response = await fetch(SERVER_URL + "/save-data", {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            redirecr: "follow",
            body: JSON.stringify(request_data)
        })

        const response_json = await response.json()

        if (response_json.error)
            return console.log(response_json.error)

        this.completionStatus = true;
        return console.log(response_json.message)
    }

    saveLocally(data, type) {
        save(data, `data.${type}`)
    }

    /**
     *	Retrieves data from the server.
     *	@param fileName - The name of the file to get from the server.
     */
    async getData(fileName) {

        const request_data = {
            secret: this.secret,
            id: this.projectId,
            file: fileName,
        }

        const response = await fetch(SERVER_URL + "/get-data", {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            redirecr: "follow",
            body: JSON.stringify(request_data)
        })

        const response_json = await response.json()


        // There was an error getting the data.
        if (response_json.error)
            return console.log(response_json.error)


        return response_json

    }

    async getProjectData() {
        // Get all files in the project
        const response = await fetch(SERVER_URL + '/get-project', {
            method: "POST",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({secret: this.secret, id: this.projectId})
        })
        const data = await response.json()

        const projectData = []

        // Get all their data
        for (const file of data.files) {
            const fileData = await this.getData(file)
            projectData.push({
                fileName: file,
                data: fileData
            })
        }

        return projectData
    }
}