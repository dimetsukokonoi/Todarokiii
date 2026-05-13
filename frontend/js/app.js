let allTasks = [];
let currentFilter = 'all';
let currentSortCriteria = 'priority';
let currentSortDirection = 'desc';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadTasks();
  bindFilterEvents();
  bindTaskListEvents();
  bindModalEvents();
  bindSortEvents();
}

async function loadTasks() {
  try {
    allTasks = await getTasks();
    reRender();
  } catch (err) {
    console.error('Failed to load tasks:', err);
  }
}

function reRender() {
  if (window.renderTasks) {
    window.renderTasks(allTasks, currentFilter, currentSortCriteria, currentSortDirection);
  }
}

function updateFilterStyles(activeFilter) {
  const allBtn = document.getElementById('filter-all');
  const pendingBtn = document.getElementById('filter-pending');
  const completedBtn = document.getElementById('filter-completed');

  const inactiveClass = 'flex-1 text-on-primary rounded-full h-full font-title-sm text-title-sm hover:bg-surface-tint hover:bg-opacity-20 transition-all flex items-center justify-center';
  const activeClass = 'flex-1 bg-surface-container-lowest text-primary rounded-full h-full font-title-sm text-title-sm shadow-sm transition-all flex items-center justify-center z-10';

  allBtn.className = inactiveClass;
  pendingBtn.className = inactiveClass;
  completedBtn.className = inactiveClass;

  if (activeFilter === 'all') {
    allBtn.className = activeClass;
  } else if (activeFilter === 'pending') {
    pendingBtn.className = activeClass;
  } else if (activeFilter === 'completed') {
    completedBtn.className = activeClass;
  }
}

function bindFilterEvents() {
  document.getElementById('filter-all').addEventListener('click', () => {
    currentFilter = 'all';
    updateFilterStyles('all');
    reRender();
  });

  document.getElementById('filter-pending').addEventListener('click', () => {
    currentFilter = 'pending';
    updateFilterStyles('pending');
    reRender();
  });

  document.getElementById('filter-completed').addEventListener('click', () => {
    currentFilter = 'completed';
    updateFilterStyles('completed');
    reRender();
  });
}

function bindSortEvents() {
  const sortCriteriaEl = document.getElementById('sort-criteria');
  const sortDirBtn = document.getElementById('sort-direction-btn');
  const sortDirIcon = document.getElementById('sort-direction-icon');
  const sortDirLabel = document.getElementById('sort-direction-label');

  sortCriteriaEl.addEventListener('change', () => {
    currentSortCriteria = sortCriteriaEl.value;
    reRender();
  });

  sortDirBtn.addEventListener('click', () => {
    currentSortDirection = currentSortDirection === 'desc' ? 'asc' : 'desc';
    sortDirIcon.textContent = currentSortDirection === 'desc' ? 'arrow_downward' : 'arrow_upward';
    sortDirLabel.textContent = currentSortDirection === 'desc' ? 'Desc' : 'Asc';
    reRender();
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

  // Close modal when clicking the backdrop area (outside the modal content)
  const modalWrapper = document.getElementById('edit-modal');
  if (modalWrapper) {
    modalWrapper.addEventListener('click', (e) => {
      if (e.target === modalWrapper) window.closeEditModal();
    });
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
