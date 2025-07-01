// Utility functions
function getGreeting(name) {
  const now = new Date();
  const hour = now.getHours();
  let greeting;
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";
  return `${greeting}, ${name}!`;
}

// Storage keys
const USER_KEY = 'todoAppUser';
const TASKS_KEY = 'todoAppTasks';

// DOM elements
const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const nameForm = document.getElementById('nameForm');
const userNameInput = document.getElementById('userName');
const greetingEl = document.getElementById('greeting');
const logoutBtn = document.getElementById('logoutBtn');
const taskTitle = document.getElementById('taskTitle');
const taskDesc = document.getElementById('taskDesc');
const taskDueDate = document.getElementById('taskDueDate');
const categoryInput = document.getElementById('categoryInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const statusFilter = document.getElementById('statusFilter');
const categoryFilter = document.getElementById('categoryFilter');

// App state
let userName = '';
let tasks = [];

// --- Page Navigation ---
function showPage1() {
  page1.style.display = '';
  page2.style.display = 'none';
  userNameInput.value = '';
}
function showPage2() {
  page1.style.display = 'none';
  page2.style.display = '';
  greetingEl.textContent = getGreeting(userName);
}

// --- User Name Logic ---
function saveUserName(name) {
  localStorage.setItem(USER_KEY, name);
}
function loadUserName() {
  return localStorage.getItem(USER_KEY) || '';
}

// --- Tasks Logic ---
function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}
function loadTasks() {
  const data = localStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
}

// --- Task Operations ---
function addTask(title, desc, dueDate, category) {
  tasks.push({
    id: Date.now(),
    title,
    desc,
    dueDate,
    category,
    completed: false
  });
  saveTasks();
  renderTasks();
}
function editTask(id, newTitle, newDesc, newDueDate, newCategory) {
  const t = tasks.find(task => task.id === id);
  if (t) {
    t.title = newTitle;
    t.desc = newDesc;
    t.dueDate = newDueDate;
    t.category = newCategory;
  }
  saveTasks();
  renderTasks();
}
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}
function toggleComplete(id) {
  const t = tasks.find(task => task.id === id);
  if (t) t.completed = !t.completed;
  saveTasks();
  renderTasks();
}

// --- Filters ---
function getFilteredTasks() {
  let filtered = [...tasks];
  const status = statusFilter.value;
  const cat = categoryFilter.value;
  if (status === 'pending') filtered = filtered.filter(t => !t.completed);
  else if (status === 'completed') filtered = filtered.filter(t => t.completed);
  if (cat !== 'all') filtered = filtered.filter(t => t.category === cat);
  return filtered;
}

// --- Render ---
function renderTasks() {
  taskList.innerHTML = '';
  const filtered = getFilteredTasks();
  if (filtered.length === 0) {
    taskList.innerHTML = '<li style="text-align:center;color:#888;">No tasks</li>';
    return;
  }
  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleComplete(task.id));
    li.appendChild(checkbox);
    // Task details container
    const details = document.createElement('div');
    details.style.flex = '1';
    // Title (editable)
    const titleEl = document.createElement('span');
    titleEl.className = 'task-title';
    titleEl.textContent = task.title;
    titleEl.title = "Double-click to edit";
    // Description
    const descEl = document.createElement('div');
    descEl.className = 'task-desc';
    descEl.textContent = task.desc;
    // Due date
    const dueEl = document.createElement('div');
    dueEl.className = 'task-due';
    if (task.dueDate) {
      const dueDateObj = new Date(task.dueDate);
      dueEl.textContent = "Due: " + dueDateObj.toLocaleDateString();
    }
    // Category
    const catEl = document.createElement('span');
    catEl.className = 'task-category';
    catEl.textContent = task.category;
    // Editing
    titleEl.addEventListener('dblclick', () => startEditTask(task, li));
    descEl.addEventListener('dblclick', () => startEditTask(task, li));
    dueEl.addEventListener('dblclick', () => startEditTask(task, li));
    catEl.addEventListener('dblclick', () => startEditTask(task, li));
    // Append
    details.appendChild(titleEl);
    details.appendChild(catEl);
    if (task.desc) details.appendChild(descEl);
    if (task.dueDate) details.appendChild(dueEl);
    li.appendChild(details);
    // Actions
    const actions = document.createElement('span');
    actions.className = 'task-actions';
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.title = 'Edit';
    editBtn.textContent = '✏️';
    editBtn.addEventListener('click', () => startEditTask(task, li));
    actions.appendChild(editBtn);
    // Delete button
    const delBtn = document.createElement('button');
    delBtn.title = 'Delete';
    delBtn.textContent = '🗑️';
    delBtn.addEventListener('click', () => deleteTask(task.id));
    actions.appendChild(delBtn);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

