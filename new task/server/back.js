import express from "express";
import cors from "cors";
import mysql from "mysql2";
const app = express();
app.disable('x-powered-by');

const ALLOWED_ORIGINS = new Set([process.env.FRONTEND_URL || "http://localhost:5173","http://localhost:5174","http://localhost:5175", "https://yourdomain.com"]);
app.use(cors({
    origin: function(origin, callback) {
        if(!origin) return callback(null,true);
        if (ALLOWED_ORIGINS.has(origin)) {
            return callback(null, true);
        }
        else{
            console.log(`CORS BLOCKED ORIGIN : ${origin}`);
            return callback(new Error('Not Allowed by cors'));
        }
        
    },
    methods: ["GET", "POST", "PUT", "DELETE","OPTIONS"],
    credentials: true,
    allowedHeaders:["Content-Type" , "Authorization"]
}));
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Deepak@8428",
    database: process.env.DB_NAME || "react",
});
db.connect((err) => {
    if (err) {
        console.log("MySQL connection failed:", err.message);
    }
    else {
        console.log("MySQL Connected");
       
        db.query("UPDATE attendance SET workhours = '00:00:00' WHERE workhours IS NULL OR workhours = '0h' OR workhours = ''", (updateErr) => {
            if (updateErr) console.log("Row cleanup note:", updateErr.message);
           
            db.query("ALTER TABLE attendance MODIFY COLUMN workhours VARCHAR(50) DEFAULT '00:00:00'", (alterErr) => {
                if (alterErr) {
                    console.log("Column alter note:", alterErr.message);
                } else {
                    console.log("Successfully converted attendance workhours column to VARCHAR(50)");
                }
            });
        });

        
        db.query("ALTER TABLE assign ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending'", (assignErr) => {
            if (assignErr) console.log("Assign status note:", assignErr.message);
        });
        db.query("ALTER TABLE assign ADD COLUMN assign_date DATETIME DEFAULT CURRENT_TIMESTAMP", (dateErr) => {
            if (dateErr) console.log("Assign date note:", dateErr.message);
        });
        db.query("ALTER TABLE assign ADD COLUMN remarks TEXT", (remarksErr) => {
            if (remarksErr) console.log("Assign remarks note:", remarksErr.message);
        });
        db.query("ALTER TABLE assign ADD COLUMN daily_update TEXT", (dailyErr) => {
            if (dailyErr) console.log("Assign daily_update note:", dailyErr.message);
        });
        db.query("ALTER TABLE assign ADD COLUMN tl_reply TEXT", (tlErr) => {
            if (tlErr) console.log("Assign tl_reply note:", tlErr.message);
        });
        db.query("ALTER TABLE assign ADD COLUMN performance TEXT", (perfErr) => {
            if (perfErr) console.log("Assign performance note:", perfErr.message);
        });
        db.query("ALTER TABLE assign ADD COLUMN team_name VARCHAR(100)", (teamErr) => {
            if (teamErr) console.log("Assign team_name note:", teamErr.message);
        });
        db.query("ALTER TABLE assign ADD COLUMN assign_id INT AUTO_INCREMENT PRIMARY KEY", (idErr) => {
            if (idErr) console.log("Assign ID note:", idErr.message);
        });
        db.query("ALTER TABLE employee ADD COLUMN IF NOT EXISTS position VARCHAR(50) DEFAULT 'Employee'", (empPosErr) => {
            if (empPosErr) {
                db.query("ALTER TABLE employee ADD COLUMN position VARCHAR(50) DEFAULT 'Employee'", (empPosErr2) => {
                    if (empPosErr2) console.log("Employee position note:", empPosErr2.message);
                });
            }
        });
        db.query("ALTER TABLE employee ADD COLUMN IF NOT EXISTS previous_role VARCHAR(50)", (empPrevErr) => {
            if (empPrevErr) {
                db.query("ALTER TABLE employee ADD COLUMN previous_role VARCHAR(50)", (empPrevErr2) => {
                    if (empPrevErr2) console.log("Employee previous_role note:", empPrevErr2.message);
                });
            }
        });
        db.query("ALTER TABLE employee ADD COLUMN IF NOT EXISTS designation VARCHAR(100)", (empDesErr) => {
            if (empDesErr) {
                db.query("ALTER TABLE employee ADD COLUMN designation VARCHAR(100)", (empDesErr2) => {
                    if (empDesErr2) console.log("Employee designation note:", empDesErr2.message);
                });
            }
        });

        db.query("CREATE UNIQUE INDEX idx_emp_email ON employee (emp_email)", (uniqErr1) => {
            if (uniqErr1) console.log("emp_email index note:", uniqErr1.message);
        });
        db.query("CREATE UNIQUE INDEX idx_u_email ON users (u_email)", (uniqErr2) => {
            if (uniqErr2) console.log("u_email index note:", uniqErr2.message);
        });

        const createNotifTableSql = `
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                recipient_email VARCHAR(255) NOT NULL,
                sender_role VARCHAR(50),
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50),
                is_read TINYINT(1) DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        db.query(createNotifTableSql, (notifErr) => {
            if (notifErr) console.log("Notifications table note:", notifErr.message);
            else console.log("Notifications table ready");

            const notifColumns = [
                { name: "recipient_email", spec: "VARCHAR(255) NULL DEFAULT NULL" },
                { name: "receiver_email", spec: "VARCHAR(255) NULL DEFAULT NULL" },
                { name: "sender_role", spec: "VARCHAR(50)" },
                { name: "title", spec: "VARCHAR(255)" },
                { name: "message", spec: "TEXT" },
                { name: "type", spec: "VARCHAR(50)" },
                { name: "task_id", spec: "INT NULL DEFAULT NULL" },
                { name: "is_read", spec: "TINYINT(1) DEFAULT 0" },
                { name: "created_at", spec: "DATETIME DEFAULT CURRENT_TIMESTAMP" }
            ];

            notifColumns.forEach(col => {
                db.query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS ${col.name} ${col.spec}`, (colErr) => {
                    if (colErr) {
                        db.query(`ALTER TABLE notifications ADD COLUMN ${col.name} ${col.spec}`, (colErr2) => {
                           
                        });
                    }
                });
            });

           
            db.query("ALTER TABLE notifications MODIFY COLUMN receiver_email VARCHAR(255) NULL DEFAULT NULL", (modErr) => {
                if (modErr) console.log("receiver_email modify note:", modErr.message);
            });
            db.query("ALTER TABLE notifications MODIFY COLUMN recipient_email VARCHAR(255) NULL DEFAULT NULL", (modErr2) => {
                if (modErr2) console.log("recipient_email modify note:", modErr2.message);
            });


            db.query("SELECT COUNT(*) as count FROM notifications", (countErr, countRes) => {
                if (!countErr && countRes && countRes[0].count === 0) {
                    sendNotification('Admin', 'System', 'Welcome to Task Management System', 'Notification system is active and ready.', 'SYSTEM');
                }
            });
        });
    }
});

function validateNameBackend(name, fieldName = "Name") {
    if (!name || String(name).trim() === '') {
        return `${fieldName} is required and cannot be empty or only spaces.`;
    }
    const trimmed = String(name).trim();
    if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
        return `${fieldName} should contain only letters and spaces.`;
    }
    return null;
}

function validateEmailBackend(email) {
    if (!email || String(email).trim() === '') {
        return "Email address is required.";
    }
    const trimmed = String(email).trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(trimmed)) {
        return "Please enter a valid email address.";
    }
    return null;
}

