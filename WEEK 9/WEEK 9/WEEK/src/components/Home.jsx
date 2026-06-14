import { useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [books, setBooks] = useState(() => {
    const storedBooks = localStorage.getItem("libro_books");
    if (storedBooks) {
      return JSON.parse(storedBooks);
    } else {
      // Pre-populate with beautiful sample books for premium demonstration
      const defaultBooks = [
        {
          id: "1",
          title: "The Midnight Library",
          author: "Matt Haig",
          isbn: "978-0525559474"
        },
        {
          id: "2",
          title: "Dune",
          author: "Frank Herbert",
          isbn: "978-0441172719"
        },
        {
          id: "3",
          title: "Atomic Habits",
          author: "James Clear",
          isbn: "978-0735211292"
        }
      ];
      localStorage.setItem("libro_books", JSON.stringify(defaultBooks));
      return defaultBooks;
    }
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Handle book deletion
  const handleDelete = (id) => {
    const updatedBooks = books.filter((book) => book.id !== id);
    setBooks(updatedBooks);
    localStorage.setItem("libro_books", JSON.stringify(updatedBooks));
  };

  // Filter books by search term
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm)
  );

  // Compute stats
  const totalBooks = books.length;
  const uniqueAuthors = new Set(books.map((b) => b.author.trim().toLowerCase())).size;

  return (
    <div>
      {/* Hero Header */}
      <section className="hero-section">
        <h1 className="hero-title">Library Management System</h1>
        <p className="hero-subtitle">Welcome to your Libro digital book portal</p>
      </section>

      {/* Stats Dashboard Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">📚</div>
          <div className="stat-info">
            <span className="stat-value">{totalBooks}</span>
            <span className="stat-label">Total Books</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon secondary">✍️</div>
          <div className="stat-info">
            <span className="stat-value">{uniqueAuthors}</span>
            <span className="stat-label">Unique Authors</span>
          </div>
        </div>
      </section>

      {/* Search Input Container */}
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search Library"
        />
      </div>

      {/* Book Grid */}
      {filteredBooks.length > 0 ? (
        <div className="book-grid">
          {filteredBooks.map((book) => (
            <article className="book-card" key={book.id}>
              <div className="book-details">
                <div className="book-header">
                  <h3 className="book-title">{book.title}</h3>
                </div>
                <p className="book-author">by {book.author}</p>
                <div className="book-isbn-tag">ISBN: {book.isbn}</div>
              </div>
              <div className="card-footer">
                <button
                  onClick={() => handleDelete(book.id)}
                  className="delete-btn"
                  aria-label={`Remove book ${book.title}`}
                >
                  🗑️ Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <h3>No books found</h3>
          <p>
            {searchTerm
              ? "We couldn't find any matches matching your query. Try a different search terms."
              : "Your library is currently empty. Start cataloging your book collection now!"}
          </p>
          {!searchTerm && (
            <Link to="/addbook">
              <button className="empty-state-btn">Add First Book</button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
