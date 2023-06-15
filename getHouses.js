import {db, executeQuery} from "./getDbConnection.js";
import {appendFile, readSync} from "node:fs";
import readline from "readline";
import fs from "fs";
import raiseAnError from "./utils/raiseAnError.js";
const getHouses = async () => {
    createDb();
    const values = [];
    let index = -1;
    const stream = fs.createReadStream("./csv/streetsOfNYC.csv")
    const lineReader = readline.createInterface({
        input:stream
    })

    for await (const line of lineReader) {
        const stringValues = line.toString().split(",")
        
        if (index > 1000) {
            
            createHousesCsv({
                error: false,
                data: values
            })
            break;
            
        }
        // 5 : adress, 7 : street 
        const numberOftenants = Math.floor(Math.random() * 100 + 1)
        const active = Math.floor(Math.random() * 100) //determines whether house is still an active customer
        const record = [++index, stringValues[5], stringValues[7], numberOftenants, active % 2 == 0 ? "T" : "N"]; 

        if (index !==0)
            values.push(record);
    }
    lineReader.on("error", (err) => {    
        createHousesCsv({
            error: true,
            message: "failed to read NYC streets"
        })       
    })  
}

const createHousesCsv = (values) => {
    if (values.error) return raiseAnError(values.message);
    fs.writeFile("./csv/houses.csv","", (err) => { //drop 
        if (err) console.error(err);
    })
    for (const line of values.data) {
        fs.appendFile("./csv/houses.csv", line.join(",") + "\n", (err) => {
            if (err) return raiseAnError(err);
        });
    }
    let query = `
    LOAD DATA LOCAL INFILE './csv/houses.csv' 
    INTO TABLE House FIELDS TERMINATED BY ','
    (house_id, address, street, tenants, active)
    `;
    db.query(query, [], (err) => {
        if (err) {
            return raiseAnError(err);
        }

    })
}

const createDb =  () => {
    executeQuery("DROP DATABASE IF EXISTS schoolProject", "failed to drop the database schoolProject");

    executeQuery("CREATE DATABASE IF NOT EXISTS  schoolProject", "failed to create database");

    executeQuery("USE schoolProject", "failed to use database");
    
    executeQuery("DROP TABLE IF EXISTS House", "failed to drop the table house");
    
    executeQuery(`CREATE TABLE IF NOT EXISTS  House (
        house_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        address VARCHAR(80) NOT NULL,
        street VARCHAR(75) NOT NULL,
        tenants INT NOT NULL,
        active VARCHAR(1) NOT NULL
    )`, "failed top create a table House");
    
}
export default getHouses;