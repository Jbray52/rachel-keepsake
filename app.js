const START = new Date(2024, 9, 26);
const $ = selector => document.querySelector(selector);
let current = -1;
let remaining = [];
let deferredInstall;
let visits = Number(localStorage.getItem('rachelVisits') || 0);

function startApp() {
  visits += 1;
  localStorage.setItem('rachelVisits', String(visits));
  renderMemory(true);
  renderDays();
  renderReason();
  renderNotes();
  renderCountdown();
  checkAnniversary();

  if (visits === 10 || visits === 50) {
    const message = visits === 10
      ? 'Ten visits, and I still get butterflies. Love you, Rachel.'
      : 'Fifty little visits. I hope this always feels like a hug from me.';
    showToast(message);
  }
}

function newRound() {
  remaining = Array.from({ length: (window.MEMORIES || []).length }, (_, index) => index);
  for (let index = remaining.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [remaining[index], remaining[swapIndex]] = [remaining[swapIndex], remaining[index]];
  }
  if (remaining.length > 1 && remaining[remaining.length - 1] === current) {
    const first = remaining[0];
    remaining[0] = remaining[remaining.length - 1];
    remaining[remaining.length - 1] = first;
  }
}

function renderMemory(initial = false) {
  const memories = window.MEMORIES || [];
  if (!memories.length) return;
  if (!remaining.length) newRound();

  let next = remaining.pop();
  if (next === current && remaining.length) next = remaining.pop();
  current = next;

  const memory = memories[current];
  const card = $('#polaroid');
  if (!initial) {
    card.classList.add('swap');
    setTimeout(() => card.classList.remove('swap'), 250);
  }

  const image = $('#memory-image');
  const placeholder = $('#photo-placeholder');
  if (memory.image) {
    image.src = memory.image;
    image.alt = memory.alt || 'A favorite memory of us';
    image.classList.remove('hidden');
    placeholder.classList.add('hidden');
    image.onerror = () => {
      image.classList.add('hidden');
      placeholder.classList.remove('hidden');
    };
  } else {
    image.removeAttribute('src');
    image.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }

  $('#memory-caption').textContent = memory.caption || '';
  $('#memory-date').textContent = memory.date || '';
  $('#memory-tag').textContent = memory.tag || '';
}

$('#another-button').addEventListener('click', () => renderMemory());

