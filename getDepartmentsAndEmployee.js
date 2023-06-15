import { db, executeQuery } from "./getDbConnection.js";
import fs, { createReadStream } from "fs";
import { readFile } from "node:fs/promises";
import readline from "readline";
import raiseAnError from "./utils/raiseAnError.js";

let employeeIndex = 0;
const pathManNames = "./csv/8_-_WYKAZ_IMION_MĘSKICH_OSÓB_ŻYJĄCYCH_WG_POLA_IMIĘ_PIERWSZE_WYSTĘPUJĄCYCH_W_REJESTRZE_PESEL_BEZ_ZGONÓW.csv";
const pathWomenNames = "./csv/8_-_WYKAZ_IMION_ŻEŃSKICH_OSÓB_ŻYJĄCYCH_WG_POLA_IMIĘ_PIERWSZE_WYSTĘPUJĄCYCH_W_REJESTRZE_PESEL_BEZ_ZGONÓW.csv";
const pathManLastNames = "./csv/nazwiska_męskie-osoby_żyjące.csv";
const pathWomenLastNames = "./csv/nazwiska_żeńskie-osoby_żyjące.csv";

const createDb = async () => {
    let query = "USE Schoolproject";
    await executeQuery(query, "failed to connect to db");

    query = "DROP TABLE IF  EXISTS departments";
    await executeQuery(query, "failed to drop depaetmenst");

    query = `CREATE TABLE IF NOT EXISTS departments (
        dep_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        dep_name VARCHAR(30) NOT NULL
    )`;
    await executeQuery(query, "failed to create departments table");

    query = "DROP TABLE IF EXISTS employees";
    await executeQuery(query, "failed to drop employees");

    query = `CREATE TABLE  employees (
        employee_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        firstname VARCHAR(40) NOT NULL,
        lastname VARCHAR(50) NOT NULL,
        salary FLOAT NOT NULL,
        hiring_date VARCHAR(12) NOT NULL,
        firing_date VARCHAR(12) NULL,
        job_id INT NOT NULL,
    	FOREIGN KEY (job_id)
        REFERENCES Jobs(job_id)
    );`;
    await executeQuery(query, "failed to create employees table");
}

