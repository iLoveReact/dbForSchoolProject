import  puppeteer from "puppeteer";
import {appendFile, writeFile} from "node:fs"
const getAllHousingAssociation = async () => {
    const result = [];
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    let error = false;
    await page.goto(
    'https://www.samconveyancing.co.uk/news/conveyancing/list-of-housing-associations-in-london-4384',
    {
        waitUntil: 'load',
        timeout: 0
    });     
    const elements = await page.$$("b");
    let index = 0;
    writeFile("./csv/houseAssociation.csv", "", (err) => { // drop if exists
        if (err)console.error(err);
    })
    for (const element of elements){
        const value = await element.evaluate(e => e.textContent)
        if (!isNaN(value[0])) break
        result.push(value)    
        appendFile("./csv/houseAssociation.csv",`${++index}, ${value} \n`, (err) => {
            if (err) {
                browser.close();
                error = true
                return  console.error("failed to append house Association to the file");
            } 
        })
    }

    await browser.close();
    return  {
        error
    }
}  
export default getAllHousingAssociation;