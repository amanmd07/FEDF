import React from "react";
import RegistrationForm from "./components/RegistrationForm";
import "./components/RegistrationForm.css";

function App() {
  return (
    <div className="app-shell">
      <header className="page-header">
        <p className="eyebrow">Welcome to</p>
        <h1 className="main-title">Student Registration System</h1>
        <p className="subtitle">
          Complete your enrollment with a clean, fast, and secure registration form.
        </p>
      </header>
      <RegistrationForm />
    </div>
  );
}

export default App;