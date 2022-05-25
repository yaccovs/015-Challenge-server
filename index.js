const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT;

const fs = require('fs');
const mysql = require('mysql');


connInfo = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
};
// console.log(connInfo);
const pool = mysql.createPool(connInfo)

pool.query('SELECT * FROM jobs LIMIT 3', (error, results, fields) => {
    // console.error(error);
    // console.log(results);
    // console.log(fields);
})

const express = require('express');
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json()
app.use(bodyParser.json({ type: 'text/plain' }))

app.use(cors());


// app.use(bodyParser.urlencoded())

let db = [];
fs.readFile('data.json', (err, data) => {
    if (err) throw err;
    const rawJSON = data;
    db = JSON.parse(rawJSON);
});


app.get('/jobs/salary/high', async (req, res) => {
    let jobSelect = req.query.job;

    pool.query(`SELECT name
                 FROM jobs
                  WHERE
                   job=?
                  AND
                   salary = (SELECT MAX(salary) FROM jobs WHERE job=? )`,
        [jobSelect, jobSelect],
        (error, results) => {
            if (error) { throw error; }
            console.log(results);
            res.send(results[0]);
        });
    /*
        let highSalary = { salary: 0 };
        db.filter((row) => {
            if (row.job === jobSelect) {
                return true;
            } else {
                return false
            }
        })
            .forEach((row) => {
                if (highSalary.salary < row.salary) {
                    highSalary = {name: row.name};
                }
            });
        console.log(highSalary);
        res.send(highSalary);
        */
});

app.get('/jobs/salary/average', async (req, res) => {
    pool.query(`SELECT 
                    job,avg(salary) AS salaryAvg
                FROM
                    jobs
                GROUP BY
                 job `,
        (error, results) => {
            if (error) { throw error; }
            console.log(results);
            res.send(results);
        });

    // const sumSalary = {};
    // const countSalary = {};
    // const averagesReturn = [];
    // db.forEach((row) => {
    //     if (countSalary[row.job] === undefined) {
    //         countSalary[row.job] = 1;
    //         sumSalary[row.job] = row.salary;
    //     } else {
    //         countSalary[row.job]++;
    //         sumSalary[row.job] += row.salary;
    //     }
    // });

    // const jobs = Object.keys(sumSalary);
    // jobs.forEach((job) => {
    //     averagesReturn.push(
    //         {
    //             job,
    //             salaryAvg: sumSalary[job] / countSalary[job]
    //         });
    // });
    // console.log(averagesReturn);
    // res.send(averagesReturn);
});

app.get('/jobs/popularity', async (req, res) => {
    // const countSalary = {};
    pool.query(`SELECT job,COUNT(name) AS popularity  FROM jobs GROUP BY job`,
        (error, results) => {
            if (error) { throw error; }
            console.log(results);
            res.send(results);
        });

    // db.forEach((row) => {
    //     if (countSalary[row.job] === undefined) {
    //         countSalary[row.job] = 1;
    //     } else {
    //         countSalary[row.job]++;
    //     }
    // });
    // res.send(countSalary);

});

app.delete('/jobs/worker', async (req, res) => {
    let { name } = req.body;
    pool.query(`DELETE FROM jobs WHERE name=?`,
        [name],
        (error, results) => {
            if (error) { throw error; }
            console.log(results);
            res.send("OK");
        });

});
app.put('/jobs/worker', async (req, res) => {
    let { name, job, salary } = req.body;
    if (typeof salary !== 'undefined') {
        res.status(400);
        res.send('{ "error": "salary must be INT" }');
        return false;
    }

    pool.query(`INSERT INTO jobs (name,job,salary) VALUES (?,?,?) ON DUPLICATE KEY UPDATE job=?, salary=?`,
        [name, job, salary, job, salary],
        (error, results) => {
            if (error) { throw error; }
            console.log(results);

            res.send("OK");
        });
    // console.log(req.body);
    // findRow = db.find((row) => {
    //     return row.name === req.body.name;
    // });
    // if (findRow === undefined) {
    //     db.push({ name, job, salary });
    // } else {
    //     findRow.job = job;
    //     findRow.salary = salary;
    // }
    // res.send(db.find((row) => {
    //     return row.name === req.body.name;
    // }));
});


app.listen(PORT,
    () => console.log(`listening on port ${PORT}...`));
