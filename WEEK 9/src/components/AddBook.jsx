import { useState } from "react";
import { Link } from "react-router-dom";

function AddBook() {
  const [bookTitle, setBookTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [addedBookInfo, setAddedBookInfo] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create the new book entry
    const newBook = {
      id: Date.now().toString(), // unique identifier
      title: bookTitle.trim(),
      author: author.trim(),
      isbn: isbn.trim()
    };

    // Retrieve, append, and save to localStorage
    const storedBooks = localStorage.getItem("libro_books");
    const currentBooks = storedBooks ? JSON.parse(storedBooks) : [];
    const updatedBooks = [...currentBooks, newBook];
    localStorage.setItem("libro_books", JSON.stringify(updatedBooks));

    // Save info for success screen, display it, and clear input fields
    setAddedBookInfo(newBook);
    setIsSuccess(true);
    setBookTitle("");
    setAuthor("");
    setIsbn("");
  };

  const handleReset = () => {
    setIsSuccess(false);
    setAddedBookInfo(null);
  };

  if (isSuccess && addedBookInfo) {
    return (
      <div className="success-card">
        <div className="success-icon-container">✓</div>
        <h3>Book Cataloged!</h3>
        <p className="form-subtitle">The book has been successfully saved to your library portal.</p>
        
        <div className="success-details">
          <strong>{addedBookInfo.title}</strong>
          <br />
          <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            by {addedBookInfo.author} &bull; ISBN: {addedBookInfo.isbn}
          </span>
        </div>

        <div className="success-actions">
          <button onClick={handleReset} className="btn-secondary">
            Add Another Book
          </button>
          <Link to="/">
            <button className="btn-primary">Go to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-card">
      <div className="form-header">
        <h2 className="form-title">Add New Book</h2>
        <p className="form-subtitle">Expand your digital library catalog with a new entry</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Book Title
          </label>
          <input
            id="title"
            type="text"
            className="form-control"
            placeholder="e.g. The Hobbit"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            required
            aria-label="Book Title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="author" className="form-label">
            Author
          </label>
          <input
            id="author"
            type="text"
            className="form-control"
            placeholder="e.g. J.R.R. Tolkien"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            aria-label="Author Name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="isbn" className="form-label">
            ISBN
          </label>
          <input
            id="isbn"
            type="text"
            className="form-control"
            placeholder="e.g. 978-0261102217"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            required
            aria-label="ISBN Number"
          />
        </div>

        <button type="submit" className="submit-btn">
          ✨ Add Book
        </button>
      </form>
    </div>
  );
}

export default AddBook;
