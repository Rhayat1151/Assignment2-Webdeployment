const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

let tasks = [];

app.get('/', (req, res) => {
  res.render('index', { tasks, username: process.env.USERNAME });
});

app.post('/add', (req, res) => {
  const task = req.body.task;
  if (task) {
    tasks.push({ task, completed: false });
  }
  res.redirect('/');
});

app.post('/complete', (req, res) => {
  const index = req.body.index;
  if (tasks[index]) {
    tasks[index].completed = true;
  }
  res.redirect('/');
});

app.post('/delete', (req, res) => {
  const index = req.body.index;
  if (tasks[index]) {
    tasks.splice(index, 1);
  }
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});