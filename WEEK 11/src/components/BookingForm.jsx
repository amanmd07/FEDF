import { useState } from "react";

const CITIES = [
  "New York",
  "London",
  "Paris",
  "Tokyo",
  "Dubai",
  "Singapore",
  "Sydney",
  "Mumbai",
  "Toronto",
  "Berlin"
];

function BookingForm() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setMessage(
      `Ticket Booked Successfully!
       ${source} → ${destination}
       on ${travelDate}`
    );

    setSource("");
    setDestination("");
    setTravelDate("");
  };

  return (
    <div className="booking-card">
      <h2 className="form-title">Flight Booking</h2>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="input-group">
          <input
            type="text"
            className="input-field"
            placeholder="Source City"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            list="cities-list"
            required
          />
        </div>

        <br /><br />

        <div className="input-group">
          <input
            type="text"
            className="input-field"
            placeholder="Destination City"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            list="cities-list"
            required
          />
        </div>

        <br /><br />

        <div className="input-group">
          <input
            type="date"
            className="input-field date-picker"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            required
          />
        </div>

        <br /><br />

        <button type="submit" className="submit-btn">
          Book Ticket
        </button>

        {/* Browser native datalist for city recommendations */}
        <datalist id="cities-list">
          {CITIES.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </form>

      {message && (
        <div className="success-banner">
          <div className="airplane-path-visual">
            <svg className="flying-plane" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          <h3 className="success-message">{message}</h3>
        </div>
      )}
    </div>
  );
}

export default BookingForm;
