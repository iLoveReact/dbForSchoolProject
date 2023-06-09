import { appendFile, writeFile } from "node:fs/promises";
import { db, executeQuery } from "./getDbConnection.js";
const getHistory = () => {

}
const handelDb = () => {
    let query =  `USE SCHOOLPROJECT`;
    executeQuery(query, "failed to connect to db");

    query = `
    LOAD DATA LOCAL INFILE './csv/employee.csv' 
    INTO TABLE employees FIELDS TERMINATED BY ','
    (employee_id, firstname, lastname, salary, hiring_date, firing_date, job_id)
    `
    executeQuery(query, "failed to populate employees")

    query = `DROP TABLE IF EXISTS SCHEDULEHISTORY`;
    executeQuery(query, "failed to drop a table schdulehistory");
    
    query = `CREATE TABLE SCHEDULEHISTORY (
        car_id INT NOT NULL,
        house_id INT NOT NULL,
        schedule_id INT NOT NULL,
        employee_id INT NOT NULL
    )`
    executeQuery(query, "failed to create schedulehisory table")

}
handelDb();
const getAllSchedules = () => {
    let query = `USE SCHOOLPROJECT`
    executeQuery(query)

    query = `SELECT * FROM schedule`
    db.query(query, (err, data) => {
        if  (err){
            return console.error("failed to fetch data from schedule")
        }
        getAllcars(
            {
                schedule:data
            })
    })
}
const getAllcars  = (obtainedData) => {
    let query = `SELECT * FROM CARS`
    db.query(query, (err, data) => {
        if (err) return console.error(err);
        getHouses(
            {
                ...obtainedData,
                cars: data
            })
    })
}
const getHouses = (obtainedData) => {
    let query = `SELECT * FROM HOUSE`;
    db.query(query, (err, data) => {
        if (err) return  console.error(err)
        getEmployees(
            {
                ...obtainedData,
                houses: data
        })
    })
}
const getEmployees = async (obtainedData) => {
    await writeFile("./csv/schduleHistory.csv", "") // drop\
    for await (const date of obtainedData.schedule) {
        const numberOfcars = Math.floor(Math.random() * 2) + 3;
        const usedCars = []
        for (let i = 0; i < numberOfcars; i++){
            let randomCar = Math.floor(Math.random() * obtainedData.cars.length) + 1
            while (usedCars.includes(randomCar)) randomCar = Math.floor(Math.random() * obtainedData.cars.length) + 1
            usedCars.push(randomCar)
        }
        await ObtainEmployees(date.date, usedCars, date.schedule_id, obtainedData.houses)
    }

}
const ObtainEmployees = (date, usedCars, scheduleId, houses) => {
    let query = `
    SELECT * FROM employees
    WHERE hiring_date <= '${date}' AND (firing_date = "" OR firing_date > '${date}') AND job_id = 4 
    `// fetch id from jobs insted of hard coded later
    db.query(query, (err, drivers) => {
        if (err) return console.error(err)
        query = `
        SELECT * FROM employees
        WHERE hiring_date <= '${date}' AND (firing_date = "" OR firing_date > '${date}') AND job_id = 5 
        `
        console.log(query);
        db.query(query, (err, garbageMan) => {
            if (err) return console.error(err)
            console.log(garbageMan, "here");
            createRecord(drivers, garbageMan, usedCars, scheduleId, houses)        
        })
    })
    
}
const createRecord = async (drivers, garbageMan, usedCars, scheduleId, houses) => {
    const usedEmployees = [];
    const usedHouses  = [];
    for (const car of usedCars) {
        //console.log("another car");
        let randomDriver = Math.floor(Math.random() * drivers.length)
        let randomGarbageMan = Math.floor(Math.random() * garbageMan.length)
        while (usedEmployees.includes(drivers[randomDriver].employee_id)) randomDriver = Math.floor(Math.random() * drivers.length);
        while (usedEmployees.includes(garbageMan[randomGarbageMan].employee_id)) randomGarbageMan = Math.floor(Math.random() * garbageMan.length);
        usedEmployees.push(drivers[randomDriver].employee_id)
        usedEmployees.push(garbageMan[randomGarbageMan].employee_id)
        const randomNumberOfHouses = Math.floor(Math.random() * houses.length)
        for (let index = 0; index < randomNumberOfHouses; index++){
            let randomHouse = Math.floor(Math.random() * houses.length)
            while (usedHouses.includes(randomHouse)) randomHouse = Math.floor(Math.random() * houses.length)
            //console.log(scheduleId, randomDriver, randomGarbageMan, randomHouse, car);

            //console.log(garbageMan[randomGarbageMan].employee_id, houses[randomHouse].house_id);
            try {
                
                await appendFile("./csv/schduleHistory.csv", `${garbageMan[randomGarbageMan].employee_id},${drivers[randomDriver].employee_id},${houses[randomHouse].house_id},${scheduleId}\n`)
            }
            catch(error){
                return console.error(error)
            }
        }
        
    }

}
getAllSchedules();