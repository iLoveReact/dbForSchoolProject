import { executeQuery } from "./getDbConnection.js";
import fs from "fs";
const getJobs = () => {
    let query = `USE schoolProject`;
    executeQuery(query);
    query = `
    DROP TABLE IF EXISTS Jobs
    `
    executeQuery(query)
    query = `
        CREATE TABLE Jobs (
        job_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        job_title VARCHAR(50) NOT NULL,
        min_salary FLOAT NOT NULL,
        max_salary FLOAT NOT NULL
        )
    `
    executeQuery(query);
    
    query = `
    LOAD DATA LOCAL INFILE './csv/jobs.csv' 
    INTO TABLE Jobs FIELDS TERMINATED BY ','
    (job_id, job_title, min_salary, max_salary)
    `
    executeQuery(query, "failed to populate Jobs");
}
getJobs();