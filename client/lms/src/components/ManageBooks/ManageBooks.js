import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageBooks.css'; // Import the CSS file for styling
import BooksList from '../BooksList/BooksList';

const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [formData, setFormData] = useState({
      title: '',
      author: '',
      genre: '',
      isbn: '',
      year: '',
      publisher: '',
    });
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };

  // Function to add a new book (you can implement this)
  const addBook = () => {
    const title = formData.title;
    const author = formData.author;
    const genre = formData.genre;
    const isbn = formData.isbn;
    const year = formData.year;
    const publisher = formData.publisher;
  
    // Make a POST request to add the book
    axios.post('http://localhost:3001/books', {
      title,
      author,
      genre,
      isbn,
      year,
      publisher,
    })
      .then((response) => {
        // Handle success (e.g., display a success message)
        alert('Book added successfully');
        console.log('Book added successfully:', response.data);
        // Update the state or re-fetch the book list
      })
      .catch((error) => {
        alert('Error adding book');
        // Handle errors (e.g., display an error message)
        console.error('Error adding book:', error);
      });
  };

  useEffect(() => {
    // Fetch the list of books from the server
    axios.get('http://localhost:3001/books')
    .then((response) => {
        console.log(response.data);
        setBooks(response.data)
    })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="manage-books">
      <header>
        <h1>Manage Books</h1>
        <p>Manage your library's book collection:</p>
        <BooksList role="admin" tableContext="all-books" ></BooksList>
      </header>

      <main>
      <section className="add-book-section">
          <h2>Add a New Book</h2>
          <form onSubmit={addBook}>
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter the title"
            />
            <label>Author:</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Enter the author"
            />
            <label>Genre:</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              placeholder="Enter the genre"
            />
            <label>ISBN:</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleInputChange}
              placeholder="Enter the ISBN"
            />
            <label>Year:</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              placeholder="Enter the year"
            />
            <label>Publisher:</label>
            <input
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleInputChange}
              placeholder="Enter the publisher"
            />
            <button type="submit">Add Book</button>
          </form>
        </section>

        <section className="book-list-section">
          {/* <h2>Book List</h2>
          <ul className="book-list">
            {books.map((book) => (
              <li key={book.BookID}>
                <span className="book-title">{book.Title}</span>
                <span className="book-author">{book.AuthorName}</span>
                <span className="book-genre">{book.GenreName}</span>
                <button className="delete-button" onClick={() => deleteBook(book.BookID)}>Delete</button>
              </li>
            ))}
          </ul> */}
        </section>
      </main>
    </div>
  );
};

export default ManageBooks;
