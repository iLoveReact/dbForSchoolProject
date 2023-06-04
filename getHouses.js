import mysql from "mysql";
import {appendFile, readSync} from "node:fs"
import readline from "readline";
import fs from "fs"
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password:""
});
const executeQuery = async (query,error, values = []) => {
    await db.query(query, [values], (err, result) => {
        if (err) return {
            error:true,
            message: err
        };
        
        return {
            error: false,
            data: result            
        };
    })
}
const readNYC = () => {
    const values = []
    let index = -1;
    const stream = fs.createReadStream("./csv/streetsOfNYC.csv")
    const lineReader = readline.createInterface({
        input:stream
    })
    lineReader.on("line", async (line) => {
        const stringValues = line.toString().split(",")
        if (index > 1000) {
            lineReader.close();
        }
        // 5 : adress, 7 : street 
        const numberOftenants = Math.floor(Math.random() * 100 + 1)
        const active = Math.floor(Math.random() * 100) //determines whether house is still an active customer
        const record = [++index, stringValues[5], stringValues[7], numberOftenants, active % 2 == 0 ? "T" : "N"]; 
        if (index !==0) values.push(record);
    })
    lineReader.on("close", () => {
        createHousesCsv({
            error: false,
            data: values
        })

    })
    lineReader.on("error", (err) => {
        
        createHousesCsv({
            error: true,
            message: "failed to read NYC streets"
        })       
    }) 
    
}
const createHousesCsv = (values) => {
    if (values.error) return console.error(values.message);
    fs.writeFile("./csv/houses.csv","", (err) => {
        console.error(err);
    })
    for (const line of values.data) {
        console.log(line.join(","));
        fs.appendFile("./csv/houses.csv", line.join(",") + "\n", (err) => {
            return console.error(err);
        });
    }
    let query = `
    LOAD DATA LOCAL INFILE './csv/houses.csv' 
    INTO TABLE House FIELDS TERMINATED BY ','
    (house_id, address, street, tenants, active)
    `
    db.query(query, [], (err) => {
        if (err) return console.error(err);
        console.log("table house was populated successfully");
    })
    
}
const createDb =  () => {
    let result = executeQuery("DROP DATABASE IF EXISTS schoolProject", "failed to drop the database schoolProject")
    if (result.error) return console.error(result.message)

    result = executeQuery("CREATE DATABASE IF NOT EXISTS  schoolProject", "failed to create database");
    if (result.error) return console.error(result.message)

    result = executeQuery("USE schoolProject", "failed to use database")
    if (result.error) return console.error(result.message)

    result = executeQuery("DROP TABLE IF EXISTS House", "failed to drop the table house")
    if (result.error) return console.error(result.message)

    result = executeQuery(`CREATE TABLE IF NOT EXISTS  House (
        house_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        address VARCHAR(80) NOT NULL,
        street VARCHAR(75) NOT NULL,
        tenants INT NOT NULL,
        active VARCHAR(1) NOT NULL
    )`, "failed top create a table House");
    if (result.error) return console.error(result.message)
}
createDb();
readNYC();