function today() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function calendarDayNumber(date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

function dayNumber() {
  return calendarDayNumber(today()) - calendarDayNumber(START);
}

function renderDays() {
  $('#days-together').textContent = dayNumber().toLocaleString();
}

function renderReason() {
  const reasons = window.LOVE_REASONS || [];
  if (!reasons.length) return;
  const dayOfYear = Math.floor((today() - new Date(today().getFullYear(), 0, 0)) / 86400000);
  $('#reason-text').textContent = reasons[dayOfYear % reasons.length];
}

function renderNotes() {
  const list = $('#note-list');
  list.innerHTML = '';

  (window.OPEN_WHEN_NOTES || []).forEach(note => {
    const button = document.createElement('button');
    button.className = 'note-button';
    button.type = 'button';
    button.textContent = 'When ' + note.title;
    button.addEventListener('click', () => {
      $('#note-title').textContent = note.title;
      $('#note-content').textContent = note.content;
      $('#note-paper').classList.remove('hidden');
      $('#note-paper').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    list.append(button);
  });
}

$('#close-note').addEventListener('click', () => $('#note-paper').classList.add('hidden'));

function monthCount(date) {
  return (date.getFullYear() - START.getFullYear()) * 12 + date.getMonth() - START.getMonth();
}

function dateAtMonthCount(months) {
  return new Date(START.getFullYear(), START.getMonth() + months, START.getDate());
}

function daysBetween(from, to) {
  return calendarDayNumber(to) - calendarDayNumber(from);
}

function durationLabel(months) {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years && remainingMonths) {
    return years + (years === 1 ? ' year, ' : ' years, ') +
      remainingMonths + (remainingMonths === 1 ? ' month' : ' months');
  }
  if (years) return years + (years === 1 ? ' year' : ' years');
  return months + (months === 1 ? ' month' : ' months');
}

function halfYearLabel(months) {
  const years = months / 12;
  return (Number.isInteger(years) ? String(years) : years.toFixed(1)) +
    (years === 1 ? ' year' : ' years');
}

function renderCountdown() {
  const date = today();
  const elapsedMonths = monthCount(date);
  let nextMonth = elapsedMonths;
  while (dateAtMonthCount(nextMonth) <= date) nextMonth += 1;

  let target = dateAtMonthCount(nextMonth);
  let label = 'our next month together';

  let halfYearMonth = Math.max(24, Math.ceil(elapsedMonths / 6) * 6);
  while (dateAtMonthCount(halfYearMonth) <= date) halfYearMonth += 6;
  const halfYearDate = dateAtMonthCount(halfYearMonth);
  const halfYearDays = daysBetween(date, halfYearDate);

  if (halfYearDays <= 30) {
    target = halfYearDate;
    label = halfYearLabel(halfYearMonth) + ' together';
  }

  const daysLeft = daysBetween(date, target);
  $('#countdown-text').textContent = daysLeft === 0
    ? 'Today is ' + label
    : daysLeft + (daysLeft === 1 ? ' day until ' : ' days until ') + label;
}

const SPECIAL_MILESTONES = {
  100: '100 days',
  365: '365 days',
  500: '500 days',
  730: '730 days',
  750: '750 days',
  1000: '1,000 days',
  1500: '1,500 days'
};

function durationLabelForAnniversary(months) {
  const years = Math.floor(months / 12);
  const extraMonths = months % 12;
  if (years && extraMonths) {
    return years + (years === 1 ? ' year, ' : ' years, ') +
      extraMonths + (extraMonths === 1 ? ' month' : ' months');
  }
  if (years) return years + (years === 1 ? ' year' : ' years');
  return months + (months === 1 ? ' month' : ' months');
}

function checkAnniversary() {
  const date = today();
  const days = dayNumber();
  const months = monthCount(date);
  let key = '';
  let title = '';
  let copy = '';

  if (SPECIAL_MILESTONES[days]) {
    key = 'day-' + days;
    title = SPECIAL_MILESTONES[days] + ' of us';
    copy = 'Every single day with you is one I would choose again.';
  } else if (date.getDate() === 26 && date >= START) {
    key = 'month-' + date.getFullYear() + '-' + (date.getMonth() + 1);
    title = durationLabelForAnniversary(months) + ' together';
    copy = 'Another month of choosing each other. My favorite kind of time.';
  }

  if (key && localStorage.getItem('rachelAnniversary') !== key) {
    localStorage.setItem('rachelAnniversary', key);
    $('#modal-title').textContent = title;
    $('#modal-copy').textContent = copy;
    $('#anniversary-modal').classList.remove('hidden');
    floatHearts();
  }
}

function floatHearts() {
  const field = $('.heart-field');
  field.innerHTML = '';
  for (let index = 0; index < 17; index += 1) {
    const heart = document.createElement('span');
    heart.className = 'float-heart';
    heart.style.left = (Math.random() * 100) + '%';
    heart.style.animationDelay = (Math.random() * 2.7) + 's';
    heart.style.animationDuration = (3.5 + Math.random() * 2) + 's';
    field.append(heart);
  }
}

function closeModal() {
  $('#anniversary-modal').classList.add('hidden');
}

$('#close-modal').addEventListener('click', closeModal);
$('#modal-done').addEventListener('click', closeModal);
$('#anniversary-modal').addEventListener('click', event => {
  if (event.target === $('#anniversary-modal')) closeModal();
});

let toastTimer;
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstall = event;
  $('#install-button').classList.remove('hidden');
});

$('#install-button').addEventListener('click', async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  $('#install-button').classList.add('hidden');
});

startApp();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

