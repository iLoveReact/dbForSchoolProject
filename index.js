import  getAllHousingAssociation from "./getHousingAssociations.js"
const result =  await getAllHousingAssociation();
if (!result.error) console.log(result);
else console.log("failed to get all Housing Associations");