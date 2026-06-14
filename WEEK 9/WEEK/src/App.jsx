import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./components/Home";
import AddBook from "./components/AddBook";

function App() {
  return (
    <BrowserRouter>
      <header className="app-navbar">
        <div className="nav-container">
          <NavLink to="/" className="nav-logo">
            <span className="nav-logo-icon">L</span>
            <span className="nav-logo-text">Libro</span>
          </NavLink>
          <nav className="nav-links">
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              🏠 Home
            </NavLink>
            <NavLink 
              to="/addbook" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              ➕ Add Book
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/addbook" element={<AddBook />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
