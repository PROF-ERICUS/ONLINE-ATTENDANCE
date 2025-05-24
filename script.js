// Data storage
let studentList = JSON.parse(localStorage.getItem("students")) || [];
let attendanceToday = JSON.parse(localStorage.getItem("attendanceToday")) || [];

const studentListEl = document.getElementById("studentList");
const presentListEl = document.getElementById("presentList");
const statusEl = document.getElementById("status");
const timerDisplay = document.getElementById("timerDisplay");

let attendanceOpen = false;
let attendanceTimer;
const attendanceDuration = 10 * 60 * 1000; // 10 minutes

// Show status
function showStatus(message, color = "black") {
  statusEl.textContent = message;
  statusEl.style.color = color;
  setTimeout(() => statusEl.textContent = "", 3000);
}

// Save students
function saveStudents() {
  localStorage.setItem("students", JSON.stringify(studentList));
}

// Load student list
function loadStudents() {
  studentListEl.innerHTML = "";
  studentList.forEach((student, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${student.name} (${student.id})
      <button class="removeBtn" onclick="deleteStudent(${index})">Remove</button>
    `;
    studentListEl.appendChild(li);
  });
}

// Delete student
function deleteStudent(index) {
  if (confirm("Are you sure?")) {
    studentList.splice(index, 1);
    saveStudents();
    loadStudents();
    showStatus("Student removed.", "orange");
  }
}

// Add single student
document.getElementById("addStudentBtn").addEventListener("click", () => {
  const name = document.getElementById("studentName").value.trim();
  const id = document.getElementById("studentID").value.trim();

  if (!name || !id) return showStatus("Enter both Name and Index.", "red");
  if (studentList.some(s => s.id === id)) return showStatus("Student exists.", "orange");

  studentList.push({ name, id });
  saveStudents();
  loadStudents();
  document.getElementById("studentName").value = "";
  document.getElementById("studentID").value = "";
  showStatus("Student added.", "green");
});

// Bulk add students
document.getElementById("addBulkBtn").addEventListener("click", () => {
  const bulkText = document.getElementById("bulkStudents").value.trim();
  if (!bulkText) return showStatus("Enter bulk data.", "red");

  const lines = bulkText.split('\n');
  let added = 0, skipped = 0;

  lines.forEach(line => {
    const [name, id] = line.split(',').map(x => x.trim());
    if (!name || !id || studentList.some(s => s.id === id)) return skipped++;
    studentList.push({ name, id });
    added++;
  });

  saveStudents();
  loadStudents();
  document.getElementById("bulkStudents").value = "";
  showStatus(`Added ${added}, Skipped ${skipped}`, "green");
});

// Start attendance
document.getElementById("startBtn").addEventListener("click", () => {
  if (attendanceOpen) return showStatus("Attendance already started.", "orange");

  const endTime = Date.now() + attendanceDuration;
  localStorage.setItem("attendanceEndTime", endTime);
  localStorage.setItem("attendanceToday", JSON.stringify([]));
  attendanceToday = [];
  presentListEl.innerHTML = "";
  attendanceOpen = true;
  startTimer(endTime);
  showStatus("Attendance started!", "green");
});

// Add to present list
function addToPresentList(student) {
  const now = new Date();
  const li = document.createElement("li");
  li.innerHTML = `<strong>${student.name}</strong> (${student.id})<br><small>Marked on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}</small>`;
  presentListEl.appendChild(li);
}

// Mark attendance
document.getElementById("markAttendanceBtn").addEventListener("click", () => {
  if (!attendanceOpen) return showStatus("Attendance closed.", "red");

  const id = document.getElementById("attendanceID").value.trim();
  const student = studentList.find(s => s.id === id);

  if (!id || !student) return showStatus("Student not found.", "red");
  if (attendanceToday.some(s => s.id === id)) return showStatus(`${student.name} already marked.`, "orange");

  attendanceToday.push(student);
  localStorage.setItem("attendanceToday", JSON.stringify(attendanceToday));
  addToPresentList(student);
  showStatus(`Marked: ${student.name}`, "green");
  document.getElementById("attendanceID").value = "";
});

// Timer function
function startTimer(endTime) {
  attendanceOpen = true;
  attendanceTimer = setInterval(() => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) {
      clearInterval(attendanceTimer);
      attendanceOpen = false;
      timerDisplay.textContent = "Attendance closed.";
      localStorage.removeItem("attendanceEndTime");
      showStatus("Attendance ended.", "red");
    } else {
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      timerDisplay.textContent = `Time left: ${m}m ${s}s`;
    }
  }, 1000);
}

// Admin toggle
const ADMIN_PASSWORD = "admin500";
let isAdmin = true;
const toggleBtn = document.getElementById("toggleViewBtn");
const adminSection = document.getElementById("adminSection");

toggleBtn.addEventListener("click", () => {
  if (isAdmin) {
    adminSection.style.display = "none";
    isAdmin = false;
    toggleBtn.textContent = "Switch to Admin View";
  } else {
    const pwd = prompt("Enter admin password:");
    if (pwd === ADMIN_PASSWORD) {
      adminSection.style.display = "block";
      isAdmin = true;
      toggleBtn.textContent = "Switch to Student View";
    } else {
      alert("Incorrect password.");
    }
  }
});

// Print
document.getElementById("printBtn").addEventListener("click", () => {
  const printContents = document.getElementById("presentList").outerHTML;
  const originalContents = document.body.innerHTML;

  document.body.innerHTML = `<h1>Present Students</h1>${printContents}`;
  window.print();
  document.body.innerHTML = originalContents;
  location.reload();
});

// On load, restore attendance and time
document.addEventListener("DOMContentLoaded", () => {
  loadStudents();

  // Restore marked attendance
  attendanceToday.forEach(student => addToPresentList(student));

  // Restore timer
  const endTime = parseInt(localStorage.getItem("attendanceEndTime"));
  if (endTime && Date.now() < endTime) {
    startTimer(endTime);
  } else {
    localStorage.removeItem("attendanceEndTime");
    attendanceOpen = false;
  }
});
