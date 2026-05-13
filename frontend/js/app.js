let allTasks = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadTasks();
  bindFilterEvents();
  bindTaskListEvents();
  bindModalEvents();
}

async function loadTasks() {
  try {
    allTasks = await getTasks();
    if (window.renderTasks) {
      window.renderTasks(allTasks, currentFilter);
    }
  } catch (err) {
    console.error('Failed to load tasks:', err);
  }
}

function updateFilterStyles(activeFilter) {
  const allBtn = document.getElementById('filter-all');
  const allIcon = document.getElementById('filter-all-icon');
  const allText = document.getElementById('filter-all-text');
  
  const pendingBtn = document.getElementById('filter-pending');
  const pendingIcon = document.getElementById('filter-pending-icon');
  
  const completedBtn = document.getElementById('filter-completed');
  const completedIcon = document.getElementById('filter-completed-icon');

  // Reset all
  allIcon.className = 'w-14 h-14 rounded-full border-2 border-outline bg-surface-container-lowest flex items-center justify-center hover:bg-surface-variant transition-colors';
  allText.className = 'font-label-sm text-label-sm text-on-surface-variant font-semibold';
  
  pendingIcon.className = 'w-14 h-14 rounded-full border-2 border-secondary-container bg-surface-container-lowest flex items-center justify-center hover:bg-secondary-container/10 transition-colors';
  
  completedIcon.className = 'w-14 h-14 rounded-full border-2 border-green-500 bg-surface-container-lowest flex items-center justify-center hover:bg-green-500/10 transition-colors';

  // Apply active
  if (activeFilter === 'all') {
    allIcon.className = 'w-14 h-14 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center transition-colors';
    allText.className = 'font-label-sm text-label-sm text-primary font-semibold';
  } else if (activeFilter === 'pending') {
    pendingIcon.className = 'w-14 h-14 rounded-full border-2 border-secondary-container bg-secondary-container/10 flex items-center justify-center transition-colors';
  } else if (activeFilter === 'completed') {
    completedIcon.className = 'w-14 h-14 rounded-full border-2 border-green-500 bg-green-500/10 flex items-center justify-center transition-colors';
  }
}

function bindFilterEvents() {
  document.getElementById('filter-all').addEventListener('click', () => {
    currentFilter = 'all';
    updateFilterStyles('all');
    window.renderTasks(allTasks, currentFilter);
  });

  document.getElementById('filter-pending').addEventListener('click', () => {
    currentFilter = 'pending';
    updateFilterStyles('pending');
    window.renderTasks(allTasks, currentFilter);
  });

  document.getElementById('filter-completed').addEventListener('click', () => {
    currentFilter = 'completed';
    updateFilterStyles('completed');
    window.renderTasks(allTasks, currentFilter);
  });
}

function bindTaskListEvents() {
  const taskList = document.getElementById('task-list');

  taskList.addEventListener('change', async (e) => {
    if (e.target.classList.contains('task-card__checkbox')) {
      const id = e.target.dataset.id;
      try {
        await toggleTask(id);
        await loadTasks();
      } catch (err) {
        console.error('Toggle failed:', err);
      }
    }
  });

  taskList.addEventListener('click', async (e) => {
    const btnEdit = e.target.closest('.action-btn--edit');
    const btnDelete = e.target.closest('.action-btn--delete');

    if (btnEdit) {
      const id = btnEdit.dataset.id;
      const task = allTasks.find(t => t.id == id);
      if (task) window.openEditModal(task);
    }

    if (btnDelete) {
      const id = btnDelete.dataset.id;
      const confirmed = confirm('Are you sure you want to delete this task?');
      if (!confirmed) return;
      try {
        await deleteTask(id);
        
        // If we deleted the task we were currently editing, reset the form
        if (document.getElementById('edit-task-id').value == id) {
           window.closeEditModal();
        }
        
        await loadTasks();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  });
}

function bindModalEvents() {
  const openNewTask = () => window.openEditModal(null);
  
  const headerBtn = document.getElementById('header-new-task-btn');
  if (headerBtn) headerBtn.addEventListener('click', openNewTask);
  
  const mobileBtn = document.getElementById('mobile-new-task-btn');
  if (mobileBtn) mobileBtn.addEventListener('click', openNewTask);

  const clearBtn = document.getElementById('edit-clear-btn');
  if (clearBtn) clearBtn.addEventListener('click', openNewTask);

  const cancelBtn = document.getElementById('edit-cancel-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', () => window.closeEditModal());

  const overlayBg = document.getElementById('mobile-overlay-bg');
  if (overlayBg) {
    overlayBg.addEventListener('click', () => window.closeEditModal());
  }

  document.getElementById('edit-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-task-id').value;
    const title = document.getElementById('edit-title').value.trim();

    if (!title) {
      window.showEditError('Title cannot be empty.');
      return;
    }

    const data = {
      title,
      description: document.getElementById('edit-desc').value.trim(),
      priority: document.getElementById('edit-priority').value,
      due_date: document.getElementById('edit-due').value || null,
    };

    try {
      if (id) {
        // Update existing
        await updateTask(id, data);
      } else {
        // Create new
        await createTask(data);
      }
      window.closeEditModal();
      await loadTasks();
    } catch (err) {
      window.showEditError(err.message);
    }
  });
}
