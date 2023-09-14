import { db, executeQuery } from "./getDbConnection.js";
import fs from "fs";
import raiseAnError from "./utils/raiseAnError.js";

const getAnAssociationForHouse = async () => {
    let query = `USE schoolProject`;
    await executeQuery(query, "failed to use database");

    query = ` SELECT DISTINCT street FROM HOUSE`;
    db.query(query, (err, res) => {
        if (err) return raiseAnError(err);
        fs.readFile("./csv/houseAssociation.csv", "utf8", (err, data) => {
            if (err) return raiseAnError(err);
            createRelation(data.split("\n"), res);
         })    

    })
}

const createRelation = (houseAss, streets) => {
    const length = houseAss.length;
    const partition = Math.ceil(streets.length / length);
    const limit = Math.floor(streets.length / partition) + 1;
    const categorization = [];

    for (let i = 0 ; i < limit ; i++){
        const category = [];
        
        for (let j = 0; j < partition; j++) {
            if (i * partition + j < streets.length){
                category.push(streets[i * partition + j].street)
            }
        }
        categorization.push(category);
    }
    fs.writeFile("./csv/house_Association.csv","", (err) => { //drop 
        if (err) return console.error(err);
    })
    for (let index = 0; index < categorization.length; index++){
        let query = `
        SELECT house_id FROM HOUSE
        WHERE street in ?
        `;
        db.query(query, [[categorization[index]]], (err, data) => {
            if (err) return raiseAnError(err);
            const houseAssociatioIndex = index + 1;

            for (let houseId of data) {
                let status = Math.ceil(Math.random() * 100 ) 
                status = status % 3 == 0 ? false : true;

                if (status) {
                    fs.appendFile("./csv/house_Association.csv", `${houseAssociatioIndex},${houseId.house_id}\n`, (err) => {
                        
                        if (err) 
                            return console.error(err);
                    })
                }
            }
        })
    }

    
}
export default getAnAssociationForHouse;