function validatePasswordBackend(password) {
    if (!password || String(password).trim() === '') {
        return "Password is required.";
    }
    const str = String(password);
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passRegex.test(str)) {
        return "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.";
    }
    return null;
}
app.post("/create", (req, res) => {
    const { username, email, password, role } = req.body;

    const nameErr = validateNameBackend(username, "User name");
    if (nameErr) return res.json({ success: false, message: nameErr });

    const emailErr = validateEmailBackend(email);
    if (emailErr) return res.json({ success: false, message: emailErr });

    const passErr = validatePasswordBackend(password);
    if (passErr) return res.json({ success: false, message: passErr });

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanUsername = String(username).trim();

    const proceedWithUserCreate = () => {
        const checkSql = "SELECT * FROM users WHERE LOWER(TRIM(u_email))=?";
        db.query(checkSql, [cleanEmail], (err, result) => {
            if (err) {
                return res.json({
                    success: false,
                    message: err.message
                });
            }
            if (result.length > 0) {
                return res.json({
                    success: false,
                    message: "An employee with this email address already exists."
                });
            }
            const insertSql =
                "INSERT INTO users(u_name,u_email,u_password,u_role) VALUES(?,?,?,?)";
            db.query(
                insertSql,
                [
                    cleanUsername,
                    cleanEmail,
                    password,
                    role
                ],
                (err, result) => {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err.message
                        });
                    }
                    res.json({
                        success: true,
                        message: "Account created"
                    });
                }
            );
        });
    };

    if (role === 'Employee') {
        const empCheckSql = "SELECT * FROM employee WHERE LOWER(TRIM(emp_email))=?";
        db.query(empCheckSql, [cleanEmail], (empErr, empResult) => {
            if (empErr) {
                return res.json({
                    success: false,
                    message: empErr.message
                });
            }
            if (empResult.length === 0) {
                return res.json({
                    success: false,
                    message: "Email address not authorized by Admin. Please ask your Admin to register your employee email first."
                });
            }
            proceedWithUserCreate();
        });
    } else {
        proceedWithUserCreate();
    }
});
app.post("/Login", (req,res)=>{
    const {email,password,role}=req.body;

    if(!email || !password || !role){
        return res.json({
            success:false,
            message:"Email password and role required"
        });
    }
    

    const sql = `
        SELECT 
            u_name,
            u_email,
            u_password,
            u_role
        FROM users
        WHERE LOWER(TRIM(u_email))=LOWER(TRIM(?))
    `;

    db.query(sql,[email],(err,userRows)=>{

        if(err){
            return res.json({
                success:false,
                message:err.message
            });
        }

        if(userRows.length===0){
            return res.json({
                success:false,
                message:"User not found"
            });
        }
        const user=userRows[0];
        if(user.u_password !== password){

            return res.json({
                success:false,
                message:"Invalid password"
            });

        }
        if(user.u_role==="Admin"){

            if(role!=="Admin"){

                return res.json({
                    success:false,
                    message:"Please select Admin login"
                });

            }
            return res.json({
                success:true,
                user:{
                    name:user.u_name,
                    email:user.u_email,
                    role:"Admin"
                }
            });

        }
        const empSql=`

            SELECT 
                emp_name,
                emp_role,
                position
            FROM employee
            WHERE emp_email=?

        `;
        db.query(empSql,[email],(err,empRows)=>{
            if(err){
                return res.json({
                    success:false,
                    message:err.message
                });
            }
            if(empRows.length===0){
                return res.json({
                    success:false,
                    message:"Employee record not found"
                });

            }
            const employee=empRows[0];
            const actualRole =
                employee.position==="TL"
                ? "TL" : "Employee";

            if(role==="Employee" && actualRole==="TL"){
                return res.json({

                    success:false,

                    message:
                    "You are a Team Leader. Please login using TL role"

                });

            }
            if(role==="TL" && actualRole!=="TL"){
                return res.json({
                    success:false,
                    message:
                    "You are not a Team Leader"

                });
            }
            return res.json({
             success:true,
                user:{
                    name:employee.emp_name,
                    email:user.u_email,
                    role:actualRole,
                    emp_role:employee.emp_role,
                    position:employee.position
                }
            });
        });
    });

});
app.post("/forget", (req, res) => {
    const { email, password } = req.body;

    const emailErr = validateEmailBackend(email);
    if (emailErr) return res.json({ success: false, message: emailErr });

    const passErr = validatePasswordBackend(password);
    if (passErr) return res.json({ success: false, message: passErr });

    const checkSql = "SELECT * FROM users WHERE u_email=?";
    db.query(checkSql, [email], (err, result) => {
        if (err) {
            return res.json({
                success: false,
                message: err.message
            });
        }
        if (result.length === 0) {
           
            const empSql = "SELECT * FROM employee WHERE emp_email=?";
            db.query(empSql, [email], (err, empResult) => {
                if (err) {
                    return res.json({
                        success: false,
                        message: err.message
                    });
                }
                if (empResult.length === 0) {
                    return res.json({
                        success: false,
                        message: "Email not found in employee records"
                    });
                }
               const emp=empResult[0];
                const empName = empResult[0].emp_name || email.split('@')[0];
                const insertSql = "INSERT INTO users(u_name,u_email,u_password,u_role) VALUES(?,?,?,?)";
                db.query(insertSql, [empName, email, password, emp.emp_role || "Employee"], (err) => {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err.message
                        });
                    }
                    return res.json({
                        success: true,
                        message: "Password set! Account activated for employee"
                    });
                });
            });
            return;
        }
        const updateSql = "UPDATE users SET u_password=? WHERE u_email=?";
        db.query(
            updateSql,
            [
                password,
                email
            ],
            (err) => {
                if (err) {
                    return res.json({
                        success: false,
                        message: err.message
                    });
                }
                res.json({
                    success: true,
                    message: "Password changed"
                });
            }
        );
    });
});


function syncUserCredentials(name, email, userPassword, role = "Employee") {
    const checkUserSql = "SELECT * FROM users WHERE u_email=?";
    db.query(checkUserSql, [email], (err, userRes) => {
        if (!err && userRes.length === 0) {
            const insertUserSql = "INSERT INTO users(u_name,u_email,u_password,u_role) VALUES(?,?,?,?)";
            db.query(insertUserSql, [name, email, userPassword, role], (err) => {
                if (err) console.log("User creation note:", err.message);
            });
        } else if (!err && userRes.length > 0) {
            const updateUserSql = "UPDATE users SET u_name=?, u_password=?, u_role=? WHERE u_email=?";
            db.query(updateUserSql, [name, userPassword, role, email], (err) => {
                if (err) console.log("User update note:", err.message);
            });
        }
    });
}

function sendNotification(recipientEmail, senderRole, title, message, type, taskId = null) {
    if (!recipientEmail) return;

    const sqlBoth = `
        INSERT INTO notifications (recipient_email, receiver_email, sender_role, title, message, type, task_id, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())
    `;
    db.query(sqlBoth, [recipientEmail, recipientEmail, senderRole || 'System', title, message, type || 'GENERAL', taskId], (errBoth) => {
        if (!errBoth) return;

        const sqlRecipient = `
            INSERT INTO notifications (recipient_email, sender_role, title, message, type, task_id, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 0, NOW())
        `;
        db.query(sqlRecipient, [recipientEmail, senderRole || 'System', title, message, type || 'GENERAL', taskId], (errRec) => {
            if (!errRec) return;

            const sqlReceiver = `
                INSERT INTO notifications (receiver_email, sender_role, title, message, type, is_read, created_at)
                VALUES (?, ?, ?, ?, ?, 0, NOW())
            `;
            db.query(sqlReceiver, [recipientEmail, senderRole || 'System', title, message, type || 'GENERAL'], (errRecv) => {
                if (errRecv) console.log("Notification Insert Error:", errRecv.message);
            });
        });
    });
}

