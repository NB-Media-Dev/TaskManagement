// import mysql from "mysql2";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config({ path: path.join(__dirname, ".env") });
// dotenv.config({ path: path.join(__dirname, "process.env") });

// const db = mysql.createConnection({
//     host: process.env.DB_HOST || "localhost",
//     user: process.env.DB_USER || "root",
//     password: process.env.DB_PASSWORD || "",
//     database: process.env.DB_NAME || "react",
// });

// db.connect((err) => {
//     if (err) {
//         console.log("Database connection failed:", err.message);
//     } else {
//         console.log("MySQL Connected");
//         db.query("UPDATE attendance SET workhours = '00:00:00' WHERE workhours IS NULL OR workhours = '0h' OR workhours = ''", (updateErr) => {
//             if (updateErr) console.log("Row cleanup note:", updateErr.message);
//             db.query("ALTER TABLE attendance MODIFY COLUMN workhours VARCHAR(50) DEFAULT '00:00:00'", (alterErr) => {
//                 if (alterErr) console.log("Column alter note:", alterErr.message);
//             });
//         });
//     }
// });

// export default db;