const getDepartmentsAndEmployees = async () => {
    await createDb()
    const { error, ...others } = await readNames();
    
    if (error) {
        return raiseAnError(others.msg)
    }
    const {manLastNames, manNames, womenLastNames, womenNames} = others

    fs.writeFile("./csv/employee.csv", "", (err) => {
        if (err) console.error(err);
    })
    fs.writeFile("./csv/worksIn.csv", "", (err) => {
        if(err) console.error(err);
    })

    executeQuery(`USE schoolProject`, "failed to use schoolPero");
    const reader = readline.createInterface({
        input: fs.createReadStream("./csv/deparments.csv"),
    })

    for await (const line of reader) {
        const splited = line.split(", ");
        let query = `INSERT INTO departments (dep_id, dep_name) VALUES (?)`;
        
        db.query(query, [[splited[0], splited[1]]], (err) => {
            if (err) return raiseAnError(err); 
            const availibleJobs = splited[2].replace("[", "").replace("]", "").split(",");
            return startGeneration(availibleJobs,  manLastNames, manNames, womenLastNames, womenNames, splited) 
        })
    }
    await executeQuery("use schoolproject", "failed to connect to db");
}
const startGeneration = (availibleJobs, manLastNames, manNames, womenLastNames, womenNames, splited) => {
    for (let job of availibleJobs) {
        let magicNumber = 8;
        let anotherMagicNumber = 3;
        
        if (job === "kierowca" || job === "ustawiac smietnikow") {
            magicNumber = 17;
            anotherMagicNumber = 35;
        }

        for (let i = 0; i < Math.floor( Math.random() * magicNumber ) + anotherMagicNumber; i++) {
            let query = `SELECT job_id FROM JOBS WHERE job_title = '${job}'`;
            
            db.query(query, (err, data) => {
                if (err) return raiseAnError(err);
                return getJobDetails(job, manNames, manLastNames, womenLastNames, womenNames, splited[0], data[0].job_id);
            })

        }

    }
}
const getJobDetails = async (job, manNames, manLastNames, womenLastNames, womenNames, depId, jobId) => {
    let query = `SELECT * FROM Jobs
            WHERE job_title = '${job}'
    `;

    db.query(query, async (err, data) => {
        if (err) return raiseAnError(err);
        let gender = Math.floor(Math.random() * 100);
        let firstName = "";
        let lastName = "";

        if (gender % 2 == 0) {
            firstName = manNames[Math.floor(Math.random() * manNames.length)].split(",")[0];
            lastName = manLastNames[Math.floor(Math.random() * manLastNames.length)].split(",")[0];
        } else {
            firstName = womenNames[Math.floor(Math.random() * womenNames.length)].split(",")[0];
            lastName = womenLastNames[Math.floor(Math.random() * womenLastNames.length)].split(",")[0];
        }

        const diff = Number(data[0].max_salary) - Number(data[0].min_salary);
        const salary = Math.ceil(Math.random() * diff) + Number(data[0].min_salary);
        const date = new Date(2019, 1, 12).valueOf();
        const now = new Date().valueOf();
        let firingDate = "";
        let hiringDate = Math.floor(Math.random() * (now - date)) + date;
        if (jobId == 4 || jobId == 5) hiringDate = Math.floor(Math.random() * 1000) + new Date(2012, 4, 4).valueOf()
        let randomNumber = Math.floor(Math.random() * 100);

        if (randomNumber % 4 === 0) {
            if (hiringDate < new Date(2019, 1, 1)){
                firingDate = new Date(Math.floor(Math.random() * (now - new Date(2019, 1, 1).valueOf())) + new Date(2019, 1, 1).valueOf());
                firingDate = firingDate.toLocaleString("en-GB").replaceAll("/", "-").split(",")[0];
            }else{
                firingDate = new Date(Math.floor(Math.random() * (now - hiringDate)) + hiringDate);
                firingDate = firingDate.toLocaleString("en-GB").replaceAll("/", "-").split(",")[0];   
            }
            const splited = firingDate.split("-");
            firingDate = splited[2] + "-" + splited[1] + "-" + splited[0];
        }

        hiringDate = new Date(hiringDate).toLocaleString("en-GB");
        hiringDate = hiringDate.replaceAll("/", "-").split(",")[0];
        const splited = hiringDate.split("-");
        hiringDate = splited[2] + "-" + splited[1] + "-" + splited[0];
        await createEmployee(firstName, lastName, salary, hiringDate, firingDate, depId, jobId);
    })

}
const createEmployee = async (firstName, lastName, salary, hiringDate, firingDate, deparmentIndex, jobId) => {
    employeeIndex++;

    fs.appendFile("./csv/employee.csv", `${employeeIndex},${firstName},${lastName},${salary},${hiringDate},${firingDate},${jobId}\n`, (err) => {
        if (err) return raiseAnError("failed to append to employee.csv");
        createWorkIn(deparmentIndex)
    })
    let query = `INSERT INTO employees
    (employee_id, firstname, lastname, salary, hiring_date, firing_date, job_id)
    VALUES (${employeeIndex}, "${firstName}", "${lastName}", ${salary},"${hiringDate}" ,"${firingDate}" ,${jobId})
    `
    await executeQuery(query, "failed to insert employee into employees table");
}
const createWorkIn = async(deparmentIndex) => {
    fs.appendFile("./csv/worksIn.csv", `${employeeIndex},${deparmentIndex}\n`, (err) => {
        if (err) return raiseAnError(err); 
    })
}
const readNames = async () => {
    try {
        const manNames = (await readFile(pathManNames, "utf8")).toString().split("\n")
        const womenNames = (await readFile(pathWomenNames, "utf8")).toString().split("\n")
        const manLastNames = (await readFile(pathManLastNames, "utf8")).toString().split("\n")
        const womenLastNames = (await readFile(pathWomenLastNames, "utf8")).toString().split("\n");
        return {
            error:false,
            manNames,
            womenNames,
            manLastNames,
            womenLastNames
        }
    }
    catch(err){
        return {
            error:true,
            msg: err
        }
    }
}

export default getDepartmentsAndEmployees;