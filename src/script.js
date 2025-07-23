// Configuration
const CONFIG = {
    MAX_TASKS: 12,
    AUTO_HIDE_DELAY: 3000,
    DEBOUNCE_DELAY: 300
};

// State management
let todos = [];
let isEditing = false;
let isTogglingCheckbox = false;
let newTaskPriority = 'none';

// Utility functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const createElement = (tag, className, content = '') => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
};

// Core functions
function saveTodos() {
    try {
        browser.storage.local.set({ todos });
        updateTitle();
    } catch (error) {
        console.error('Failed to save todos:', error);
    }
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';
    
    // Priority order: high=1, medium=2, low=3, none=4
    const getPriorityOrder = (priority) => {
        switch (priority) {
            case 'high': return 1;
            case 'medium': return 2;
            case 'low': return 3;
            default: return 4;
        }
    };
    
    // Sort todos: incomplete items first (by priority), then completed items
    const sortedTodos = [...todos].sort((a, b) => {
        // First, separate completed from incomplete
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        
        // For incomplete items, sort by priority
        if (!a.completed && !b.completed) {
            const priorityA = getPriorityOrder(a.priority || 'none');
            const priorityB = getPriorityOrder(b.priority || 'none');
            return priorityA - priorityB;
        }
        
        // For completed items, maintain current order
        return 0;
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
    checkDiv.addEventListener('click', (e) => {
        // Ensure this event always works, even when another item is being edited
        e.stopPropagation();
        handleToggleTodo(index);
    });

    const taskSpan = document.createElement('span');
    taskSpan.className = 'Todo__Task';
    taskSpan.textContent = todo.text;
    taskSpan.contentEditable = true;
    taskSpan.spellcheck = false;
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
    
    // Allow normal click behavior to position cursor where clicked
    taskSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        taskSpan.focus();
        // Let the browser handle cursor positioning naturally
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

    // Priority buttons container
    const priorityDiv = document.createElement('div');
    priorityDiv.className = 'Todo__Priority';

    const highPriorityBtn = document.createElement('button');
    highPriorityBtn.className = 'priority-high';
    highPriorityBtn.title = 'Set high priority';
    highPriorityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSetPriority(index, 'high');
    });

    const mediumPriorityBtn = document.createElement('button');
    mediumPriorityBtn.className = 'priority-medium';
    mediumPriorityBtn.title = 'Set medium priority';
    mediumPriorityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSetPriority(index, 'medium');
    });

    const lowPriorityBtn = document.createElement('button');
    lowPriorityBtn.className = 'priority-low';
    lowPriorityBtn.title = 'Set low priority';
    lowPriorityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSetPriority(index, 'low');
    });

    priorityDiv.appendChild(highPriorityBtn);
    priorityDiv.appendChild(mediumPriorityBtn);
    priorityDiv.appendChild(lowPriorityBtn);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'Todo__Delete';
    deleteButton.textContent = '×';
    deleteButton.addEventListener('click', () => handleDeleteTodo(index));

    // Add priority class to the todo item
    if (todo.priority && todo.priority !== 'none') {
        li.classList.add(`Todo--priority-${todo.priority}`);
    }

    li.appendChild(dragHandle);
    li.appendChild(checkDiv);
    li.appendChild(taskSpan);
    li.appendChild(priorityDiv);
    li.appendChild(deleteButton);

    return li;
}

function handleAddTodo() {
    const text = document.getElementById('new-todo').value.trim();
    if (!text) return;
    
    if (todos.length >= CONFIG.MAX_TASKS) {
        showLimitMessage();
        return;
    }
    
    todos.push({ text, completed: false, priority: newTaskPriority });
    saveTodos();
    renderTodos();
    document.getElementById('new-todo').value = '';
    resetNewTaskPriority();
    hideLimitMessage();
}

function resetNewTaskPriority() {
    newTaskPriority = 'none';
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.input-priority-buttons').classList.remove('show');
    document.getElementById('add-task-btn').classList.remove('show');
}

function setNewTaskPriority(priority) {
    // Toggle priority: if same priority is clicked, remove it
    if (newTaskPriority === priority) {
        newTaskPriority = 'none';
    } else {
        newTaskPriority = priority;
    }
    
    // Update UI
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (newTaskPriority !== 'none') {
        document.getElementById(`new-priority-${newTaskPriority}`).classList.add('active');
    }
}

