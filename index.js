import  getAllHousingAssociation from "./getHousingAssociations.js"
import getHouses from "./getHouses.js";
import createHouseAssociation from "./getHouseAssociation.js";
const getAllHousingAssociationRes =  await getAllHousingAssociation();
if (getAllHousingAssociationRes.error) console.error("an error has occured")
else console.log("failed to get all Housing Associations");
await getHouses(); // error handle by checking whether houses.csv exists
await createHouseAssociation();