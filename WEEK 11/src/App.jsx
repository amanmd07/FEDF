import BookingForm from "./components/BookingForm";

function App() {
  const airlineName = import.meta.env.VITE_AIRLINE_NAME || "Skyline Airways";

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="app-title">{airlineName}</h1>
      </header>
      <main className="form-card-wrapper">
        <BookingForm />
      </main>
    </div>
  );
}

export default App;
