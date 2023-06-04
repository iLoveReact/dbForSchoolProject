import mysql from "mysql"
export const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password:""
});

export const executeQuery = async (query, errorMessage, values = []) => {
    db.query(query, [values], (err, result) => {
        if (err) console.error(err);
    })
    
}