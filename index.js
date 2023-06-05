import  getAllHousingAssociation from "./getHousingAssociations.js"
import getHouses from "./getHouses.js";
import createHouseAssociation from "./getHouseAssociation.js";
const getAllHousingAssociationRes =  await getAllHousingAssociation();
if (getAllHousingAssociationRes.error) console.error("an error has occured")
await getHouses(); // error handle by checking whether houses.csv exists
// createHouseAssociation();