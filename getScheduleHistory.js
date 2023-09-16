import { appendFile, writeFile } from "node:fs/promises";
import { db, executeQuery } from "./getDbConnection.js";
import raiseAnError from "./utils/raiseAnError.js";
const handelDb = async () => {
    let query =  `USE SCHOOLPROJECT`;
    await executeQuery(query, "failed to connect to db");

    query = `DROP TABLE IF EXISTS SCHEDULEHISTORY`;
    await executeQuery(query, "failed to drop a table schdulehistory");
    
    query = `CREATE TABLE SCHEDULEHISTORY (
        car_id INT NOT NULL,
        house_id INT NOT NULL,
        schedule_id INT NOT NULL,
        employee_id INT NOT NULL
    )`;
    await executeQuery(query, "failed to create schedulehistory table");
    
}
const getAllSchedules = async () => {
    await handelDb();
    let query = `USE SCHOOLPROJECT`;
    executeQuery(query);
    query = `SELECT * FROM schedule`;

    db.query(query, (err, data) => {
        
        if (err){
            return raiseAnError("failed to fetch data from schedule");
        }
        getAllcars({
            schedule: data
        });
    })
}
const getAllcars  = (obtainedData) => {
    let query = `SELECT * FROM CARS`;

    db.query(query, (err, data) => {
        if (err) return raiseAnError(err);
        getHouses(
            {
                ...obtainedData,
                cars: data
            });
    })
}
const getHouses = (obtainedData) => {
    let query = `SELECT * FROM HOUSE`;
    db.query(query, async (err, data) => {
        if (err) return raiseAnError(err)
        await getEmployees(
            {
                ...obtainedData,
                houses: data
        });
    })
}
const getEmployees = async (obtainedData) => {
    await writeFile("./csv/scheduleHistory.csv", ""); // drop

    for await (const date of obtainedData.schedule) {
        const numberOfcars = Math.floor(Math.random() * 2) + 3;
        const usedCars = [];

        for (let i = 0; i < numberOfcars; i++){
            let randomCar = Math.floor(Math.random() * obtainedData.cars.length) + 1;

            while (usedCars.includes(randomCar)) randomCar = Math.floor(Math.random() * obtainedData.cars.length) + 1;
            usedCars.push(randomCar);
        }
        ObtainEmployees(date.date, usedCars, date.schedule_id, obtainedData.houses);
    }

}
const ObtainEmployees = (date, usedCars, scheduleId, houses) => {
    let query = `
    SELECT * FROM employees
    WHERE hiring_date <= '${date}' AND (firing_date is null OR firing_date > '${date}') AND job_id = 4 
    `;// fetch id from jobs insted of hard coded later 4 and 5 are those majorities neccessary for the business
    
    db.query(query, (err, drivers) => {
        
        if (err) 
            return raiseAnError(err);
        query = `
        SELECT * FROM employees
        WHERE hiring_date <= '${date}' AND (firing_date is null OR firing_date > '${date}') AND job_id = 5
        `;

        db.query(query, async (err, garbageMan) => {

            if (err) 
                return raiseAnError(err);
            await createRecord(drivers, garbageMan, usedCars, scheduleId, houses);     
        })
    })
    
}
const createRecord = async (drivers, garbageMan, usedCars, scheduleId, houses) => {
    const usedEmployees = [];
    const usedHouses  = [];

    for (const car of usedCars) {
        let randomDriver = Math.floor(Math.random() * drivers.length);
        let randomGarbageMan = Math.floor(Math.random() * garbageMan.length); // chosse random driver and garbage man
        
        while (usedEmployees.includes(drivers[randomDriver].employee_id)) 
            randomDriver = Math.floor(Math.random() * drivers.length); // checking for duplicates
        
        while (usedEmployees.includes(garbageMan[randomGarbageMan].employee_id))
            randomGarbageMan = Math.floor(Math.random() * garbageMan.length);

        usedEmployees.push(drivers[randomDriver].employee_id);
        usedEmployees.push(garbageMan[randomGarbageMan].employee_id);
        const randomNumberOfHouses = Math.floor(Math.random() * houses.length);

        for (let index = 0; index < randomNumberOfHouses; index++){
            let randomHouse = Math.floor(Math.random() * houses.length);
            
            while (usedHouses.includes(randomHouse)) randomHouse = Math.floor(Math.random() * houses.length); // checking for duplicates

            try {    
                await appendFile("./csv/scheduleHistory.csv", `${drivers[randomDriver].employee_id},${car},${houses[randomHouse].house_id},${scheduleId}\n`);
                await appendFile("./csv/scheduleHistory.csv", `${garbageMan[randomGarbageMan].employee_id},${car},${houses[randomHouse].house_id},${scheduleId}\n`);
            }
            catch(error){
                return raiseAnError(error);
            }
        }
        
    }

}
export default getAllSchedules; 