// --- Edit Task Modal (inline) ---
function startEditTask(task, li) {
  li.innerHTML = '';
  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleComplete(task.id));
  li.appendChild(checkbox);
  // Edit fields
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.value = task.title;
  titleInput.className = 'edit-input';
  titleInput.style.fontWeight = '600';
  titleInput.required = true;
  const descInput = document.createElement('input');
  descInput.type = 'text';
  descInput.value = task.desc;
  descInput.className = 'edit-input';
  descInput.placeholder = 'Description';
  const dueInput = document.createElement('input');
  dueInput.type = 'date';
  dueInput.value = task.dueDate || '';
  dueInput.className = 'edit-input';
  const catSelect = document.createElement('select');
  catSelect.className = 'edit-input';
  ['Work','Personal','Shopping','Other'].forEach(opt => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt;
    if (task.category === opt) o.selected = true;
    catSelect.appendChild(o);
  });
  // Save/cancel
  const saveBtn = document.createElement('button');
  saveBtn.textContent = '💾';
  saveBtn.title = 'Save';
  saveBtn.type = 'button';
  saveBtn.style.marginLeft = '0.5em';
  saveBtn.addEventListener('click', () => {
    if (!titleInput.value.trim()) return;
    editTask(task.id, titleInput.value.trim(), descInput.value, dueInput.value, catSelect.value);
  });
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = '✖️';
  cancelBtn.title = 'Cancel';
  cancelBtn.type = 'button';
  cancelBtn.addEventListener('click', renderTasks);
  // Inline form
  const form = document.createElement('form');
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '0.3em';
  form.appendChild(titleInput);
  form.appendChild(descInput);
  form.appendChild(dueInput);
  form.appendChild(catSelect);
  const btnRow = document.createElement('div');
  btnRow.appendChild(saveBtn);
  btnRow.appendChild(cancelBtn);
  form.appendChild(btnRow);
  form.addEventListener('submit', e => {
    e.preventDefault();
    saveBtn.click();
  });
  li.appendChild(form);
}

// --- Event Listeners ---
// Page 1: Name form
nameForm.addEventListener('submit', e => {
  e.preventDefault();
  userName = userNameInput.value.trim();
  if (!userName) return;
  saveUserName(userName);
  showPage2();
  greetingEl.textContent = getGreeting(userName);
  tasks = loadTasks();
  renderTasks();
});

// Logout (change user)
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem(USER_KEY);
  showPage1();
});

// Add task
addTaskBtn.addEventListener('click', () => {
  const title = taskTitle.value.trim();
  if (!title) return;
  const desc = taskDesc.value.trim();
  const dueDate = taskDueDate.value;
  const category = categoryInput.value;
  addTask(title, desc, dueDate, category);
  taskTitle.value = '';
  taskDesc.value = '';
  taskDueDate.value = '';
  categoryInput.value = 'Work';
});
taskTitle.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addTaskBtn.click();
    e.preventDefault();
  }
});
taskDesc.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addTaskBtn.click();
    e.preventDefault();
  }
});

// Filters
statusFilter.addEventListener('change', renderTasks);
categoryFilter.addEventListener('change', renderTasks);

// --- Init ---
function init() {
  userName = loadUserName();
  if (userName) {
    showPage2();
    greetingEl.textContent = getGreeting(userName);
    tasks = loadTasks();
    renderTasks();
  } else {
    showPage1();
  }
}
init();

