import mysql from "mysql"
export const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password:""
});

export const executeQuery = async (query, errorMessage) => {
    db.query(query, (err, result) => {
        if (err) console.error(err);
    })
    
}