const storageKeys = {
  users: "lifeBalanceUsers",
  workouts: "lifeBalanceWorkouts",
};

const defaultUsers = [
  { username: "professor", password: "1234", role: "professor", name: "Professor" },
  { username: "aluno1", password: "1234", role: "aluno", name: "Aluno 1" },
];

const refs = {
  loginScreen: document.querySelector("#login-screen"),
  loginForm: document.querySelector("#login-form"),
  loginType: document.querySelector("#login-type"),
  username: document.querySelector("#username"),
  password: document.querySelector("#password"),
  loginError: document.querySelector("#login-error"),
  dashboard: document.querySelector("#dashboard"),
  professorPanel: document.querySelector("#professor-panel"),
  welcomeTitle: document.querySelector("#welcome-title"),
  welcomeSubtitle: document.querySelector("#welcome-subtitle"),
  logoutBtn: document.querySelector("#logout-btn"),
  studentForm: document.querySelector("#student-form"),
  studentName: document.querySelector("#student-name"),
  studentUser: document.querySelector("#student-user"),
  studentPass: document.querySelector("#student-pass"),
  studentFeedback: document.querySelector("#student-feedback"),
  workoutForm: document.querySelector("#workout-form"),
  workoutStudent: document.querySelector("#workout-student"),
  workoutTitle: document.querySelector("#workout-title"),
  workoutDescription: document.querySelector("#workout-description"),
  workoutVideo: document.querySelector("#workout-video"),
  workoutFeedback: document.querySelector("#workout-feedback"),
  workoutList: document.querySelector("#workout-list"),
};

let currentUser = null;

function loadUsers() {
  const users = JSON.parse(localStorage.getItem(storageKeys.users) || "null");
  if (Array.isArray(users) && users.length) return users;
  localStorage.setItem(storageKeys.users, JSON.stringify(defaultUsers));
  return [...defaultUsers];
}

function saveUsers(users) {
  localStorage.setItem(storageKeys.users, JSON.stringify(users));
}

function loadWorkouts() {
  return JSON.parse(localStorage.getItem(storageKeys.workouts) || "[]");
}

function saveWorkouts(workouts) {
  localStorage.setItem(storageKeys.workouts, JSON.stringify(workouts));
}

function getStudents(users) {
  return users.filter((user) => user.role === "aluno");
}

function populateStudentOptions() {
  const students = getStudents(loadUsers());
  refs.workoutStudent.innerHTML = "";
  students.forEach((student) => {
    const option = document.createElement("option");
    option.value = student.username;
    option.textContent = `${student.name} (${student.username})`;
    refs.workoutStudent.append(option);
  });
}

function isYoutubeUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be");
  } catch {
    return false;
  }
}

function renderWorkouts() {
  const workouts = loadWorkouts();
  const users = loadUsers();
  const userMap = Object.fromEntries(users.map((user) => [user.username, user.name]));

  const visibleWorkouts = currentUser?.role === "professor"
    ? workouts
    : workouts.filter((workout) => workout.studentUser === currentUser?.username);

  refs.workoutList.innerHTML = "";

  if (!visibleWorkouts.length) {
    refs.workoutList.innerHTML = "<p>Nenhum treino cadastrado para este perfil.</p>";
    return;
  }

  visibleWorkouts.forEach((workout) => {
    const card = document.createElement("article");
    card.className = "workout-card";
    card.innerHTML = `
      <h4>${workout.title}</h4>
      <p class="workout-meta">Aluno: ${userMap[workout.studentUser] || workout.studentUser}</p>
      <p>${workout.description}</p>
      <a href="${workout.videoUrl}" target="_blank" rel="noopener noreferrer">Ver vídeo no YouTube</a>
    `;
    refs.workoutList.append(card);
  });
}

function showDashboard(user) {
  currentUser = user;
  refs.loginScreen.classList.add("hidden");
  refs.dashboard.classList.remove("hidden");
  refs.welcomeTitle.textContent = `Olá, ${user.name}!`;
  refs.welcomeSubtitle.textContent =
    user.role === "professor"
      ? "Você pode cadastrar alunos e montar treinos com vídeos do YouTube."
      : "Aqui estão os seus treinos e vídeos recomendados.";

  refs.professorPanel.classList.toggle("hidden", user.role !== "professor");

  if (user.role === "professor") {
    populateStudentOptions();
  }

  renderWorkouts();
}

function logout() {
  currentUser = null;
  refs.loginForm.reset();
  refs.loginError.textContent = "";
  refs.loginScreen.classList.remove("hidden");
  refs.dashboard.classList.add("hidden");
}

refs.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const role = refs.loginType.value;
  const username = refs.username.value.trim();
  const password = refs.password.value;

  const users = loadUsers();
  const user = users.find(
    (entry) =>
      entry.username === username && entry.password === password && entry.role === role,
  );

  if (!user) {
    refs.loginError.textContent = "Credenciais inválidas para o perfil selecionado.";
    return;
  }

  refs.loginError.textContent = "";
  showDashboard(user);
});

refs.logoutBtn.addEventListener("click", logout);

refs.studentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = refs.studentName.value.trim();
  const username = refs.studentUser.value.trim();
  const password = refs.studentPass.value;

  const users = loadUsers();

  if (users.some((user) => user.username === username)) {
    refs.studentFeedback.textContent = "Usuário já existe. Escolha outro.";
    return;
  }

  users.push({ name, username, password, role: "aluno" });
  saveUsers(users);
  refs.studentForm.reset();
  refs.studentFeedback.textContent = "Aluno cadastrado com sucesso!";
  populateStudentOptions();
});

refs.workoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const studentUser = refs.workoutStudent.value;
  const title = refs.workoutTitle.value.trim();
  const description = refs.workoutDescription.value.trim();
  const videoUrl = refs.workoutVideo.value.trim();

  if (!isYoutubeUrl(videoUrl)) {
    refs.workoutFeedback.textContent = "Informe um link válido do YouTube.";
    return;
  }

  const workouts = loadWorkouts();
  workouts.push({
    id: crypto.randomUUID(),
    studentUser,
    title,
    description,
    videoUrl,
  });
  saveWorkouts(workouts);

  refs.workoutForm.reset();
  refs.workoutFeedback.textContent = "Treino salvo com sucesso!";
  renderWorkouts();
});
