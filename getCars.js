import fs from "fs";
import puppeteer from "puppeteer";
import { db, executeQuery } from "./getDbConnection.js";

const createDb = async () =>  {
    let query = `USE schoolProject`;
    await executeQuery(query, "failed to use schoolProject db");
    
    query = "DROP TABLE IF EXISTS Cars";
    await executeQuery(query, "failed to drop the table cars");

    query = `
        CREATE TABLE Cars (
            car_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
            model VARCHAR(90) NOT NULL,
            status VARCHAR(30) NOT NULL,
            volume INT NOT NULL
        )
    `;
    await executeQuery(query, "failed to create car table");

    query = `
    LOAD DATA LOCAL INFILE './csv/cars.csv' 
    INTO TABLE Cars FIELDS TERMINATED BY ','
    (car_id, model, status, volume)
    `
    await executeQuery(query, "failed to populate cars");
}

const getCars =  async () => {
    createDb();
    let index = 0;
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    await page.goto(
    'https://mart.ecer.com/lpggastankertruck/c1614735-garbage-compactor-truck?ads=s&am=mart&site=1&adcid=18271609807&adgid=143855231991&loc=1011615&kwd=garbage%20truck%20for%20sale&tid=kwd-187783929&mctp=p&rank=&net=g&gclid=Cj0KCQjw7PCjBhDwARIsANo7CgkmxHf9han5Kp6jJmOsKdiZ2sM3KiEJeBcCgX-9izaRM6MzBJNP0L8aApxFEALw_wcB',
    {
        waitUntil: 'load',
        timeout: 0
    });     

    const titles = await page.$$(".product-component__title");
    fs.writeFile("./csv/cars.csv", "", (err) => {
        console.error(err);
    });

    for (const title of titles) {

        const model = await title.evaluate(t => t.textContent.trim().replace(",",""));
        const volume = Math.floor(Math.random() * 5001) + 3000; // 8 tons is the max for the truck
        
        for (let i = 0; i < Math.ceil(Math.random() * 3) + 1; i++) {
            let status = Math.floor(Math.random() * 100);
            status = status % 2 == 0 ? "T" : "N"; // deciding whether it is availible at the moment or not
            
            fs.appendFile(
                "./csv/cars.csv", `${++index},${model},${status},${volume}\n`, (err) => {
                    console.error(err);
                }
            )
        }
        
    }
    await browser.close();

}
getCars();