function notifyTLForRole(empRole, senderRole, title, message, type, taskId = null) {
    const roleVal = empRole || '';
    const findTlSql = `
        SELECT emp_email FROM employee 
        WHERE position = 'TL' AND (LOWER(emp_role) = LOWER(?) OR LOWER(previous_role) = LOWER(?))
    `;
    db.query(findTlSql, [roleVal, roleVal], (err, rows) => {
        if (!err && rows && rows.length > 0) {
            const sentEmails = new Set();
            rows.forEach(r => {
                if (r.emp_email && !sentEmails.has(r.emp_email)) {
                    sentEmails.add(r.emp_email);
                    sendNotification(r.emp_email, senderRole, title, message, type, taskId);
                }
            });
        } else {
            const fallbackSql = `
                SELECT u_email FROM users WHERE u_role = 'TL' OR LOWER(u_role) = LOWER(?)
            `;
            db.query(fallbackSql, [roleVal], (err2, userRows) => {
                if (!err2 && userRows && userRows.length > 0) {
                    const sentEmails = new Set();
                    userRows.forEach(u => {
                        if (u.u_email && !sentEmails.has(u.u_email)) {
                            sentEmails.add(u.u_email);
                            sendNotification(u.u_email, senderRole, title, message, type, taskId);
                        }
                    });
                } else {
                    sendNotification('TL', senderRole, title, message, type, taskId);
                }
            });
        }
    });
}

function notifyAdmins(senderRole, title, message, type, taskId = null) {
    const findAdminSql = "SELECT u_email FROM users WHERE u_role = 'Admin'";
    db.query(findAdminSql, (err, rows) => {
        const sentEmails = new Set(['Admin']);
        sendNotification('Admin', senderRole, title, message, type, taskId);
        if (!err && rows && rows.length > 0) {
            rows.forEach(r => {
                if (r.u_email && !sentEmails.has(r.u_email)) {
                    sentEmails.add(r.u_email);
                    sendNotification(r.u_email, senderRole, title, message, type, taskId);
                }
            });
        }
    });
}

function checkAndCreateOverdueNotifications() {
    const overdueSql = `
        SELECT 
            assign_id,
            task_name,
            assign_to,
            roles,
            team_name,
            DATE_FORMAT(deadline, '%Y-%m-%d') AS deadline_str,
            IFNULL(status, 'Pending') AS status
        FROM assign
        WHERE deadline IS NOT NULL 
          AND DATE(deadline) < CURDATE()
          AND LOWER(IFNULL(status, '')) NOT LIKE '%complete%'
    `;

    db.query(overdueSql, (err, tasks) => {
        if (err || !tasks || tasks.length === 0) return;

        tasks.forEach((t) => {
            const taskId = t.assign_id;
            const taskName = t.task_name;
            const assignTo = t.assign_to;
            const taskRole = t.team_name || t.roles || 'General';
            const deadlineStr = t.deadline_str || '';

            const sendIfNotExists = (targetEmail, senderRole, title, message) => {
                if (!targetEmail) return;
                const cleanTarget = String(targetEmail).trim().toLowerCase();
                const checkSql = `
                    SELECT id FROM notifications 
                    WHERE type = 'TASK_OVERDUE' 
                      AND task_id = ? 
                      AND (LOWER(TRIM(recipient_email)) = ? OR LOWER(TRIM(receiver_email)) = ?)
                      AND DATE(created_at) = CURDATE()
                `;
                db.query(checkSql, [taskId, cleanTarget, cleanTarget], (cErr, cRows) => {
                    if (!cErr && (!cRows || cRows.length === 0)) {
                        sendNotification(targetEmail, senderRole || 'System', title, message, 'TASK_OVERDUE', taskId);
                    }
                });
            };

          
            const empSearchSql = "SELECT emp_name, emp_email FROM employee WHERE emp_name = ? OR emp_email = ? OR CAST(emp_id AS CHAR) = ?";
            db.query(empSearchSql, [assignTo, assignTo, assignTo], (eErr, eRows) => {
                let empName = assignTo;
                let empEmail = assignTo;

                if (!eErr && eRows && eRows.length > 0) {
                    if (eRows[0].emp_name) empName = eRows[0].emp_name;
                    if (eRows[0].emp_email) empEmail = eRows[0].emp_email;
                }

                const empTitle = `Overdue Task Alert: ${taskName}`;
                const empMsg = `Hi ${empName}, your task "${taskName}" is overdue. Deadline was ${deadlineStr}.`;
                sendIfNotExists(empEmail, 'System', empTitle, empMsg);

                
                const findTlSql = `
                    SELECT emp_name, emp_email FROM employee 
                    WHERE position = 'TL' AND (LOWER(emp_role) = LOWER(?) OR LOWER(previous_role) = LOWER(?))
                `;
                db.query(findTlSql, [taskRole, taskRole], (tlErr, tlRows) => {
                    if (!tlErr && tlRows && tlRows.length > 0) {
                        tlRows.forEach(r => {
                            if (r.emp_email) {
                                const tlName = r.emp_name || 'Team Lead';
                                const tlTitle = `Overdue Alert: ${empName} - ${taskName}`;
                                const tlMsg = `Hi ${tlName}, task "${taskName}" assigned to ${empName} is overdue. Deadline was ${deadlineStr}.`;
                                sendIfNotExists(r.emp_email, 'System', tlTitle, tlMsg);
                            }
                        });
                    } else {
                        const fallbackSql = `SELECT u_name, u_email FROM users WHERE u_role = 'TL' OR LOWER(u_role) = LOWER(?)`;
                        db.query(fallbackSql, [taskRole], (uErr, uRows) => {
                            if (!uErr && uRows && uRows.length > 0) {
                                uRows.forEach(u => {
                                    if (u.u_email) {
                                        const tlName = u.u_name || 'Team Lead';
                                        const tlTitle = `Overdue Alert: ${empName} - ${taskName}`;
                                        const tlMsg = `Hi ${tlName}, task "${taskName}" assigned to ${empName} is overdue. Deadline was ${deadlineStr}.`;
                                        sendIfNotExists(u.u_email, 'System', tlTitle, tlMsg);
                                    }
                                });
                            } else {
                                const tlTitle = `Overdue Alert: ${empName} - ${taskName}`;
                                const tlMsg = `Task "${taskName}" assigned to ${empName} is overdue. Deadline was ${deadlineStr}.`;
                                sendIfNotExists('TL', 'System', tlTitle, tlMsg);
                            }
                        });
                    }
                });
            });
        });
    });
}

setInterval(checkAndCreateOverdueNotifications, 60000);

function formatEmpId(val) {
    if (!val) return 'EMP-101';
    const str = String(val).trim();
    const upper = str.toUpperCase();
    if (upper.startsWith('EMP')) {
        const numPart = upper.replace(/^EMP-?/, '');
        const n = parseInt(numPart, 10);
        if (!isNaN(n)) {
            const finalNum = n < 100 ? n + 100 : n;
            return `EMP-${String(finalNum).padStart(3, '0')}`;
        }
        return str;
    }
    const match = str.match(/\d+/);
    if (match) {
        const n = parseInt(match[0], 10);
        const finalNum = n < 100 ? n + 100 : n;
        return `EMP-${String(finalNum).padStart(3, '0')}`;
    }
    return `EMP-${str}`;
}

app.get("/next-emp-id", (req, res) => {
    const sql = "SELECT emp_id FROM employee";
    db.query(sql, (err, result) => {
        if (err) {
            return res.json({ success: true, nextId: "EMP-101" });
        }
        let maxNum = 100;
        if (result && Array.isArray(result)) {
            result.forEach((row) => {
                if (row.emp_id) {
                    const match = String(row.emp_id).match(/\d+/);
                    if (match) {
                        const num = parseInt(match[0], 10);
                        if (!isNaN(num) && num > maxNum) {
                            maxNum = num;
                        }
                    }
                }
            });
        }
        const nextId = formatEmpId(maxNum + 1);
        res.json({ success: true, nextId });
    });
});

