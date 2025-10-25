const form = document.getElementById("reminderForm");
const reminderList = document.getElementById("reminderList");
let reminders = [];

// Ask for Notification permission
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Load from localStorage
window.onload = () => {
  const saved = localStorage.getItem("reminders");
  if (saved) {
    reminders = JSON.parse(saved);
    renderReminders();
  }
  checkReminders();
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const medicine = document.getElementById("medicineName").value.trim();
  const time = document.getElementById("reminderTime").value;
  const foodType = document.getElementById("foodType").value;
  const daysPeriod = parseInt(document.getElementById("daysPeriod").value);

  if (!medicine || !time || !foodType || !daysPeriod) return;

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + daysPeriod - 1);

  const newReminder = { medicine, time, foodType, endDate: endDate.toISOString() };
  reminders.push(newReminder);
  localStorage.setItem("reminders", JSON.stringify(reminders));

  renderReminders();
  form.reset();
});

function renderReminders() {
  reminderList.innerHTML = "";
  reminders.forEach((r, index) => {
    const end = new Date(r.endDate).toLocaleDateString();
    const div = document.createElement("div");
    div.className = "reminder-item";
    div.innerHTML = `
      <div class="reminder-top">
        <strong>${r.medicine}</strong>
        <button class="delete-btn" onclick="deleteReminder(${index})">X</button>
      </div>
      <div class="food-info">Time: ${r.time} | ${r.foodType}</div>
      <div class="food-info">Until: ${end}</div>
    `;
    reminderList.appendChild(div);
  });
}

function deleteReminder(index) {
  reminders.splice(index, 1);
  localStorage.setItem("reminders", JSON.stringify(reminders));
  renderReminders();
}

function checkReminders() {
  setInterval(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    reminders.forEach((r) => {
      const endDate = new Date(r.endDate);
      if (now <= endDate && r.time === currentTime) {
        showNotification(r.medicine, r.foodType);
      }
    });

    // Remove expired reminders
    reminders = reminders.filter((r) => new Date() <= new Date(r.endDate));
    localStorage.setItem("reminders", JSON.stringify(reminders));
    renderReminders();
  }, 60000);
}

function showNotification(medicine, foodType) {
  if (Notification.permission === "granted") {
    new Notification("💊 Medicine Reminder", {
      body: `${medicine} — ${foodType}`,
      icon: "https://cdn-icons-png.flaticon.com/512/2966/2966481.png"
    });
  } else {
    alert(`💊 ${medicine} — ${foodType}`);
  }
}
