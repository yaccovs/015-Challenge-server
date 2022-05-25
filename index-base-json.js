const PORT = 8000;

const fs = require('fs');
const express = require('express');
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json()
app.use(bodyParser.json({ type: 'text/plain' }))

app.use(cors());


let db = [];
fs.readFile('./data.json', (err, data) => {
    if (err) throw err;
    const rawJSON = data;
    db = JSON.parse(rawJSON);
});


app.get('/jobs/salary/high', async (req, res) => {
    let jobSelect = req.query.job;
    let highSalary = { salary: 0 };

    db.filter((row) => {
        if (row.job === jobSelect) {
            return true;
        } else {
            return false;
        }
    })
        .forEach((row) => {
            if (highSalary.salary < row.salary) {
                highSalary = row;
            }
        });
    console.log(highSalary);
    res.send(highSalary);
});

app.get('/jobs/salary/average', async (req, res) => {
    const sumSalary = {};
    const countSalary = {};
    const averagesReturn = [];
    db.forEach((row) => {
        if (countSalary[row.job] === undefined) {
            countSalary[row.job] = 1;
            sumSalary[row.job] = row.salary;
        } else {
            countSalary[row.job]++;
            sumSalary[row.job] += row.salary;
        }
    });

    const jobs = Object.keys(sumSalary);
    jobs.forEach((job) => {
        averagesReturn.push(
            {
                job,
                salaryAvg: sumSalary[job] / countSalary[job],
            });
    });
    res.send(averagesReturn);
});

app.get('/jobs/popularity', async (req, res) => {
    const countSalary = {};
    db.forEach((row) => {
        if (countSalary[row.job] === undefined) {
            countSalary[row.job] = 1;
        } else {
            countSalary[row.job]++;
        }
    });
    const keys = Object.keys(countSalary);
    const returnArray = keys.map(job => {
        return { job, popularity: countSalary[job] };
    })
    res.send(returnArray);

});


app.put('/jobs/update', async (req, res) => {
    console.log(req.body);
    let { name, job, salary } = req.body;
    findRow = db.find((row) => {
        return row.name === req.body.name;
    });
    if (findRow === undefined) {
        db.push({ name, job, salary });
    } else {
        findRow.job = job;
        findRow.salary = salary;
    }
    res.send(db.find((row) => {
        return row.name === req.body.name;
    }));
});


app.listen(PORT,
    () => console.log(`listening on port ${PORT}...`));
