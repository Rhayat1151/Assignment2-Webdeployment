const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// In-memory storage for todos (in a real app, you'd use a database)
let todos = [
  { 
    id: 1, 
    text: 'Learn Node.js', 
    completed: false, 
    priority: 'high',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: null
  },
  { 
    id: 2, 
    text: 'Build a todo app', 
    completed: false, 
    priority: 'medium',
    createdAt: new Date().toISOString(),
    completedAt: null
  }
];

// Routes
// Home page
app.get('/', (req, res) => {
  res.render('index', { todos });
});

// API route to get all todos (for AJAX)
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Add a new todo
app.post('/todos', (req, res) => {
  const newTodo = {
    id: Date.now(),
    text: req.body.text,
    completed: false,
    priority: req.body.priority || 'medium',
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  todos.push(newTodo);
  
  // For AJAX requests, return JSON
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.json(newTodo);
  }
  
  // For regular form submissions, redirect
  res.redirect('/');
});

// Toggle todo completion status
app.post('/todos/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id);
  
  todos = todos.map(todo => {
    if (todo.id === id) {
      const completed = !todo.completed;
      return { 
        ...todo, 
        completed, 
        completedAt: completed ? new Date().toISOString() : null 
      };
    }
    return todo;
  });
  
  // For AJAX requests
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    const updatedTodo = todos.find(todo => todo.id === id);
    return res.json(updatedTodo);
  }
  
  res.redirect('/');
});

// Update todo priority
app.post('/todos/:id/priority', (req, res) => {
  const id = parseInt(req.params.id);
  const priority = req.body.priority;
  
  todos = todos.map(todo => 
    todo.id === id ? { ...todo, priority } : todo
  );
  
  // For AJAX requests
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    const updatedTodo = todos.find(todo => todo.id === id);
    return res.json(updatedTodo);
  }
  
  res.redirect('/');
});

// Delete a todo
app.post('/todos/:id/delete', (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(todo => todo.id !== id);
  
  // For AJAX requests
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.json({ success: true, id });
  }
  
  res.redirect('/');
});

// For Azure deployment
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start the server
app.listen(port, () => {
  console.log(`Todo app listening at http://localhost:${port}`);
});