app.post("/AddEmployee", (req, res) => {
    const { id, name, email, phone, gender, role, password } = req.body;

    const nameErr = validateNameBackend(name, "Employee Name");
    if (nameErr) return res.json({ success: false, message: nameErr });

    const emailErr = validateEmailBackend(email);
    if (emailErr) return res.json({ success: false, message: emailErr });

    const passErr = validatePasswordBackend(password);
    if (passErr) return res.json({ success: false, message: passErr });

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    const checkEmailSql = "SELECT * FROM employee WHERE LOWER(TRIM(emp_email)) = ?";
    db.query(checkEmailSql, [cleanEmail], (empErr, empRes) => {
        if (empErr) {
            return res.json({
                success: false,
                message: empErr.message
            });
        }

        if (empRes.length > 0) {
            return res.json({
                success: false,
                message: "An employee with this email address already exists."
            });
        }

        const getNextIdSql = "SELECT emp_id FROM employee";
        db.query(getNextIdSql, (idErr, idRes) => {
            let maxNum = 100;
            if (!idErr && idRes && Array.isArray(idRes)) {
                idRes.forEach((row) => {
                    if (row.emp_id) {
                        const match = String(row.emp_id).match(/\d+/);
                        if (match) {
                            const num = parseInt(match[0], 10);
                            if (!isNaN(num) && num > maxNum) {
                                maxNum = num;
                            }
                        }
                    }
                });
            }

            const targetId = formatEmpId(id || (maxNum + 1));

            const insertSql = `
                INSERT INTO employee
                (
                    emp_id,
                    emp_name,
                    emp_email,
                    emp_phone,
                    emp_gender,
                    emp_role,
                    position
                )
                VALUES
                (?,?,?,?,?,?,'Employee')
            `;

            db.query(
                insertSql,
                [
                    targetId,
                    cleanName,
                    cleanEmail,
                    phone,
                    gender,
                    role || "Employee"
                ],
                (err, result) => {
                    if (err) {
                        if (err.message.includes("Duplicate") || err.code === "ER_DUP_ENTRY") {
                            if (err.message.includes("emp_email") || err.message.toLowerCase().includes("email")) {
                                return res.json({
                                    success: false,
                                    message: "An employee with this email address already exists."
                                });
                            }
                            const fallbackId = formatEmpId(maxNum + 1);
                            db.query(insertSql, [fallbackId, cleanName, cleanEmail, phone, gender, role || "Employee"], (err2) => {
                                if (err2) return res.json({ success: false, message: err2.message });
                                const userPassword = password || phone || "123456";
                                syncUserCredentials(cleanName, cleanEmail, userPassword, role || "Employee");
                                notifyTLForRole(role || "Employee", "Admin", `New ${role || "Team"} Member Added`, `Admin added new ${role || "Employee"} employee "${cleanName}" (${cleanEmail}) to your team.`, "EMPLOYEE_ADDED");
                                return res.json({ success: true, message: "Employee Added successfully" });
                            });
                            return;
                        }
                        return res.json({
                            success: false,
                            message: err.message
                        });
                    }

                    const userPassword = password || phone || "123456";
                    syncUserCredentials(
                        cleanName,
                        cleanEmail,
                        userPassword,
                        role || "Employee"
                    );

                    notifyTLForRole(
                        role || "Employee",
                        "Admin",
                        `New ${role || "Team"} Member Added`,
                        `Admin added new ${role || "Employee"} employee "${cleanName}" (${cleanEmail}) to your team.`,
                        "EMPLOYEE_ADDED"
                    );

                    res.json({
                        success: true,
                        message: "Employee Added successfully"
                    });
                }
            );
        });
    });
});
app.get("/AdminEmployee", (req, res) => {
    const { id } = req.query;

    let sql = `
        SELECT 
            e.emp_id,
            e.emp_name,
            e.emp_email,
            e.emp_phone,
            e.emp_gender,
            
           e.emp_role,
            IFNULL(e.position,'Employee') AS position,
            e.previous_role,
            IFNULL(u.u_password, e.emp_phone) AS password
        FROM employee e
        LEFT JOIN users u ON e.emp_email = u.u_email
        WHERE 1=1
    `;

    let values = [];

    if (id) {
        sql += " AND (CAST(e.emp_id AS CHAR) LIKE ? OR e.emp_name LIKE ? OR e.emp_email LIKE ?)";
        values.push("%" + id + "%", "%" + id + "%", "%" + id + "%");
    }

    db.query(sql, values, (err, result) => {
        if (err) {
        
            let fallbackSql = "SELECT *, emp_phone AS password FROM employee WHERE 1=1";
            let fallbackValues = [];
            if (id) {
                fallbackSql += " AND (CAST(emp_id AS CHAR) LIKE ? OR emp_name LIKE ?)";
                fallbackValues.push("%" + id + "%", "%" + id + "%");
            }
            db.query(fallbackSql, fallbackValues, (err2, result2) => {
                if (err2) return res.status(500).json({ success: false, message: err2.message });
                return res.json({ success: true, data: result2 });
            });
            return;
        }

        res.json({
            success: true,
            data: result
        });
    });
});

