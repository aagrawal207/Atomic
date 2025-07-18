let todos = [];

function saveTodos() {
    browser.storage.local.set({ todos });
    updateTitle();
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';

    todos.forEach((todo, index) => {
        const li = createTodoElement(todo, index);
        todoList.appendChild(li);
    });

    updateTitle();
}

function createTodoElement(todo, index) {
    const li = document.createElement('li');
    li.className = `Todo ${todo.completed ? 'Todo--checked' : ''}`;
    li.draggable = true;
    li.dataset.index = index;
    
    // Add drag event listeners
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);
    li.addEventListener('dragenter', handleDragEnter);
    li.addEventListener('dragleave', handleDragLeave);

    const checkDiv = document.createElement('div');
    checkDiv.className = 'Todo__Check';
    const checkI = document.createElement('i');
    checkDiv.appendChild(checkI);
    checkDiv.addEventListener('click', () => handleToggleTodo(index));

    const taskSpan = document.createElement('span');
    taskSpan.className = 'Todo__Task';
    taskSpan.textContent = todo.text;
    taskSpan.contentEditable = true;
    taskSpan.addEventListener('blur', () => handleEditTodo(index, taskSpan.textContent));
    taskSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            taskSpan.blur();
        }
    });

    const editButton = document.createElement('button');
    editButton.className = 'Todo__Edit';
    editButton.textContent = 'edit';
    editButton.addEventListener('click', () => taskSpan.focus());

    const deleteButton = document.createElement('button');
    deleteButton.className = 'Todo__Delete';
    deleteButton.textContent = '×';
    deleteButton.addEventListener('click', () => handleDeleteTodo(index));

    li.appendChild(checkDiv);
    li.appendChild(taskSpan);
    li.appendChild(editButton);
    li.appendChild(deleteButton);

    return li;
}

function handleAddTodo() {
    const text = document.getElementById('new-todo').value.trim();
    if (text) {
        todos.push({ text, completed: false });
        saveTodos();
        renderTodos();
        document.getElementById('new-todo').value = '';
    }
}

function handleToggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

function handleDeleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

function handleEditTodo(index, newText) {
    if (newText.trim() !== '') {
        todos[index].text = newText.trim();
        saveTodos();
        renderTodos();
    }
}

function updateTitle() {
    const unfinishedCount = todos.filter(todo => !todo.completed).length;
    document.title = unfinishedCount > 0 ? `(${unfinishedCount}) Task${unfinishedCount !== 1 ? 's' : ''} Remaining` : 'NextTask';
}

function updateDateTime() {
    const now = new Date();
    const dateElement = document.querySelector('.DateTime__Date');
    const timeElement = document.querySelector('.DateTime__Time');

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
    timeElement.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Load todos from storage
browser.storage.local.get('todos').then((result) => {
    todos = result.todos || [];
    renderTodos();
});

// Add new todo
document.getElementById('new-todo').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddTodo();
});

// Update date and time
setInterval(updateDateTime, 1000);
updateDateTime();

// Drag and drop functionality
let draggedItemIndex = null;
let draggedElement = null;

function handleDragStart(e) {
    draggedItemIndex = parseInt(this.dataset.index);
    draggedElement = this;
    this.classList.add('dragging');
    
    // Set ghost drag image (optional enhancement)
    if (e.dataTransfer.setDragImage) {
        const ghostElement = this.cloneNode(true);
        ghostElement.style.opacity = '0.8';
        document.body.appendChild(ghostElement);
        e.dataTransfer.setDragImage(ghostElement, 10, 25);
        setTimeout(() => document.body.removeChild(ghostElement), 0);
    }
    
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const todoList = document.getElementById('todo-list');
    const items = Array.from(todoList.querySelectorAll('.Todo:not(.dragging)'));
    
    // Clear previous indicators
    items.forEach(item => {
        item.classList.remove('drag-over-top');
        item.classList.remove('drag-over-bottom');
    });
    
    // Find the item we're currently hovering over
    const targetItem = this;
    if (targetItem === draggedElement) return false;
    
    // Determine if we're in the top or bottom half of the target item
    const rect = targetItem.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const isAbove = e.clientY < midY;
    
    // Add appropriate class to show insertion point
    if (isAbove) {
        targetItem.classList.add('drag-over-top');
    } else {
        targetItem.classList.add('drag-over-bottom');
    }
    
    return false;
}

function handleDragEnter(e) {
    // We'll handle visual feedback in dragOver instead
}

function handleDragLeave(e) {
    this.classList.remove('drag-over-top');
    this.classList.remove('drag-over-bottom');
}

function handleDrop(e) {
    e.stopPropagation();
    
    const dropIndex = parseInt(this.dataset.index);
    if (draggedItemIndex !== dropIndex) {
        // Determine if we're dropping before or after the target
        const rect = this.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const dropBefore = e.clientY < midY;
        
        // Calculate the actual insertion index
        let newIndex = dropIndex;
        if (!dropBefore && dropIndex > draggedItemIndex) {
            newIndex = dropIndex;
        } else if (dropBefore && dropIndex < draggedItemIndex) {
            newIndex = dropIndex;
        } else if (dropBefore && dropIndex > draggedItemIndex) {
            newIndex = dropIndex - 1;
        } else if (!dropBefore && dropIndex < draggedItemIndex) {
            newIndex = dropIndex + 1;
        }
        
        // Reorder the todos array
        const movedItem = todos[draggedItemIndex];
        todos.splice(draggedItemIndex, 1);
        todos.splice(newIndex, 0, movedItem);
        saveTodos();
        renderTodos();
    }
    
    // Clean up
    const todoList = document.getElementById('todo-list');
    const items = Array.from(todoList.querySelectorAll('.Todo'));
    items.forEach(item => {
        item.classList.remove('drag-over-top');
        item.classList.remove('drag-over-bottom');
        item.classList.remove('dragging');
    });
    
    draggedElement = null;
    return false;
}

// Initial render
renderTodos();
