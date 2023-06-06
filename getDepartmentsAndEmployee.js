import { db, executeQuery } from "./getDbConnection.js";
import fs, { createReadStream } from "fs";
import { readFile } from "node:fs/promises";
import readline from "readline";
let employeeIndex = 0;
const getDepartmentsAndEmployees = async () => {
    const {manNames, manLastNames, womenLastNames, womenNames} = await readNames();
    executeQuery(`USE schoolProject`);
    // console.log(some);
    const reader = readline.createInterface({
        input : fs.createReadStream("./csv/deparments.csv"),
    })
    for await (const line of reader) {
        const splited = line.split(", ")
        const availibleJobs = splited[2].replace("[","").replace("]","").split(",")
        for (let job of availibleJobs){ 
            for (let i = 0 ; i < Math.floor(Math.random() * 5) + 1; i++ ){
                getJobDetails(job, manNames, manLastNames, womenLastNames, womenNames, splited[0]);
            }
            
        }
        
    }
    
}
const getJobDetails = async (job, manNames, manLastNames, womenLastNames, womenNames, depId) => {
    let query =  `SELECT * FROM Jobs
            WHERE job_title = '${job}'
    `
    employeeIndex++;
    db.query(query, (err, data) => {
            if (err) return {error: true};   
            let gender = Math.floor(Math.random() * 100);
            let firstName = "";
            let lastName = "";
            
            if (gender % 2 == 0){
                firstName = manNames[Math.floor(Math.random() * manNames.length)].split(",")[0];
                lastName = manLastNames[Math.floor(Math.random() * manLastNames.length)].split(",")[0];
            }
            else {
                firstName = womenNames[Math.floor(Math.random() * womenNames.length)].split(",")[0];
                lastName = womenLastNames[Math.floor(Math.random() * womenLastNames.length)].split(",")[0];
            }
            const diff = Number(data[0].max_salary) - Number(data[0].min_salary)
            const salary = Math.ceil(Math.random() * diff) + Number(data[0].min_salary);
            console.log(data);
            console.log(salary);
            createEmployee(firstName, lastName, salary, " ", " ", depId, employeeIndex)
    })
}
const createEmployee = (firstName, lastName, salary, hiringDate, firingDate, deparmentIndex, employeeIndex) => {
    fs.appendFile("./csv/employee.csv", `${firstName},${lastName},${salary},${hiringDate},${firingDate}`,(err) => {
        if (err) console.error("failed to append to employee.csv")
    })
}
const readNames = async () => {
    const manNames = (await readFile("./csv/8_-_WYKAZ_IMION_MĘSKICH_OSÓB_ŻYJĄCYCH_WG_POLA_IMIĘ_PIERWSZE_WYSTĘPUJĄCYCH_W_REJESTRZE_PESEL_BEZ_ZGONÓW.csv","utf8")).toString().split("\n")
    const womenNames = (await readFile("./csv/8_-_WYKAZ_IMION_ŻEŃSKICH_OSÓB_ŻYJĄCYCH_WG_POLA_IMIĘ_PIERWSZE_WYSTĘPUJĄCYCH_W_REJESTRZE_PESEL_BEZ_ZGONÓW.csv", "utf8")).toString().split("\n")
    console.log(manNames);
    const manLastNames = (await readFile("./csv/nazwiska_męskie-osoby_żyjące.csv", "utf8")).toString().split("\n")
    const womenLastNames = (await readFile("./csv/nazwiska_żeńskie-osoby_żyjące.csv", "utf8")).toString().split("\n");
    return {
        manNames,
        womenNames,
        manLastNames,
        womenLastNames
    }
}
getDepartmentsAndEmployees();