app.delete("/DeleteEmployee/:id", (req, res) => {
    const { id } = req.params;

    const findEmpSql = "SELECT emp_email, emp_name FROM employee WHERE CAST(emp_id AS CHAR)=? OR emp_id=?";
    db.query(findEmpSql, [String(id), id], (findErr, findRows) => {
        const empEmail = (!findErr && findRows && findRows.length > 0) ? findRows[0].emp_email : null;
        const empName = (!findErr && findRows && findRows.length > 0) ? findRows[0].emp_name : null;

        const sql = "DELETE FROM employee WHERE CAST(emp_id AS CHAR)=? OR emp_id=?";
        db.query(sql, [String(id), id], (err, result) => {
            if (err) {
                return res.json({
                    success: false,
                    message: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.json({
                    success: false,
                    message: "Employee not found"
                });
            }

            if (empEmail) {
                db.query("DELETE FROM users WHERE u_email=?", [empEmail], (userErr) => {
                    if (userErr) console.log("User deletion sync note:", userErr.message);
                });
                db.query("DELETE FROM notifications WHERE recipient_email=? OR receiver_email=?", [empEmail, empEmail], (notifErr) => {
                    if (notifErr) console.log("Notification cleanup note:", notifErr.message);
                });
                db.query("DELETE FROM attendance WHERE emp_id=? OR emp_email=?", [String(id), empEmail], (attErr) => {
                    if (attErr) console.log("Attendance cleanup note:", attErr.message);
                });
                db.query("DELETE FROM assign WHERE emp_id=? OR assign_to=? OR assign_to=?", [String(id), empEmail, empName || ''], (assignErr) => {
                    if (assignErr) console.log("Task assignment cleanup note:", assignErr.message);
                });
            }

            res.json({
                success: true,
                message: "Employee and history records deleted successfully"
            });
        });
    });
});

app.put("/updateEmployee/:id", (req, res) => {
    const { id } = req.params;
    if (!id || id === 'undefined' || id === 'null') {
        return res.json({ success: false, message: "Valid Employee ID is required" });
    }

    const {
        name,
        email,
        phone,
        gender,
        role,
        position,
        designation,
        password
    } = req.body;

    const empIdStr = String(id);
    const oldRoleSql = "SELECT * FROM employee WHERE CAST(emp_id AS CHAR)=?";

    db.query(oldRoleSql, [empIdStr], (oldErr, oldResult) => {
        if (oldErr) {
            return res.json({
                success: false,
                message: oldErr.message
            });
        }

        if (!oldResult || oldResult.length === 0) {
            return res.json({
                success: false,
                message: "Employee not found"
            });
        }

        const currentEmp = oldResult[0];
        const updatedName = (name !== undefined && name !== null && name !== "") ? name : (currentEmp.emp_name || "");
        const updatedEmail = (email !== undefined && email !== null && email !== "") ? email : (currentEmp.emp_email || "");
        const updatedPhone = (phone !== undefined && phone !== null) ? phone : (currentEmp.emp_phone || "");
        const updatedGender = (gender !== undefined && gender !== null) ? gender : (currentEmp.emp_gender || "");
        const updatedRole = (role !== undefined && role !== null && role !== "") ? role : (currentEmp.emp_role || "Employee");
        const updatedPosition = (position !== undefined && position !== null && position !== "") ? position : (currentEmp.position || "Employee");
        const updatedDesignation = (designation !== undefined && designation !== null) ? designation : (currentEmp.designation || null);
        const oldRole = currentEmp.emp_role || "Employee";

        const updateSql = `
            UPDATE employee
            SET
                emp_name=?,
                emp_email=?,
                emp_phone=?,
                emp_gender=?,
                emp_role=?
            WHERE CAST(emp_id AS CHAR)=?
        `;

        const updateParams = [
            updatedName,
            updatedEmail,
            updatedPhone,
            updatedGender,
            updatedRole,
            empIdStr
        ];

        db.query(updateSql, updateParams, (err, result) => {
            if (err) {
                return res.json({
                    success: false,
                    message: err.message
                });
            }

            
            db.query(
                "UPDATE employee SET position=?, designation=?, previous_role=? WHERE CAST(emp_id AS CHAR)=?",
                [updatedPosition, updatedDesignation, oldRole, empIdStr],
                (extraErr) => {
                    if (extraErr) console.log("Extra columns update note:", extraErr.message);
                }
            );

            const oldEmail = currentEmp.emp_email;
            const newPassword = (password && String(password).trim() !== "") ? String(password).trim() : null;

            db.query("SELECT * FROM users WHERE u_email=? OR u_email=?", [oldEmail, updatedEmail], (uErr, uRows) => {
                if (!uErr && uRows && uRows.length > 0) {
                    let userUpdateSql = "UPDATE users SET u_name=?, u_email=?, u_role=?";
                    let userParams = [updatedName, updatedEmail, updatedRole];
                    if (newPassword) {
                        userUpdateSql += ", u_password=?";
                        userParams.push(newPassword);
                    }
                    userUpdateSql += " WHERE u_email=? OR u_email=?";
                    userParams.push(oldEmail, updatedEmail);
                    db.query(userUpdateSql, userParams, (updateUserErr) => {
                        if (updateUserErr) console.log("User table update note:", updateUserErr.message);
                    });
                } else {
                    syncUserCredentials(
                        updatedName,
                        updatedEmail,
                        newPassword || updatedPhone || "123456",
                        updatedRole
                    );
                }
            });

            res.json({
                success: true,
                message: "Employee updated successfully"
            });
        });
    });
});


app.put("/MakeTL/:id", (req, res) => {
    const { id } = req.params;

   
    const getEmployeeSql = `
        SELECT emp_role
        FROM employee
        WHERE emp_id = ?
    `;

    db.query(getEmployeeSql, [id], (err, empResult) => {

        if (err) {
            return res.json({
                success: false,
                message: err.message
            });
        }

        if (empResult.length === 0) {
            return res.json({
                success: false,
                message: "Employee not found"
            });
        }

        const team = empResult[0].emp_role;

       
        const checkTlSql = `
            SELECT emp_name
            FROM employee
            WHERE emp_role = ?
            AND position = 'TL'
            AND emp_id <> ?
        `;

        db.query(checkTlSql, [team, id], (err, tlResult) => {

            if (err) {
                return res.json({
                    success: false,
                    message: err.message
                });
            }

            if (tlResult.length > 0) {
                return res.json({
                    success: false,
                    message: `This team already has a TL (${tlResult[0].emp_name})`
                });
            }

            
            const promoteSql = `
                UPDATE employee
                SET previous_role = position,
                    position = 'TL'
                WHERE emp_id = ?
            `;

            db.query(promoteSql, [id], (err, result) => {

                if (err) {
                    return res.json({
                        success: false,
                        message: err.message
                    });
                }

                res.json({
                    success: true,
                    message: "Employee promoted to TL"
                });
            });

        });

    });
});
app.put("/UndoTL/:id",(req,res)=>{

    const {id}=req.params;

    const sql=`
        UPDATE employee
        SET
            position='Employee'
        WHERE emp_id=?
    `;

    db.query(sql,[id],(err,result)=>{

        if(err){

            return res.json({
                success:false,
                message:err.message
            });

        }

        if(result.affectedRows===0){

            return res.json({
                success:false,
                message:"Employee not found"
            });

        }

        res.json({
            success:true,
            message:"TL removed. Employee restored"
        });

    });

});

app.post("/ChangePassword", (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.json({
            success: false,
            message: "Email and new password are required"
        });
    }

    const emailErr = validateEmailBackend(email);
    if (emailErr) return res.json({ success: false, message: emailErr });

    const passErr = validatePasswordBackend(newPassword);
    if (passErr) return res.json({ success: false, message: passErr });

    const updateSql = "UPDATE users SET u_password=? WHERE u_email=?";

    db.query(updateSql, [newPassword, email], (err, result) => {
        if (err) {
            return res.json({
                success: false,
                message: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Password updated successfully"
        });
    });
});
app.get("/AdminAttendance", (req, res) => {

    const { id, from, to } = req.query;

    let sql = `
        SELECT
            attendance_id,
            name,
            DATE_FORMAT(dates,'%Y-%m-%d') AS dates,
            DATE_FORMAT(checkin,'%Y-%m-%d %h:%i %p') AS checkin,
            IFNULL(
                DATE_FORMAT(checkout,'%Y-%m-%d %h:%i %p'),
                'Not Checked Out'
            ) AS checkout,
            workhours,
            status
        FROM attendance
        WHERE 1=1
    `;

    let values = [];

    if (id) {
        sql += " AND (name LIKE ? OR CAST(attendance_id AS CHAR) LIKE ?)";
        values.push("%" + id + "%", "%" + id + "%");
    }

    if (from && to) {
        sql += " AND dates BETWEEN ? AND ?";
        values.push(from, to);
    }

    db.query(sql, values, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            data: results
        });
    });

});
app.get("/WeeklyAttendance", (req, res) => {

    const sql = `
    SELECT
        DAYNAME(dates) AS day,
        ROUND(
            SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END)*100/COUNT(*),
            2
        ) AS present,

        ROUND(
            SUM(CASE WHEN status='Absent' THEN 1 ELSE 0 END)*100/COUNT(*),
            2
        ) AS absent

    FROM attendance
    GROUP BY DAYNAME(dates)
    ORDER BY MIN(dates);
    `;

    db.query(sql,(err,result)=>{

        if(err){
            return res.json({
                success:false,
                message:err.message
            });
        }

        res.json({
            success:true,
            data:result
        });

    });

});

