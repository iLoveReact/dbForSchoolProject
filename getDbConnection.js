import mysql from "mysql"
import raiseAnError from "./utils/raiseAnError.js";
export const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password:""
});

export const executeQuery = async (query, errorMessage) => {
    db.query(query, (err) => {
        if (err) raiseAnError(errorMessage, err);
    })
    
}