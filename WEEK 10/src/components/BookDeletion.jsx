import { useState } from "react";
import { Link } from "react-router-dom";

const INITIAL_BOOKS = [
  { id: 1, title: "Java Programming" },
  { id: 2, title: "Python Fundamentals" },
  { id: 3, title: "React Development" }
];

function BookDeletion() {
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const deleteBook = async (id) => {
    setDeletingId(id);
    setLoading(true);

    // Simulating API Call
    await new Promise(resolve =>
      setTimeout(resolve, 2000)
    );

    setBooks(prevBooks => prevBooks.filter(book => book.id !== id));
    setLoading(false);
    setDeletingId(null);
  };

  const resetInventory = () => {
    setBooks(INITIAL_BOOKS);
    setSearchTerm("");
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-wrapper dashboard-wrapper">
      <div className="glass-panel book-card">
        <div className="deletion-header">
          <div className="title-area">
            <h2>Deaccession Inventory</h2>
            <p>Select titles to permanently retire from the database</p>
          </div>
          <div className="status-badge" style={{ borderColor: "rgba(244, 63, 94, 0.15)", color: "var(--danger)", background: "rgba(244, 63, 94, 0.08)" }}>
            Registry: {books.length} {books.length === 1 ? "Book" : "Books"}
          </div>
        </div>

        {/* Search Bar */}
        {books.length > 0 && (
          <div className="search-container">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="input-field search-input"
              placeholder="Search catalog by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        {/* Global Progress Indicator */}
        {loading && (
          <div>
            <div className="loader-bar-container">
              <div className="loader-bar"></div>
            </div>
            <div className="loading-text-container">
              <svg className="spinner-mini" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              </svg>
              Updating Database & Clearing Registry...
            </div>
          </div>
        )}

        {/* Books List / Empty States */}
        {books.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
            <div>
              <h4 className="empty-title">Archive Empty</h4>
              <p className="empty-desc">No books currently remain in the system inventory.</p>
            </div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <div>
              <h4 className="empty-title">No Search Results</h4>
              <p className="empty-desc">No titles match your query "{searchTerm}". Try a different term.</p>
            </div>
          </div>
        ) : (
          <ul className="books-list">
            {filteredBooks.map(book => (
              <li
                key={book.id}
                className={`book-item ${deletingId === book.id ? "deleting-state" : ""}`}
              >
                <div className="book-info">
                  <svg className="book-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  <span className="book-title">{book.title}</span>
                </div>
                <button
                  onClick={() => deleteBook(book.id)}
                  disabled={loading}
                  className="btn-danger"
                  style={{ padding: "8px 14px", fontSize: "0.85rem" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Retire
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Footer Navigation */}
        <div className="deletion-footer">
          <Link to="/dashboard" className={`btn-secondary ${loading ? "disabled-card" : ""}`} style={{ pointerEvents: loading ? "none" : "auto" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to Dashboard
          </Link>
          {(books.length === 0 || filteredBooks.length === 0) && (
            <button onClick={resetInventory} disabled={loading} className="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
              Reset Inventory Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDeletion;
