import { state, setState } from "../state.js";

// Add Employee
window.addEmployee = function () {
  const name = prompt("Enter Name:");
  if (!name) return;

  const newEmp = {
    id: state.employees.length + 1,
    name,
    score: 50,
    present: true
  };

  setState({
    employees: [...state.employees, newEmp]
  });
};

// Update Score (manual)
window.updateScore = function () {
  const id = Number(prompt("Enter Employee ID:"));
  const newScore = prompt("Enter New Score:");

  if (!id || newScore === null) return;

  const updated = state.employees.map(emp =>
    emp.id === id
      ? { ...emp, score: Number(newScore) }
      : emp
  );

  setState({ employees: updated });
};

// Edit Name
window.editName = function (id) {
  const name = prompt("Enter new name:");
  if (!name) return;

  const updated = state.employees.map(emp =>
    emp.id === id ? { ...emp, name } : emp
  );

  setState({ employees: updated });
};

// Edit Score
window.editScore = function (id) {
  const score = Number(prompt("Enter new score:"));
  if (!score) return;

  const updated = state.employees.map(emp =>
    emp.id === id ? { ...emp, score } : emp
  );

  setState({ employees: updated });
};

// Toggle Attendance
window.toggleAttendance = function (id) {
  const updated = state.employees.map(emp =>
    emp.id === id
      ? { ...emp, present: !emp.present }
      : emp
  );

  setState({ employees: updated });
};

// Search
window.searchEmployee = function (query) {
  query = query.toLowerCase();

  if (query === "") {
    setState({ employees: [...state.allEmployees] });
    return;
  }

  const filtered = state.allEmployees.filter(emp =>
    emp.name.toLowerCase().includes(query)
  );

  setState({ employees: filtered });
};

// Delete
window.deleteEmployee = function (id) {
  const updated = state.employees.filter(emp => emp.id !== id);
  setState({ employees: updated });
};

// Download PDF
window.downloadPDF = function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Employee Report", 14, 10);

  const tableData = state.employees.map(emp => [
    emp.id,
    emp.name,
    emp.score,
    emp.present ? "Present" : "Absent"
  ]);

  doc.autoTable({
    head: [["ID", "Name", "Score", "Attendance"]],
    body: tableData
  });

  doc.save("employees.pdf");
};