import fs from "fs";
import { db, executeQuery } from "./getDbConnection.js"
import raiseAnError from "./utils/raiseAnError.js";
const  getSchedule = async () => {
    await createDb();
    let startDate = new Date(2019, 11, 29);
    let index = 0;
    const endDate = new Date();

    fs.writeFile("./csv/schedule.csv", "" , (err) => {
        if (err) console.error("failed to drop a schedule.csv", err)
    })

    while (startDate < endDate) {
        const splited = startDate.toLocaleString("en-GB").replaceAll("/","-").split(",")[0].split("-")
        const date = splited[2] + "-" + splited[1] + "-" + splited[0];

        fs.appendFileSync("./csv/schedule.csv", `${++index},${date}\n`, (err) => {
            if (err) raiseAnError("failed to write schedule.csv", err);
        })
        startDate.setDate(startDate.getDate() + 20);
    }
    
    let query = `
    LOAD DATA LOCAL INFILE './csv/schedule.csv' 
    INTO TABLE Schedule FIELDS TERMINATED BY ','
    (schedule_id, date)
    `;
    await executeQuery(query, "failed to populate schedule");
    
}
const createDb = async () => {
    let query = `USE schoolProject`;
    await executeQuery(query, "failed to use schoolProject");

    query =  `DROP TABLE IF EXISTS Schedule`;
    await executeQuery(query, "failed to drop table Schedule");

    query = `CREATE TABLE Schedule (
        schedule_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        date VARCHAR(23) 
    )`;
    await executeQuery(query, "failed to create table Schedule");
}
export default getSchedule;