import fs from "fs";
import puppeteer from "puppeteer";
import { db, executeQuery } from "./getDbConnection.js";
const createDb = () =>  {
    let query = `
        USE schoolProject
    `
    executeQuery(query, "failed to use schoolProject db");
    
    query = `
        CREATE TABLE Cars (
            car_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
            model VARCHAR(90) NOT NULL,
            status VARCHAR(30) NOT NULL,
            volume INT NOT NULL
        )
    `
    executeQuery(query, "failed to create car table");
}
createDb();