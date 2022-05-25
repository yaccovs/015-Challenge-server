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

const pool = mysql.createPool(connInfo)


const express = require('express');
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json({ type: 'text/plain' }))

app.use(cors());



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

});

app.get('/jobs/popularity', async (req, res) => {
    pool.query(`SELECT job,COUNT(name) AS popularity  FROM jobs GROUP BY job`,
        (error, results) => {
            if (error) { throw error; }
            console.log(results);
            res.send(results);
        });

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
    salary = parseInt(salary);
    console.log({ name, job, salary }, typeof salary !== 'number', isNaN(salary));
    if (typeof salary !== 'number' || isNaN(salary)) {
        res.status(400);
        res.send('{ "error": "salary must be number" }');
        return false
    }

    pool.query(`INSERT INTO jobs (name,job,salary) VALUES (?,?,?) ON DUPLICATE KEY UPDATE job=?, salary=?`,
        [name, job, salary, job, salary],
        (error, results) => {
            if (error) {
                res.status(400);
                res.send('{ "error": "Somethings wrong." }');
            } else {
                res.send("OK");
            }
        });
});


app.listen(PORT,
    () => console.log(`listening on port ${PORT}...`));
