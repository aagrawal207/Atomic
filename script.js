let todos = [];
const MAX_TASKS = 8;

function saveTodos() {
    browser.storage.local.set({ todos });
    updateTitle();
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';
    
    // Sort todos: incomplete items first, completed items at the bottom
    const sortedTodos = [...todos].sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
    });
    
    // Update the main todos array with the sorted order
    todos = sortedTodos;
    
    todos.forEach((todo, index) => {
        const li = createTodoElement(todo, index);
        todoList.appendChild(li);
    });

    updateTitle();
    toggleClearButtonVisibility();
}

function createTodoElement(todo, index) {
    const li = document.createElement('li');
    li.className = `Todo ${todo.completed ? 'Todo--checked' : ''}`;
    li.dataset.index = index;
    
    // Add drag event listeners to the li for drop zones
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);
    li.addEventListener('dragenter', handleDragEnter);
    li.addEventListener('dragleave', handleDragLeave);

    const dragHandle = document.createElement('div');
    dragHandle.className = 'Todo__DragHandle';
    dragHandle.innerHTML = '⋮⋮';
    dragHandle.draggable = true;
    
    // Add drag event listeners specifically to the drag handle
    dragHandle.addEventListener('dragstart', handleDragStart);

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
        if (e.key === 'Escape') {
            taskSpan.textContent = todo.text; // Reset to original text
            taskSpan.blur();
        }
    });
    
    // Single click to focus and position cursor at end
    taskSpan.addEventListener('click', (e) => {
        e.preventDefault();
        taskSpan.focus();
        
        // Position cursor at the end of the text
        setTimeout(() => {
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(taskSpan);
            range.collapse(false); // false means collapse to end
            selection.removeAllRanges();
            selection.addRange(range);
        }, 0);
    });

    // Double-click to select all text for easier editing
    taskSpan.addEventListener('dblclick', (e) => {
        e.preventDefault();
        const range = document.createRange();
        range.selectNodeContents(taskSpan);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    });

    // Add focus and blur styling
    taskSpan.addEventListener('focus', () => {
        isEditing = true;
        taskSpan.classList.add('Todo__Task--editing');
    });
    
    taskSpan.addEventListener('blur', () => {
        isEditing = false;
        taskSpan.classList.remove('Todo__Task--editing');
        handleEditTodo(index, taskSpan.textContent);
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'Todo__Delete';
    deleteButton.textContent = '×';
    deleteButton.addEventListener('click', () => handleDeleteTodo(index));

    li.appendChild(dragHandle);
    li.appendChild(checkDiv);
    li.appendChild(taskSpan);
    li.appendChild(deleteButton);

    return li;
}

function handleAddTodo() {
    const text = document.getElementById('new-todo').value.trim();
    if (text) {
        if (todos.length >= MAX_TASKS) {
            showLimitMessage();
            return;
        }
        todos.push({ text, completed: false });
        saveTodos();
        renderTodos();
        document.getElementById('new-todo').value = '';
        hideLimitMessage();
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

let isEditing = false;

function handleEditTodo(index, newText) {
    if (newText.trim() !== '') {
        todos[index].text = newText.trim();
        saveTodos();
        // Only re-render if we're not immediately switching to edit another item
        setTimeout(() => {
            if (!isEditing) {
                renderTodos();
            }
        }, 10);
    }
}

function updateTitle() {
    document.title = 'NextTask';
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
    const parentTodo = this.parentElement;
    draggedItemIndex = parseInt(parentTodo.dataset.index);
    draggedElement = parentTodo;
    parentTodo.classList.add('dragging');
    
    // Set ghost drag image (optional enhancement)
    if (e.dataTransfer.setDragImage) {
        const ghostElement = parentTodo.cloneNode(true);
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

function toggleClearButtonVisibility() {
    const clearButton = document.getElementById('clear-completed');
    const hasCompletedTasks = todos.some(todo => todo.completed);
    clearButton.style.display = hasCompletedTasks ? 'block' : 'none';
}

function handleClearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
}

function showLimitMessage() {
    const messageElement = document.getElementById('limit-message');
    messageElement.style.display = 'block';
    messageElement.classList.add('show');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        hideLimitMessage();
    }, 3000);
}

function hideLimitMessage() {
    const messageElement = document.getElementById('limit-message');
    messageElement.classList.remove('show');
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 300);
}

// Clear completed button event listener
document.getElementById('clear-completed').addEventListener('click', handleClearCompleted);

// Initial render
renderTodos();
