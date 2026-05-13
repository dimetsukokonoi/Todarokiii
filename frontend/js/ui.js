const taskListEl = document.getElementById('task-list');
const emptyMsgEl = document.getElementById('empty-msg');
const editErrorEl = document.getElementById('edit-error');
const modalContent = document.getElementById('edit-modal');
const mobileOverlayBg = document.getElementById('mobile-overlay-bg');
const taskCountMsg = document.getElementById('task-count-msg');

function isOverdue(dueDateStr) {
  if (!dueDateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDateStr) < today;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

function renderTasks(tasks, filter) {
  let filtered = tasks;
  if (filter === 'pending') {
    filtered = tasks.filter(t => t.status === 'pending');
  } else if (filter === 'completed') {
    filtered = tasks.filter(t => t.status === 'completed');
  }

  taskListEl.innerHTML = '';

  // Update greeting count
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  if (taskCountMsg) {
    taskCountMsg.innerHTML = `You have <strong class="text-primary font-semibold">${pendingCount} task${pendingCount !== 1 ? 's' : ''}</strong> to complete today`;
  }

  if (filtered.length === 0) {
    const msg = document.createElement('div');
    msg.className = 'col-span-full py-8 text-center';
    msg.id = 'empty-msg';
    msg.innerHTML = `<p class="font-body-md text-on-surface-variant">${filter === 'all' ? 'No tasks yet. Add one!' : `No ${filter} tasks.`}</p>`;
    taskListEl.appendChild(msg);
    return;
  }

  filtered.forEach(task => {
    taskListEl.appendChild(renderTask(task));
  });
}

function getPriorityColor(priority) {
  switch(priority) {
    case 'high': return 'bg-secondary'; // Red/High
    case 'medium': return 'bg-tertiary-container'; // Yellow/Medium
    case 'low': return 'bg-surface-variant border-2 border-outline'; // Subtle/Low
    default: return 'bg-primary';
  }
}

function renderTask(task) {
  const card = document.createElement('div');
  const isCompleted = task.status === 'completed';
  const overdue = !isCompleted && isOverdue(task.due_date);
  
  card.className = `bg-surface-container-lowest rounded-[1.5rem] p-md border ${overdue ? 'border-secondary' : 'border-outline-variant'} shadow-sm relative overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between`;
  card.dataset.id = task.id;

  const priorityStyle = getPriorityColor(task.priority);

  // Background Texture
  const bgDecoration = isCompleted 
    ? `<div class="absolute right-0 top-0 w-1/2 h-full opacity-20 bg-gradient-to-br from-transparent to-green-500 rounded-bl-full pointer-events-none transition-all"></div>`
    : `<div class="absolute right-0 top-0 w-1/2 h-full opacity-10 bg-gradient-to-br from-transparent to-primary rounded-bl-full pointer-events-none transition-all group-hover:opacity-20"></div>`;

  let dueDateHtml = '';
  if (task.due_date) {
    dueDateHtml = `
      <span class="inline-flex items-center ${overdue ? 'bg-secondary/10 text-secondary' : 'bg-surface-container-high text-on-surface-variant'} px-3 py-1 rounded-full font-label-sm text-label-sm">
          ${overdue ? 'Overdue: ' : ''}${formatDate(task.due_date)}
      </span>
    `;
  }

  const titleHtml = `<h4 class="font-label-lg text-label-lg text-on-surface mb-1 group-hover:text-primary transition-colors ${isCompleted ? 'line-through opacity-60' : ''}">${escapeHtml(task.title)}</h4>`;
  const descHtml = task.description
    ? `<p class="font-body-md text-body-md text-on-surface-variant mb-2 line-clamp-2 ${isCompleted ? 'opacity-60' : ''}">${escapeHtml(task.description)}</p>`
    : `<p class="font-body-md text-body-md text-on-surface-variant opacity-0 mb-2">No description</p>`;

  card.innerHTML = `
    ${bgDecoration}
    <div class="relative z-10 flex flex-col h-full justify-between gap-md">
        <div>
            <div class="flex justify-between items-start mb-2">
                ${titleHtml}
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="action-btn--edit text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-variant transition-colors" data-id="${task.id}" title="Edit">
                        <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button class="action-btn--delete text-on-surface-variant hover:text-secondary p-1 rounded-full hover:bg-surface-variant transition-colors" data-id="${task.id}" title="Delete">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
            </div>
            ${descHtml}
            ${dueDateHtml}
        </div>
        
        <div class="mt-4 pt-2 border-t border-outline-variant/50 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded border-2 ${isCompleted ? 'bg-green-500 border-green-500' : 'border-outline hover:border-primary cursor-pointer'} flex items-center justify-center relative transition-colors">
                    <input type="checkbox" class="task-card__checkbox absolute inset-0 opacity-0 cursor-pointer w-full h-full m-0 p-0 z-10" ${isCompleted ? 'checked' : ''} data-id="${task.id}" title="Toggle status">
                    ${isCompleted ? '<span class="material-symbols-outlined text-white text-[16px] font-bold">check</span>' : ''}
                </div>
                <span class="font-label-sm text-label-sm ${isCompleted ? 'text-green-600' : 'text-on-surface-variant'}">${isCompleted ? 'Completed' : 'Pending'}</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="font-label-sm text-label-sm text-on-surface-variant capitalize">${task.priority}</span>
                <span class="w-3 h-3 rounded-full ${priorityStyle}"></span>
            </div>
        </div>
    </div>
  `;

  return card;
}

function showEditError(message) {
  editErrorEl.textContent = message;
  editErrorEl.classList.remove('hidden');
}

function clearEditError() {
  editErrorEl.textContent = '';
  editErrorEl.classList.add('hidden');
}

function openEditModal(task = null) {
  clearEditError();
  const titleEl = document.getElementById('edit-modal-title');
  const submitBtn = document.getElementById('edit-save-btn');
  
  if (task) {
    titleEl.textContent = 'Edit Task';
    submitBtn.textContent = 'Save Changes';
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-title').value = task.title;
    document.getElementById('edit-desc').value = task.description || '';
    document.getElementById('edit-priority').value = task.priority;
    document.getElementById('edit-due').value = task.due_date || '';
  } else {
    titleEl.textContent = 'New Task';
    submitBtn.textContent = 'Save Task';
    document.getElementById('edit-task-id').value = '';
    document.getElementById('edit-title').value = '';
    document.getElementById('edit-desc').value = '';
    document.getElementById('edit-priority').value = 'medium';
    document.getElementById('edit-due').value = '';
  }

  // Mobile Animation
  mobileOverlayBg.classList.remove('hidden');
  void mobileOverlayBg.offsetWidth; // force reflow
  mobileOverlayBg.classList.remove('opacity-0');
  
  modalContent.classList.remove('translate-y-full');
  
  // Focus logic
  setTimeout(() => {
    document.getElementById('edit-title').focus();
  }, 300);
}

function closeEditModal() {
  // Reset form silently
  document.getElementById('edit-modal-title').textContent = 'New Task';
  document.getElementById('edit-save-btn').textContent = 'Save Task';
  document.getElementById('edit-task-form').reset();
  document.getElementById('edit-task-id').value = '';
  document.getElementById('edit-priority').value = 'medium';
  clearEditError();

  // Mobile Animation out
  mobileOverlayBg.classList.add('opacity-0');
  modalContent.classList.add('translate-y-full');
  
  setTimeout(() => {
    mobileOverlayBg.classList.add('hidden');
  }, 300);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.showEditError = showEditError;
window.renderTasks = renderTasks;
