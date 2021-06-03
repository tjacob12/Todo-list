class Task {
  constructor(task, completed, dateCompleted) {
    this.id = UUID.generate();
    this.name = task;
    this.completed = completed;
    this.dateCompleted = dateCompleted ? new Date(dateCompleted)  : null;
  }
}


class StorageService {
  constructor() {
    this.tasks = [];
    this.populateTasks();
  }

  populateTasks() {
    let tasks = [];
    let tasksAsString = localStorage.getItem('tasks');
    if (tasksAsString) {
      const taskObjects = JSON.parse(tasksAsString);
      tasks = taskObjects.map(t => new Task(t.name, t.completed, t.dateCompleted));
    }

    this.tasks = tasks;
  }

  addTask(task) {
    this.tasks.push(task);

    const tasksAsString = JSON.stringify(this.tasks);
    localStorage.setItem('tasks', tasksAsString);
  }
  

  updateTask(task) {
    this.tasks = this.tasks.map(x => {
      return x.id == task.id ? task :x;
    });
    this.saveTasks();
  }

  removeTask(uuid) {
    this.tasks = this.tasks.filter(x => x.id != uuid);
    this.saveTasks()
  }

saveTasks() {
  const tasksAsString = JSON.stringify(this.tasks);
  localStorage.setItem('tasks',tasksAsString);
}
}

class UserInterface {
  constructor() {
    this.storage = new StorageService();
    this.table = document.getElementById('table-body');
    this.taskInput = document.getElementById('task-input');
  }

  initialize() {
    this.initializeFormSubmitListener();
    this.populateTasksTable();
  }

  initializeFormSubmitListener() {
    const taskForm = document.getElementById('task-form');
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();

      this.createTaskFromInput();
      this.clearFormInputs();
      this.populateTasksTable();
    });
  }

  createTaskFromInput() {
    const taskName = this.taskInput.value;

    const task = new Task(taskName, false, null);

    this.storage.addTask(task);
  }

  populateTasksTable() {
    this.clearTable();

    for (const task of this.storage.tasks) {
      this.addTaskToTable(task);
    }
  }

  clearTable() {
    let length = this.table.children.length;
    for (let i = 0; i < length; i++) {
      const row = this.table.children[0];
      row.remove();
    }
  }

  addTaskToTable(task) {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${task.name}</td>
      <td>${this.getCompleteIconHtml(task)}</td>
      <td>${this.formatDate(task.dateCompleted)}</td>
      <td>
      <i id="edit-${task.id}" class="bi bi-pencil pointer me-2"></i>
      <i id="delete-${task.id}" class="bi bi-trash pointer"></i> 
      </td>
    `; // Allows the program to find the value by task.id and allows them to edit or delete //

    this.table.append(row);
    this.addCompleteTaskListenerToRow(task);
    this.addDeleteListenerToRow(row);
  }

  getCompleteIconHtml(task) {
    if (task.completed) {
      return `<i id="complete-${task.id}" class="bi bi-circle-fill green pointer"></i>`
    } else { 
      return`<i id="complete -${task.id}" class="bi bi-circle green pointer"></i> `

    }
  }

  formatDate(date) {
    if(!date){return '';}
    let year = date.getFullYear();
    let month = (date.getMonth() +1 +'').padStart(2,'0');
    let day = (date.getDay()+'').padStart(2,'0');
    return `${year}/${month}/${day}`;
  }

  addCompleteTaskListenerToRow(task) {
    document.getElementById('complete-'+ task.id).addEventListener('click', () => {
      task.completed = !task.completed;
      task.dateCompleted = task.completed ? new Date():null;
      this.storage.updateTask(task);
      this.populateTasksTable();
    })
  }

  addDeleteListenerToRow(task) {
    document.getElementById('delete-'+ task.id).addEventListener('click',() => {
      this.storage.updateTask(task.id);
      this.populateTasksTable();
    })
  }

  clearFormInputs() {
    this.taskInput.value = '';
  }
} 


document.addEventListener('DOMContentLoaded', () => {
  const ui = new UserInterface();
  ui.initialize();
});
