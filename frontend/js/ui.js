const taskListEl = document.getElementById('task-list');
const emptyMsgEl = document.getElementById('empty-msg');
const editErrorEl = document.getElementById('edit-error');
const modalWrapper = document.getElementById('edit-modal');
const modalContentEl = document.getElementById('edit-modal-content');
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

  // Sort: pending first, completed last. Within each group, sort by due date (earliest first, no-date last).
  filtered = [...filtered].sort((a, b) => {
    // 1. Status: pending before completed
    if (a.status !== b.status) {
      return a.status === 'pending' ? -1 : 1;
    }
    // 2. Due date: tasks with dates before tasks without, then earliest first
    const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
    const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
    return aDate - bDate;
  });

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

function getPriorityIcon(priority) {
  switch(priority) {
    case 'high': return { icon: 'keyboard_double_arrow_up', colorClass: 'text-red-500 animate-glow-blink', bgClass: 'bg-red-500/10' };
    case 'medium': return { icon: 'drag_handle', colorClass: 'text-yellow-500 animate-glow-blink', bgClass: 'bg-yellow-500/10' };
    case 'low': return { icon: 'keyboard_double_arrow_down', colorClass: 'text-green-500 animate-glow-blink', bgClass: 'bg-green-500/10' };
    default: return { icon: 'task_alt', colorClass: 'text-on-surface-variant', bgClass: 'bg-surface-container' };
  }
}

function renderTask(task) {
  const card = document.createElement('div');
  const isCompleted = task.status === 'completed';
  const overdue = !isCompleted && isOverdue(task.due_date);
  
  card.className = `bg-surface-container-lowest rounded-2xl p-sm flex items-center gap-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-container-high group hover:shadow-md transition-shadow relative`;
  card.dataset.id = task.id;

  const priorityData = getPriorityIcon(task.priority);

  let dueDateHtml = '';
  if (task.due_date) {
    dueDateHtml = `
      <span class="inline-flex items-center mt-1 ${overdue ? 'text-error font-medium' : 'text-on-surface-variant'} font-label-sm text-label-sm">
          ${overdue ? 'Overdue: ' : ''}${formatDate(task.due_date)}
      </span>
    `;
  }

  const titleClass = isCompleted ? 'line-through opacity-60' : '';
  const descHtml = task.description
    ? `<p class="font-body-md text-sm text-on-surface-variant line-clamp-1 ${isCompleted ? 'opacity-60' : ''}">${escapeHtml(task.description)}</p>`
    : '';

  card.innerHTML = `
    <div class="w-10 h-10 rounded-xl ${priorityData.bgClass} flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined ${priorityData.colorClass}" style="font-variation-settings: 'FILL' 1;">${priorityData.icon}</span>
    </div>
    
    <div class="flex-1 min-w-0 flex flex-col justify-center">
        <p class="font-body-md text-body-md text-on-surface truncate ${titleClass}">${escapeHtml(task.title)}</p>
        ${descHtml}
        ${dueDateHtml}
    </div>
    
    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button class="action-btn--edit text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-variant transition-colors" data-id="${task.id}" title="Edit">
            <span class="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button class="action-btn--delete text-on-surface-variant hover:text-error p-1 rounded-full hover:bg-surface-variant transition-colors" data-id="${task.id}" title="Delete">
            <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
    </div>

    <div class="w-6 h-6 rounded border-2 relative flex items-center justify-center shrink-0 transition-colors ${isCompleted ? 'border-[#22C55E] bg-[#F0FDF4]' : 'border-outline hover:border-primary bg-surface-container'}">
        <input type="checkbox" class="task-card__checkbox absolute inset-0 opacity-0 cursor-pointer w-full h-full m-0 p-0 z-10" ${isCompleted ? 'checked' : ''} data-id="${task.id}" title="Toggle status">
        ${isCompleted ? '<span class="material-symbols-outlined text-[#22C55E] text-[16px] font-bold">check</span>' : ''}
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

  // Show overlay
  mobileOverlayBg.classList.remove('hidden');
  void mobileOverlayBg.offsetWidth;
  mobileOverlayBg.classList.remove('opacity-0');
  
  // Show modal
  modalWrapper.style.visibility = 'visible';
  modalWrapper.classList.remove('opacity-0');
  modalWrapper.classList.add('opacity-100');
  modalContentEl.classList.remove('translate-y-full', 'md:translate-y-8', 'md:scale-95');
  modalContentEl.classList.add('translate-y-0', 'md:translate-y-0', 'md:scale-100');
  
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

  // Hide modal
  modalWrapper.classList.remove('opacity-100');
  modalWrapper.classList.add('opacity-0');
  modalContentEl.classList.add('translate-y-full', 'md:translate-y-8', 'md:scale-95');
  modalContentEl.classList.remove('translate-y-0', 'md:translate-y-0', 'md:scale-100');
  
  // Hide overlay
  mobileOverlayBg.classList.add('opacity-0');
  
  setTimeout(() => {
    modalWrapper.style.visibility = 'hidden';
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
