document.addEventListener('DOMContentLoaded', () => {
    console.log('Todo app loaded!');
    
    // DOM elements
    const todoForm = document.getElementById('add-form');
    const todoInput = document.getElementById('todo-input');
    const prioritySelect = document.getElementById('priority-select');
    const todoList = document.getElementById('todo-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const taskCount = document.getElementById('task-count');
    const completedCount = document.getElementById('completed-count');
    
    // Add new todo
    todoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const text = todoInput.value.trim();
      const priority = prioritySelect.value;
      
      if (!text) return;
      
      try {
        const response = await fetch('/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ text, priority })
        });
        
        const newTodo = await response.json();
        
        // Add to DOM
        const todoItem = createTodoElement(newTodo);
        todoList.prepend(todoItem);
        
        // Clear input
        todoInput.value = '';
        
        // Update counts
        updateCounters();
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    });
    
    // Delete todo
    todoList.addEventListener('click', async (e) => {
      if (e.target.closest('.delete-btn')) {
        const btn = e.target.closest('.delete-btn');
        const id = parseInt(btn.dataset.id);
        const todoItem = btn.closest('.todo-item');
        
        // Add delete animation
        todoItem.classList.add('deleting');
        
        try {
          await fetch(`/todos/${id}/delete`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          // Remove after animation
          setTimeout(() => {
            todoItem.remove();
            updateCounters();
          }, 300);
        } catch (error) {
          console.error('Error deleting todo:', error);
          todoItem.classList.remove('deleting');
        }
      }
    });
    
    // Toggle completion
    todoList.addEventListener('click', async (e) => {
      if (e.target.closest('.toggle-btn')) {
        const btn = e.target.closest('.toggle-btn');
        const id = parseInt(btn.dataset.id);
        const todoItem = btn.closest('.todo-item');
        const icon = btn.querySelector('i');
        
        try {
          const response = await fetch(`/todos/${id}/toggle`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          const updatedTodo = await response.json();
          
          // Update UI
          if (updatedTodo.completed) {
            todoItem.classList.add('completed');
            icon.className = 'far fa-check-square';
          } else {
            todoItem.classList.remove('completed');
            icon.className = 'far fa-square';
          }
          
          updateCounters();
        } catch (error) {
          console.error('Error toggling todo:', error);
        }
      }
    });
    
    // Set priority
    todoList.addEventListener('click', async (e) => {
      if (e.target.classList.contains('set-priority')) {
        const btn = e.target;
        const id = parseInt(btn.dataset.id);
        const priority = btn.dataset.priority;
        const todoItem = btn.closest('.todo-item');
        
        try {
          const response = await fetch(`/todos/${id}/priority`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ priority })
          });
          
          const updatedTodo = await response.json();
          
          // Update CSS class
          todoItem.classList.remove('priority-low', 'priority-medium', 'priority-high');
          todoItem.classList.add(`priority-${priority}`);
          
          // Update text in the UI
          const priorityText = todoItem.querySelector('.todo-priority');
          if (priorityText) {
            priorityText.innerHTML = `<i class="fas fa-flag"></i> ${priority.charAt(0).toUpperCase() + priority.slice(1)}`;
          }
        } catch (error) {
          console.error('Error updating priority:', error);
        }
      }
    });
    
    // Filter todos
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        
        // Apply filter
        const items = todoList.querySelectorAll('.todo-item');
        items.forEach(item => {
          if (filter === 'all') {
            item.style.display = '';
          } else if (filter === 'active') {
            item.style.display = !item.classList.contains('completed') ? '' : 'none';
          } else if (filter === 'completed') {
            item.style.display = item.classList.contains('completed') ? '' : 'none';
          }
        });
      });
    });
    
    // Helper: Create todo element
    function createTodoElement(todo) {
      const li = document.createElement('li');
      li.className = `todo-item priority-${todo.priority} ${todo.completed ? 'completed' : ''}`;
      li.dataset.id = todo.id;
      
      const date = new Date(todo.createdAt).toLocaleDateString();
      const formattedDate = new Date(todo.createdAt).toLocaleString();
      
      li.innerHTML = `
        <div class="todo-content">
          <span class="todo-text">${todo.text}</span>
          <div class="todo-meta">
            <span class="todo-date" title="Created: ${formattedDate}">
              <i class="far fa-clock"></i> ${date}
            </span>
            <span class="todo-priority">
              <i class="fas fa-flag"></i> ${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
            </span>
          </div>
        </div>
        <div class="todo-actions">
          <button class="toggle-btn" data-id="${todo.id}">
            <i class="far ${todo.completed ? 'fa-check-square' : 'fa-square'}"></i>
          </button>
          <div class="priority-dropdown">
            <button class="priority-btn">
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="priority-menu">
              <button class="set-priority" data-priority="low" data-id="${todo.id}">Low</button>
              <button class="set-priority" data-priority="medium" data-id="${todo.id}">Medium</button>
              <button class="set-priority" data-priority="high" data-id="${todo.id}">High</button>
            </div>
          </div>
          <button class="delete-btn" data-id="${todo.id}">
            <i class="far fa-trash-alt"></i>
          </button>
        </div>
      `;
      
      return li;
    }
    
    // Helper: Update counters
    function updateCounters() {
      const todos = document.querySelectorAll('.todo-item');
      const completed = document.querySelectorAll('.todo-item.completed');
      
      taskCount.textContent = `Total: ${todos.length} tasks`;
      completedCount.textContent = `Completed: ${completed.length} tasks`;
    }
  });