app.get("/MonthlyAttendance", (req, res) => {

    const sql = `
    SELECT
        MONTHNAME(dates) AS month,
        ROUND(
            SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END)*100/COUNT(*),
            2
        ) AS present,

        ROUND(
            SUM(CASE WHEN status='Absent' THEN 1 ELSE 0 END)*100/COUNT(*),
            2
        ) AS absent

    FROM attendance
    GROUP BY MONTHNAME(dates), MONTH(dates)
    ORDER BY MONTH(dates);
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            data: result
        });

    });

});

app.get("/TodayEmployeeAttendance", (req, res) => {
    const empSql = "SELECT CAST(emp_id AS CHAR) AS emp_id, emp_name, emp_email, emp_role FROM employee";
    db.query(empSql, (err, empRows) => {
        let employees = [];
        if (!err && empRows && empRows.length > 0) {
            employees = empRows.map(e => ({
                emp_id: String(e.emp_id),
                emp_name: String(e.emp_name),
                emp_email: e.emp_email || '',
                emp_role: e.emp_role || 'Employee'
            }));
        }

        const attNameSql = "SELECT DISTINCT CAST(name AS CHAR) AS name FROM attendance WHERE name IS NOT NULL AND name != ''";
        db.query(attNameSql, (err, attRows) => {
            if (!err && attRows && attRows.length > 0) {
                attRows.forEach(row => {
                    const strName = String(row.name);
                    const exists = employees.some(e => e.emp_name === strName || e.emp_id === strName);
                    if (!exists) {
                        employees.push({
                            emp_id: strName,
                            emp_name: strName,
                            emp_email: '',
                            emp_role: 'Employee'
                        });
                    }
                });
            }

            const userSql = "SELECT u_name, u_email FROM users WHERE u_role='Employee'";
            db.query(userSql, (err, userRows) => {
                if (!err && userRows && userRows.length > 0) {
                    userRows.forEach(u => {
                        const strName = String(u.u_name);
                        const strEmail = String(u.u_email);
                        const exists = employees.some(e => e.emp_name === strName || e.emp_id === strEmail || e.emp_email === strEmail);
                        if (!exists) {
                            employees.push({
                                emp_id: strEmail,
                                emp_name: strName,
                                emp_email: strEmail,
                                emp_role: 'Employee'
                            });
                        }
                    });
                }

                if (employees.length === 0) {
                    return res.json({ success: true, data: [] });
                }

                const todaySql = `
                    SELECT 
                        attendance_id,
                        CAST(name AS CHAR) AS name,
                        DATE_FORMAT(dates, '%Y-%m-%d') AS dates,
                        DATE_FORMAT(checkin, '%Y-%m-%d %h:%i %p') AS checkin,
                        IFNULL(DATE_FORMAT(checkout, '%Y-%m-%d %h:%i %p'), 'Not Checked Out') AS checkout,
                        workhours,
                        status
                    FROM attendance
                    WHERE dates = CURDATE() OR DATE(dates) = CURDATE()
                `;
                db.query(todaySql, (err, todayRows) => {
                    const todayMap = {};
                    if (!err && todayRows) {
                        todayRows.forEach(r => {
                            todayMap[String(r.name)] = r;
                        });
                    }

                    const result = employees.map(emp => {
                        const att = todayMap[emp.emp_name] || todayMap[emp.emp_id] || {};
                        return {
                            emp_id: emp.emp_id,
                            emp_name: emp.emp_name,
                            emp_email: emp.emp_email || '',
                            emp_role: emp.emp_role || 'Employee',
                            attendance_id: att.attendance_id || null,
                            status: att.status || 'Not Marked',
                            checkin: att.checkin || null,
                            checkout: att.checkout || null,
                            workhours: att.workhours || '00:00:00'
                        };
                    });

                    res.json({ success: true, data: result });
                });
            });
        });
    });
});

app.post("/MarkBatchAttendance", async (req, res) => {
    const { items, action } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.json({ success: false, message: "No employees selected" });
    }

    const processItemAsync = (item) => {
        return new Promise((resolve, reject) => {
            const empName = String(item.name || '');
            const empId = String(item.emp_id || '');
            const identifier = empName || empId;

            const callback = (err, result) => {
                if (err) return reject(err);
                resolve(result);
            };

            if (action === 'checkin') {
                const checkSql = "SELECT * FROM attendance WHERE (name=? OR name=?) AND (dates=CURDATE() OR DATE(dates)=CURDATE())";
                db.query(checkSql, [empName, empId], (err, rows) => {
                    if (err) return callback(err);
                    if (rows && rows.length > 0) {
                        const updateSql = "UPDATE attendance SET checkin=NOW(), status='Present', checkout=NULL, workhours='00:00:00' WHERE attendance_id=?";
                        db.query(updateSql, [rows[0].attendance_id], callback);
                    } else {
                        const insertSql = "INSERT INTO attendance (name, dates, checkin, checkout, workhours, status) VALUES (?, CURDATE(), NOW(), NULL, '00:00:00', 'Present')";
                        db.query(insertSql, [identifier], callback);
                    }
                });
            } else if (action === 'checkout') {
                const checkSql = "SELECT * FROM attendance WHERE (name=? OR name=?) AND (dates=CURDATE() OR DATE(dates)=CURDATE())";
                db.query(checkSql, [empName, empId], (err, rows) => {
                    if (err) return callback(err);
                    if (rows && rows.length > 0) {
                        const updateSql = `
                            UPDATE attendance 
                            SET checkout=NOW(),
                                status='Present',
                                workhours=SEC_TO_TIME(TIMESTAMPDIFF(SECOND, IFNULL(checkin, NOW()), NOW()))
                            WHERE attendance_id=?
                        `;
                        db.query(updateSql, [rows[0].attendance_id], callback);
                    } else {
                        const insertSql = "INSERT INTO attendance (name, dates, checkin, checkout, workhours, status) VALUES (?, CURDATE(), NOW(), NOW(), '08:00:00', 'Present')";
                        db.query(insertSql, [identifier], callback);
                    }
                });
            } else if (action === 'absent') {
                const checkSql = "SELECT * FROM attendance WHERE (name=? OR name=?) AND (dates=CURDATE() OR DATE(dates)=CURDATE())";
                db.query(checkSql, [empName, empId], (err, rows) => {
                    if (err) return callback(err);
                    if (rows && rows.length > 0) {
                        const updateSql = "UPDATE attendance SET checkin=NULL, checkout=NULL, workhours='00:00:00', status='Absent' WHERE attendance_id=?";
                        db.query(updateSql, [rows[0].attendance_id], callback);
                    } else {
                        const insertSql = "INSERT INTO attendance (name, dates, checkin, checkout, workhours, status) VALUES (?, CURDATE(), NULL, NULL, '00:00:00', 'Absent')";
                        db.query(insertSql, [identifier], callback);
                    }
                });
            } else if (action === 'undo') {
                const deleteSql = "DELETE FROM attendance WHERE (name=? OR name=?) AND (dates=CURDATE() OR DATE(dates)=CURDATE())";
                db.query(deleteSql, [empName, empId], callback);
            } else {
                return callback(new Error("Invalid action"));
            }
        });
    };

    try {
        await Promise.all(items.map(item => processItemAsync(item)));
        res.json({ success: true, message: `Attendance updated (${action}) for ${items.length} employee(s)` });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});





app.post("/AdminAssign", (req, res) => { 
    const { task, role, assign, dline, descrip, team_name } = req.body; 
    const teamVal = team_name || role || "General";
    
    const insertSql = "INSERT INTO assign(task_name, roles, assign_to, deadline, descriptions, status, team_name, assign_date) VALUES(?,?,?,?,?, 'Pending', ?, NOW())"; 
    db.query(insertSql, [task, role, assign, dline, descrip, teamVal], (err, result) => {
        if (err) { 
            const fallbackSql = "INSERT INTO assign(task_name, roles, assign_to, deadline, descriptions) VALUES(?,?,?,?,?)";
            db.query(fallbackSql, [task, role, assign, dline, descrip], (err2) => {
                if (err2) return res.json({ success: false, message: err2.message });
                
                const empSearchSql = "SELECT emp_email FROM employee WHERE emp_name = ? OR emp_email = ? OR CAST(emp_id AS CHAR) = ?";
                db.query(empSearchSql, [assign, assign, assign], (eErr, eRows) => {
                    let empEmail = assign;
                    if (!eErr && eRows && eRows.length > 0 && eRows[0].emp_email) {
                        empEmail = eRows[0].emp_email;
                    }
                    sendNotification(
                        empEmail,
                        "TL",
                        `New Task Assigned: ${task}`,
                        `You have been assigned task "${task}". Role: ${role || "General"}. Deadline: ${dline || "N/A"}.`,
                        "TASK_ASSIGNED"
                    );
                });

                return res.json({ success: true, message: "Task Assigned successfully" });
            });
            return;
        } 

        const empSearchSql = "SELECT emp_email FROM employee WHERE emp_name = ? OR emp_email = ? OR CAST(emp_id AS CHAR) = ?";
        db.query(empSearchSql, [assign, assign, assign], (eErr, eRows) => {
            let empEmail = assign;
            if (!eErr && eRows && eRows.length > 0 && eRows[0].emp_email) {
                empEmail = eRows[0].emp_email;
            }
            sendNotification(
                empEmail,
                "TL",
                `New Task Assigned: ${task}`,
                `You have been assigned task "${task}". Role: ${role || "General"}. Deadline: ${dline || "N/A"}.`,
                "TASK_ASSIGNED"
            );
        });

        res.json({ success: true, message: "Task Assigned successfully" }); 
    });
});

app.get("/AdminTasks", (req, res) => {
    const { id, from, to, status } = req.query;

    const executeTaskQuery = (searchTokens) => {
        let sql = `
            SELECT
                assign_id,
                task_name,
                roles,
                assign_to,
                DATE_FORMAT(assign_date,'%Y-%m-%d') AS assign_date,
                DATE_FORMAT(deadline,'%Y-%m-%d') AS deadline,
                DATE_FORMAT(completed_date,'%Y-%m-%d %H:%i') AS completed_date,
                descriptions,
                IFNULL(status, 'Pending') AS status,
                IFNULL(remarks, '') AS remarks,
                IFNULL(daily_update, '') AS daily_update,
                IFNULL(tl_reply, '') AS tl_reply,
                IFNULL(performance, '') AS performance,
                IFNULL(team_name, roles) AS team_name
            FROM assign
            WHERE 1=1
        `;

        let values = [];

        if (searchTokens && searchTokens.length > 0) {
            const tokenClauses = searchTokens.map(() => "(assign_to LIKE ? OR task_name LIKE ? OR roles LIKE ? OR team_name LIKE ?)").join(" OR ");
            sql += ` AND (${tokenClauses})`;
            searchTokens.forEach(t => {
                values.push("%" + t + "%", "%" + t + "%", "%" + t + "%", "%" + t + "%");
            });
        }

        if (status && status !== 'All') {
            if (status.toLowerCase().includes('progress') || status.toLowerCase().includes('incomplete')) {
                sql += " AND (LOWER(status) LIKE '%progress%' OR LOWER(status) LIKE '%inprogress%' OR LOWER(status) LIKE '%incomplete%')";
            } else {
                sql += " AND (status = ? OR (status IS NULL AND ? = 'Pending'))";
                values.push(status, status);
            }
        }

        if (from && to) {
            sql += " AND assign_date BETWEEN ? AND ?";
            values.push(from, to);
        }

        db.query(sql, values, (err, result) => {
            if (err) {
                let fallbackSql = `
                    SELECT
                        task_name,
                        roles,
                        assign_to,
                        DATE_FORMAT(assign_date,'%Y-%m-%d') AS assign_date,
                        DATE_FORMAT(deadline,'%Y-%m-%d') AS deadline,
                        descriptions,
                        IFNULL(status, 'Pending') AS status,
                        IFNULL(remarks, '') AS remarks,
                        IFNULL(daily_update, '') AS daily_update,
                        IFNULL(tl_reply, '') AS tl_reply,
                        IFNULL(performance, '') AS performance,
                        IFNULL(team_name, roles) AS team_name
                    FROM assign
                    WHERE 1=1
                `;
                let fallbackValues = [];
                if (searchTokens && searchTokens.length > 0) {
                    const tokenClauses = searchTokens.map(() => "(assign_to LIKE ? OR task_name LIKE ? OR roles LIKE ?)").join(" OR ");
                    fallbackSql += ` AND (${tokenClauses})`;
                    searchTokens.forEach(t => {
                        fallbackValues.push("%" + t + "%", "%" + t + "%", "%" + t + "%");
                    });
                }
                if (status && status !== 'All') {
                    if (status.toLowerCase().includes('progress') || status.toLowerCase().includes('incomplete')) {
                        fallbackSql += " AND (LOWER(status) LIKE '%progress%' OR LOWER(status) LIKE '%inprogress%' OR LOWER(status) LIKE '%incomplete%')";
                    } else {
                        fallbackSql += " AND (status = ? OR (status IS NULL AND ? = 'Pending'))";
                        fallbackValues.push(status, status);
                    }
                }
                if (from && to) {
                    fallbackSql += " AND assign_date BETWEEN ? AND ?";
                    fallbackValues.push(from, to);
                }
                db.query(fallbackSql, fallbackValues, (err2, result2) => {
                    if (err2) {
                        return res.status(500).json({ success: false, message: err2.message });
                    }
                    return res.json({ success: true, data: result2 });
                });
                return;
            }

            res.json({
                success: true,
                data: result
            });
        });
    };

    if (id) {
        const rawId = String(id).trim();
        const searchTokens = new Set([rawId]);
        if (rawId.includes('@')) {
            const prefix = rawId.split('@')[0];
            if (prefix) searchTokens.add(prefix);
        }

        const empQuery = "SELECT emp_name, emp_id FROM employee WHERE emp_email=? OR CAST(emp_id AS CHAR)=? OR emp_name LIKE ?";
        db.query(empQuery, [rawId, rawId, "%" + rawId + "%"], (err, empRows) => {
            if (!err && empRows && empRows.length > 0) {
                empRows.forEach(row => {
                    if (row.emp_name) searchTokens.add(row.emp_name);
                    if (row.emp_id) searchTokens.add(String(row.emp_id));
                });
            }

            const userQuery = "SELECT u_name FROM users WHERE u_email=? OR u_name LIKE ?";
            db.query(userQuery, [rawId, "%" + rawId + "%"], (err, userRows) => {
                if (!err && userRows && userRows.length > 0) {
                    userRows.forEach(row => {
                        if (row.u_name) searchTokens.add(row.u_name);
                    });
                }
                executeTaskQuery(Array.from(searchTokens));
            });
        });
    } else {
        executeTaskQuery([]);
    }
});


app.post("/UpdateTaskStatus", (req, res) => {
    const { assign_id, task_name, assign_to, status, remarks, daily_update, tl_reply, performance } = req.body;

    if (status) {
        const allowedStatuses = ["pending", "in progress", "incomplete", "completed"];
        if (!allowedStatuses.includes(String(status).trim().toLowerCase())) {
            return res.json({
                success: false,
                message: "Task status is required and must be valid (Pending, In Progress, Completed)."
            });
        }
    }

    const newStatus = status || "Pending";
    const newRemarks = remarks || "";
    const isCompleted = newStatus.toLowerCase().includes("complete");

    let setFields = ["status=?", "remarks=?", `completed_date=${isCompleted ? "NOW()" : "NULL"}`];
    let params = [newStatus, newRemarks];

    if (daily_update !== undefined) {
        setFields.push("daily_update=?");
        params.push(daily_update);
    }
    if (tl_reply !== undefined) {
        setFields.push("tl_reply=?");
        params.push(tl_reply);
    }
    if (performance !== undefined) {
        setFields.push("performance=?");
        params.push(performance);
    }

    const updateTask = (condition, values) => {
        const fetchTaskSql = `SELECT * FROM assign WHERE ${condition}`;
        db.query(fetchTaskSql, values, (taskErr, taskRows) => {
            const taskData = (!taskErr && taskRows && taskRows.length > 0) ? taskRows[0] : null;

            const sql = `
                UPDATE assign 
                SET ${setFields.join(", ")}
                WHERE ${condition}
            `;

            db.query(sql, [...params, ...values], (err, result) => {
                if(err){
                    return res.json({
                        success:false,
                        message:err.message
                    });
                }

                if(result.affectedRows > 0){
                    const taskRole = taskData?.team_name || taskData?.roles || "General";
                    const assignedTo = assign_to || taskData?.assign_to || "Employee";
                    const taskTitle = task_name || taskData?.task_name || "Task";
                    const updatedStatus = newStatus;

                    if (tl_reply !== undefined && tl_reply !== null && tl_reply !== "") {
                        notifyAdmins(
                            "TL",
                            `TL Task Review: ${taskTitle}`,
                            `TL reviewed/updated task "${taskTitle}" assigned to ${assignedTo}. Status: "${updatedStatus}". TL Reply: "${tl_reply}"`,
                            "TASK_UPDATED_BY_TL"
                        );

                        let empEmail = assignedTo;
                        db.query("SELECT emp_email FROM employee WHERE emp_name = ? OR emp_email = ?", [assignedTo, assignedTo], (eErr, eRows) => {
                            if (!eErr && eRows && eRows.length > 0 && eRows[0].emp_email) empEmail = eRows[0].emp_email;
                            sendNotification(
                                empEmail,
                                "TL",
                                `TL Reviewed Task: ${taskTitle}`,
                                `Your Team Lead updated task "${taskTitle}" status to "${updatedStatus}". Reply: "${tl_reply}"`,
                                "TASK_REVIEWED_BY_TL"
                            );
                        });
                    } else {
                        notifyTLForRole(
                            taskRole,
                            "Employee",
                            `Task Update from ${assignedTo}`,
                            `${assignedTo} updated task "${taskTitle}" status to "${updatedStatus}". Work update: "${daily_update || newRemarks || "Updated"}"`,
                            "TASK_UPDATED_BY_EMPLOYEE"
                        );
                    }

                    return res.json({
                        success:true,
                        message:"Task status updated successfully"
                    });
                }

                return res.json({
                    success:false,
                    message:"Task not found"
                });
            });
        });
    };

    if(assign_id){
        return updateTask("assign_id=?", [assign_id]);
    }

    if(task_name){
        let condition = "task_name=?";
        let values = [task_name];

        if(assign_to){
            condition += " AND assign_to=?";
            values.push(assign_to);
        }

        return updateTask(condition, values);
    }

    return res.json({
        success:false,
        message:"Task ID or task name required"
    });
});


app.get("/notifications/:email", (req, res) => {
    const { email } = req.params;
    if (!email) return res.json({ success: false, message: "Email required" });

    checkAndCreateOverdueNotifications();

    const fetchSql = `
        SELECT 
            id,
            COALESCE(recipient_email, receiver_email, 'Admin') AS recipient_email,
            sender_role,
            title,
            message,
            type,
            task_id,
            is_read,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
        FROM notifications 
        ORDER BY created_at DESC LIMIT 50
    `;

    db.query(fetchSql, (errNotif, results) => {
        if (errNotif) {
            return res.json({ success: false, message: errNotif.message });
        }

        if (!results || results.length === 0) {
            sendNotification(email, 'System', 'Welcome to Task Management System', 'Notification panel is ready and active.', 'SYSTEM');
            return res.json({
                success: true,
                data: [{
                    id: 1,
                    recipient_email: email,
                    sender_role: 'System',
                    title: 'Welcome to Task Management System',
                    message: 'Notification panel is ready and active.',
                    type: 'SYSTEM',
                    is_read: 0,
                    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                }]
            });
        }

        const lowerEmail = String(email).toLowerCase().trim();
        db.query("SELECT u_role FROM users WHERE LOWER(TRIM(u_email)) = ?", [lowerEmail], (uErr, uRows) => {
            const userRole = uRows && uRows[0] ? uRows[0].u_role : '';
            const isUserAdmin = lowerEmail.includes('admin') || userRole === 'Admin';
            const isUserTL = userRole === 'TL';

            const filtered = results.filter(n => {
                const rEmail = (n.recipient_email || '').toLowerCase().trim();
                const recvEmail = (n.receiver_email || '').toLowerCase().trim();
                
                if (!rEmail && !recvEmail) return true;
                if (rEmail === lowerEmail || recvEmail === lowerEmail) return true;
                if (isUserAdmin && (rEmail === 'admin' || recvEmail === 'admin')) return true;
                if (isUserTL && (rEmail === 'tl' || recvEmail === 'tl')) return true;
                if (rEmail === 'admin' && lowerEmail.includes('admin')) return true;
                if (rEmail === 'tl' && isUserTL) return true;
                return false;
            });

            res.json({ success: true, data: filtered.length > 0 ? filtered : results });
        });
    });
});

app.post("/notifications", (req, res) => {
    const { recipient_email, receiver_email, sender_role, title, message, type } = req.body;
    sendNotification(recipient_email || receiver_email, sender_role, title, message, type);
    res.json({ success: true, message: "Notification sent" });
});

app.put("/notifications/:id/read", (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE notifications SET is_read = 1 WHERE id = ?";
    db.query(sql, [id], (err) => {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, message: "Notification marked read" });
    });
});

app.put("/notifications/read-all/:email", (req, res) => {
    const { email } = req.params;
    if (!email) return res.json({ success: false, message: "Email required" });
    const cleanEmail = String(email).trim().toLowerCase();

    db.query("SELECT u_role FROM users WHERE LOWER(TRIM(u_email)) = ?", [cleanEmail], (uErr, uRows) => {
        const userRole = uRows && uRows[0] ? uRows[0].u_role : '';
        const isUserAdmin = cleanEmail.includes('admin') || userRole === 'Admin';
        const isUserTL = userRole === 'TL';

        let whereClauses = [
            "LOWER(TRIM(recipient_email)) = ?",
            "LOWER(TRIM(receiver_email)) = ?"
        ];
        let params = [cleanEmail, cleanEmail];

        if (isUserAdmin) {
            whereClauses.push("LOWER(TRIM(recipient_email)) = 'admin'");
            whereClauses.push("LOWER(TRIM(receiver_email)) = 'admin'");
        }
        if (isUserTL) {
            whereClauses.push("LOWER(TRIM(recipient_email)) = 'tl'");
            whereClauses.push("LOWER(TRIM(receiver_email)) = 'tl'");
        }

        const sql = `UPDATE notifications SET is_read = 1 WHERE ${whereClauses.join(" OR ")}`;

        db.query(sql, params, (err) => {
            if (err) {
                const fallbackSql = "UPDATE notifications SET is_read = 1 WHERE LOWER(TRIM(recipient_email)) = ? OR LOWER(TRIM(receiver_email)) = ?";
                db.query(fallbackSql, [cleanEmail, cleanEmail], (err2) => {
                    if (err2) return res.json({ success: false, message: err2.message });
                    return res.json({ success: true, message: "All notifications marked read" });
                });
                return;
            }
            return res.json({ success: true, message: "All notifications marked read" });
        });
    });
});


const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
    res.send("Backend Server Running");
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});