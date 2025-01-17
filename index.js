import fs from "fs";
import getCars from "./getCars.js";
import getJobs from "./getJobs.js";
import getHouses from "./getHouses.js";
import getSchedule from "./getSchedule.js";
import getAllHousingAssociations from "./getHousingAssociations.js";
import getAnAssociationForHouse from "./getHouseAssociation.js";
import raiseAnError from "./utils/raiseAnError.js";
import getAllSchedules from "./getScheduleHistory.js";
import getDepartmentsAndEmployees from "./getDepartmentsAndEmployee.js";
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
const generate = async () => {
    await getHouses();
    
    if (!fs.existsSync("./csv/houses.csv"))
        return raiseAnError("failed getHouses.js");

    await getCars();
    
    if (!fs.existsSync("./csv/cars.csv"))
        return raiseAnError("failed getCars.js");
    
    await getJobs();
    await getSchedule();
    
    if (!fs.existsSync("./csv/schedule.csv"))
        return raiseAnError("failed getSchedule.js");
    
        await getAllHousingAssociations();
    
    if (!fs.existsSync("./csv/houseAssociation.csv"))
        return raiseAnError("failed getHousingAssociations.js");
    
    await getAnAssociationForHouse();
    await getDepartmentsAndEmployees();

    if (!fs.existsSync("./csv/employee.csv"))
        return raiseAnError("failed getDepartmentsAndEmployees.js");
    
    await getAllSchedules();
    await sleep(1000);
    if (!fs.existsSync("./csv/scheduleHistory.csv"))
        return raiseAnError("failed getScheduleHistory.js");
    console.log("finished");
    
}
await generate();