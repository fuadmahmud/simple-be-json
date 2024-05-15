const express = require('express')
const app = express()
const port = 4000
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

app.post('/register', (req, res) => {
  const body = req.body;

  fs.readFile(__dirname + '/data/users.json', (err, data) => {
    const users = JSON.parse(data);
    const userIdx = users.findIndex(user => user.username === body.username);
    const emailIdx = users.findIndex(user => user.email === body.email);
    if (userIdx >= 0 || emailIdx >= 0) {
      res.status(400).json({
        status: 400,
        message: `${userIdx >= 0 ? 'Username' : 'Password'} have been used please try using other`
      });
      return;
    } else {
      users.push(body);
      fs.writeFile(__dirname + '/data/users.json', JSON.stringify(users), (err) => {
        console.log(err);
        res.send("error to save data")
      });
      res.json({ data: { username: body.username }, message: 'ok', status: 200 })
    }
  })
})

app.post('/auth', (req, res) => {
  fs.readFile(__dirname + '/data/users.json', (err, data) => {
    const users = JSON.parse(data);
    const user = users.find(user => user.username === req.body.username);
    if (!user || user.password !== req.body.password) {
      res.status(401).json({
        status: 401,
        message: "Wrong username or password"
      })
      return;
    } else {
      res.json({
        status: 200,
        data: {
          username: user.username
        },
        message: 'ok'
      })
    }
  })
})

app.get('/expanses', (req, res) => {
  if (!req.query.username) {
    res.status(401).json({ status: 401, message: 'Unauthorized' });
    return;
  }
  fs.readFile(__dirname + '/data/expanses.json', (err, data) => {
    const expanses = JSON.parse(data);
    const expanse = expanses.find(exp => exp.username === req.query.username);
    if (expanse) {
      res.json({ status: 200, data: expanse });
    } else {
      res.status(404).json({
        status: 404,
        message: 'Expanses not found, please create a new one'
      })
      return;
    }
  });
})

app.post('/expanses', (req, res) => {
  if (!req.query.username) {
    res.status(401).json({ status: 401, message: 'Unauthorized' });
    return;
  }
  fs.readFile(__dirname + '/data/expanses.json', (err, data) => {
    const expanses = JSON.parse(data);
    const expanseIdx = expanses.findIndex(exp => exp.username === req.query.username);
    const newData = {...expanses[expanseIdx], expanses: [...expanses[expanseIdx].expanses, req.body]}
    const newExpanses = expanses.map((item, idx) => {
      return idx === expanseIdx ? newData : item
    })
    if (expanseIdx >= 0) {
      fs.writeFile(__dirname + '/data/expanses.json', JSON.stringify(newExpanses), (err) => {
        console.log(err);
        if (err) {
          res.sendStatus(400).json({ status: 400, message: "Failed to save data" });
          return;
        }
      });
      res.json({ status: 200, data: newExpanses[expanseIdx] });
      return;
    } else {
      res.status(404).json({
        status: 404,
        message: 'Expanses not found, please create a new one'
      })
      return;
    }
  });
})

app.get('/categories', (req, res) => {
  fs.readFile(__dirname + '/data/categories.json', (err, data) => {
    const categories = JSON.parse(data);
    res.json({ status: 200, message: 'ok', data: { categories } });
    return;
  });
})


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})