const form = document.querySelector('#training-form');
const list = document.querySelector('#training-list');
const template = document.querySelector('#item-template');
const clearAllBtn = document.querySelector('#clear-all');

const totalSessionsEl = document.querySelector('#total-sessions');
const totalMinutesEl = document.querySelector('#total-minutes');
const topTypeEl = document.querySelector('#top-type');

const STORAGE_KEY = 'training-tracker-v1';

/** @type {Array<{id:string,date:string,type:string,duration:number,intensity:string,notes:string}>} */
let trainings = loadTrainings();

render();

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const training = {
    id: crypto.randomUUID(),
    date: form.date.value,
    type: form.type.value,
    duration: Number(form.duration.value),
    intensity: form.intensity.value,
    notes: form.notes.value.trim(),
  };

  trainings.unshift(training);
  persist();
  render();
  form.reset();
});

clearAllBtn.addEventListener('click', () => {
  if (!trainings.length) return;
  const confirmed = confirm('Tem certeza que deseja remover todos os treinos?');
  if (!confirmed) return;

  trainings = [];
  persist();
  render();
});

function render() {
  list.innerHTML = '';

  if (!trainings.length) {
    const empty = document.createElement('li');
    empty.className = 'training-item';
    empty.textContent = 'Nenhum treino registrado ainda.';
    list.append(empty);
  } else {
    trainings.forEach((training) => {
      const clone = template.content.cloneNode(true);
      clone.querySelector('.item-title').textContent = `${training.type} • ${formatDate(training.date)}`;
      clone.querySelector('.item-subtitle').textContent = `${training.duration} min • Intensidade ${training.intensity}`;
      clone.querySelector('.item-notes').textContent = training.notes || 'Sem observações';

      clone.querySelector('.remove').addEventListener('click', () => {
        trainings = trainings.filter((item) => item.id !== training.id);
        persist();
        render();
      });

      list.append(clone);
    });
  }

  const totalSessions = trainings.length;
  const totalMinutes = trainings.reduce((acc, item) => acc + item.duration, 0);
  const topType = getTopType(trainings);

  totalSessionsEl.textContent = String(totalSessions);
  totalMinutesEl.textContent = String(totalMinutes);
  topTypeEl.textContent = topType;
}

function formatDate(dateValue) {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString('pt-BR');
}

function getTopType(items) {
  if (!items.length) return '-';

  const counts = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function loadTrainings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trainings));
}
