// Data storage
let studentList = JSON.parse(localStorage.getItem("students")) || [];
let attendanceToday = [];

const studentListEl = document.getElementById("studentList");
const presentListEl = document.getElementById("presentList");
const statusEl = document.getElementById("status");

let attendanceOpen = false;
let attendanceTimer;
const attendanceDuration = 10 * 60 * 1000; // 10 minutes

// Show status message
function showStatus(message, color = "black") {
  statusEl.textContent = message;
  statusEl.style.color = color;
  setTimeout(() => {
    statusEl.textContent = "";
  }, 3000);
}

// Load existing students to UI
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
function deleteStudent(index) {
  if (confirm("Are you sure you want to remove this student?")) {
    studentList.splice(index, 1);
    saveStudents();
    loadStudents();
    showStatus("Student removed.", "orange");
  }
}

loadStudents();

// Save students to localStorage
function saveStudents() {
  localStorage.setItem("students", JSON.stringify(studentList));
}

// Add new single student
document.getElementById("addStudentBtn").addEventListener("click", () => {
  const name = document.getElementById("studentName").value.trim();
  const id = document.getElementById("studentID").value.trim();

  if (!name || !id) {
    showStatus("Please enter both Name and Index Number.", "red");
    return;
  }

  if (studentList.some(s => s.id === id)) {
    showStatus("Student already exists.", "orange");
    return;
  }

  const student = { name, id };
  studentList.push(student);
  saveStudents();

  const li = document.createElement("li");
  li.textContent = `${name} (${id})`;
  studentListEl.appendChild(li);

  document.getElementById("studentName").value = "";
  document.getElementById("studentID").value = "";

  showStatus("Student added successfully.", "green");
});

// Bulk add students
document.getElementById("addBulkBtn").addEventListener("click", () => {
  const bulkText = document.getElementById("bulkStudents").value.trim();
  if (!bulkText) {
    showStatus("Please enter students in the textarea.", "red");
    return;
  }

  const lines = bulkText.split('\n');
  let addedCount = 0;
  let skippedCount = 0;

  lines.forEach(line => {
    const parts = line.split(',');
    if (parts.length !== 2) {
      skippedCount++;
      return; // skip invalid format
    }
    const name = parts[0].trim();
    const id = parts[1].trim();

    if (!name || !id) {
      skippedCount++;
      return;
    }

    if (studentList.some(s => s.id === id)) {
      skippedCount++;
      return; // skip duplicates
    }

    studentList.push({ name, id });
    addedCount++;
  });

  saveStudents();
  loadStudents();
  document.getElementById("bulkStudents").value = "";

  showStatus(`Added ${addedCount} students. Skipped ${skippedCount} entries.`, "green");
});

// Start attendance session
document.getElementById("startBtn").addEventListener("click", () => {
  if (attendanceOpen) {
    showStatus("Attendance is already running.", "orange");
    return;
  }

  attendanceOpen = true;
  attendanceToday = [];
  presentListEl.innerHTML = "";
  showStatus("Attendance started!", "green");

  const endTime = Date.now() + attendanceDuration;

  attendanceTimer = setInterval(() => {
    const remaining = endTime - Date.now();

    if (remaining <= 0) {
      clearInterval(attendanceTimer);
      attendanceOpen = false;
      document.getElementById("timerDisplay").textContent = "Attendance closed.";
      showStatus("Attendance time is over.", "red");
    } else {
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      document.getElementById("timerDisplay").textContent = `Time left: ${minutes}m ${seconds}s`;
    }
  }, 1000);
});

// Show present student with date and time
function addToPresentList(student) {
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  const li = document.createElement("li");
  li.innerHTML = `<strong>${student.name}</strong> (${student.id})<br><small>Marked on: ${date} at ${time}</small>`;
  presentListEl.appendChild(li);
}

// Mark attendance manually by entering index number
document.getElementById("markAttendanceBtn").addEventListener("click", () => {
  if (!attendanceOpen) {
    showStatus("Attendance is not open now.", "red");
    return;
  }

  const id = document.getElementById("attendanceID").value.trim();
  if (!id) {
    showStatus("Please enter an Index Number.", "red");
    return;
  }

  const student = studentList.find(s => s.id === id);
  if (!student) {
    showStatus("Student not found.", "red");
    return;
  }

  if (attendanceToday.some(s => s.id === student.id)) {
    showStatus(`${student.name} already marked present.`, "orange");
    return;
  }

  attendanceToday.push(student);
  addToPresentList(student);
  showStatus(`Marked present: ${student.name}`, "green");
  document.getElementById("attendanceID").value = "";
});
// Toggle between admin and student view
// Default password for admin view
const ADMIN_PASSWORD = "admin500"; // Change this to your secure password
let isAdmin = true;

const toggleBtn = document.getElementById("toggleViewBtn");
const adminSection = document.getElementById("adminSection");

toggleBtn.addEventListener("click", () => {
  if (isAdmin) {
    // Switch to student view
    adminSection.style.display = "none";
    isAdmin = false;
    toggleBtn.textContent = "Switch to Admin View";
  } else {
    // Ask for password to switch to admin
    const password = prompt("Enter admin password:");
    if (password === ADMIN_PASSWORD) {
      adminSection.style.display = "block";
      isAdmin = true;
      toggleBtn.textContent = "Switch to Student View";
    } else {
      alert("Incorrect password. Access denied.");
    }
  }
});