function handleToggleTodo(index) {
    if (index < 0 || index >= todos.length) return;
    
    isTogglingCheckbox = true;
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
    
    setTimeout(() => {
        isTogglingCheckbox = false;
    }, 50);
}

function handleDeleteTodo(index) {
    if (index < 0 || index >= todos.length) return;
    
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

function handleEditTodo(index, newText) {
    if (index < 0 || index >= todos.length) return;
    
    const trimmedText = newText.trim();
    if (trimmedText && trimmedText !== todos[index].text) {
        todos[index].text = trimmedText;
        saveTodos();
        
        // Debounced re-render to prevent conflicts
        setTimeout(() => {
            if (!isEditing && !isTogglingCheckbox) {
                renderTodos();
            }
        }, 10);
    }
}

function handleSetPriority(index, priority) {
    if (index < 0 || index >= todos.length) return;
    
    // Toggle priority: if same priority is clicked, remove it
    const currentPriority = todos[index].priority || 'none';
    const newPriority = currentPriority === priority ? 'none' : priority;
    
    todos[index].priority = newPriority;
    saveTodos();
    renderTodos();
}

function updateTitle() {
    document.title = 'Atomic';
}

function updateDateTime() {
    const now = new Date();
    const dateElement = document.querySelector('.DateTime__Date');
    const timeElement = document.querySelector('.DateTime__Time');

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
    timeElement.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

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
    clearButton.hidden = !hasCompletedTasks;
}

function handleClearCompleted() {
    const completedCount = todos.filter(todo => todo.completed).length;
    if (completedCount === 0) return;
    
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
}

function showLimitMessage() {
    const messageElement = document.getElementById('limit-message');
    messageElement.hidden = false;
    messageElement.classList.add('show');
    
    // Auto hide after configured delay
    setTimeout(hideLimitMessage, CONFIG.AUTO_HIDE_DELAY);
}

function hideLimitMessage() {
    const messageElement = document.getElementById('limit-message');
    messageElement.classList.remove('show');
    setTimeout(() => {
        messageElement.hidden = true;
    }, 300);
}

// Event listeners
function initializeEventListeners() {
    // Form submission
    document.querySelector('.add-task-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleAddTodo();
    });
    
    // Input events for showing/hiding priority buttons and add button
    const inputField = document.getElementById('new-todo');
    const priorityButtons = document.querySelector('.input-priority-buttons');
    const addButton = document.getElementById('add-task-btn');
    
    inputField.addEventListener('input', () => {
        if (inputField.value.trim() !== '') {
            priorityButtons.classList.add('show');
            addButton.classList.add('show');
        } else {
            priorityButtons.classList.remove('show');
            addButton.classList.remove('show');
            resetNewTaskPriority();
        }
    });
    
    // Add button click event
    addButton.addEventListener('click', handleAddTodo);
    
    // Input keypress (backup for form submission)
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTodo();
        }
    });
    
    // Priority buttons for new tasks
    document.getElementById('new-priority-high').addEventListener('click', () => {
        setNewTaskPriority('high');
    });
    
    document.getElementById('new-priority-medium').addEventListener('click', () => {
        setNewTaskPriority('medium');
    });
    
    document.getElementById('new-priority-low').addEventListener('click', () => {
        setNewTaskPriority('low');
    });
    
    // Clear completed button
    document.getElementById('clear-completed').addEventListener('click', handleClearCompleted);
    
    // Date/time updates
    setInterval(updateDateTime, 1000);
    updateDateTime();
}

// Initialize storage and render
async function initialize() {
    try {
        const result = await browser.storage.local.get('todos');
        todos = result.todos || [];
        
        // Add backward compatibility for existing todos without priority
        todos = todos.map(todo => ({
            ...todo,
            priority: todo.priority || 'none'
        }));
        
        // Save updated todos if any were missing priority
        if (todos.some(todo => !('priority' in todo))) {
            saveTodos();
        }
        
        renderTodos();
        initializeEventListeners();
    } catch (error) {
        console.error('Failed to load todos:', error);
        // Initialize with empty array if storage fails
        todos = [];
        renderTodos();
        initializeEventListeners();
    }
}

// Start application
initialize();
