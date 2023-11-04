import React, { useState, useEffect } from 'react';
import './BooksList.css';
import axios from 'axios';

function BooksList({ role, tableContext, userID }) {
  // State and variables
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState({ column: 'BookID', sortOrder: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  userID = parseInt(userID);

  // Define columns for different contexts
  const allBooksColumns = [
    { key: 'BookID', label: 'Book ID' },
    { key: 'Title', label: 'Title' },
    { key: 'AuthorName', label: 'Author Name' },
    { key: 'Year', label: 'Year' },
    { key: 'Publisher', label: 'Publisher' },
    { key: 'GenreID', label: 'Genre ID' },
    { key: 'ISBN', label: 'ISBN' },
    { key: 'Status', label: 'Status' },
  ];

  const borrowedBooksColumns = [
    { key: 'BookID', label: 'Book ID' },
    { key: 'Title', label: 'Title' },
    { key: 'AuthorName', label: 'Author Name' },
    { key: 'ISBN', label: 'ISBN' },
    { key: 'BorrowDate', label: 'Borrow Date' },
    { key: 'DueDate', label: 'Due Date' },
    { key: 'FineAmount', label: 'Fine Amount' }
  ];

  const availableBooksColumns = [
    { key: 'BookID', label: 'Book ID' },
    { key: 'Title', label: 'Title' },
    { key: 'AuthorName', label: 'Author Name' },
    { key: 'Year', label: 'Year' },
    { key: 'Publisher', label: 'Publisher' },
    { key: 'GenreID', label: 'Genre ID' },
    { key: 'ISBN', label: 'ISBN' },
    { key: 'Status', label: 'Status' },
  ];

  const overdueBooksColumns = [
    { key: 'BookID', label: 'Book ID' },
    { key: 'Title', label: 'Title' },
    { key: 'AuthorName', label: 'Author Name' },
    { key: 'ISBN', label: 'ISBN' },
    { key: 'BorrowDate', label: 'Borrow Date' },
    { key: 'DueDate', label: 'Due Date' },
    { key: 'FineAmount', label: 'Fine Amount' },
    { key: 'ReturnDate', label: 'Return Date' },
  ];

  // Define columns based on the tableContext
  const columns =
    tableContext === 'borrowed-books'
      ? borrowedBooksColumns
      : tableContext === 'overdue'
      ? overdueBooksColumns
      : tableContext === 'available'
      ? availableBooksColumns
      : allBooksColumns;

  // Fetch books when component mounts or when dependencies change
  useEffect(() => {
    fetchBooks();
  }, [sortBy, searchQuery, userID, tableContext]);

  // Function to fetch books
  const fetchBooks = () => {
    setBooks([]);
    const { column, sortOrder } = sortBy;
    let apiUrl = `http://localhost:3001/books-list?sortby=${column}&ascending=${sortOrder}&search=${searchQuery}`;

    if (tableContext === 'reserved-books') {
      apiUrl = `http://localhost:3001/reserved-books?sortby=${column}&ascending=${sortOrder}&userID=${userID}&search=${searchQuery}`;
    } else if (tableContext === 'borrowed-books') {
      apiUrl = `http://localhost:3001/borrowed-books?sortby=${column}&ascending=${sortOrder}&userID=${userID}`;
    } else if (tableContext === 'overdue') {
      apiUrl = `http://localhost:3001/overdue-books?sortby=${column}&ascending=${sortOrder}`;
    } else if (tableContext === 'available') {
      apiUrl = `http://localhost:3001/available-books?sortby=${column}&ascending=${sortOrder}`;
    }

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Modify date formats
          const modifiedData = data.map((book) => ({
            ...book,
            BorrowDate: formatToMMDDYYYY(book.BorrowDate),
            DueDate: formatToMMDDYYYY(book.DueDate),
            ReturnDate: formatToMMDDYYYY(book.ReturnDate),
          }));

          setBooks(modifiedData);
          setLoading(false);
        } else {
          console.error('Invalid data format:', data);
          setBooks([]);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setBooks([]);
        setLoading(false);
      });
  };

  // Function to format a date to "mm-dd-yyyy" format
  const formatToMMDDYYYY = (dateStr) => {
    const date = new Date(dateStr);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  };

  // Handle sorting change
  const handleSortChange = (column) => {
    if (column === sortBy.column) {
      const newSortOrder = sortBy.sortOrder === 'asc' ? 'desc' : 'asc';
      setSortBy({ column, sortOrder: newSortOrder });
    } else {
      setSortBy({ column, sortOrder: 'asc' });
    }
  };
  const renderSortIndicator = (column) => {
    if (column === sortBy.column) {
      return sortBy.sortOrder === 'asc' ? '↑' : '↓';
    } else {
      return '';
    }
  };

  const deleteBook = (book) => {
    // Make a DELETE request to delete the book
    axios.delete(`http://localhost:3001/books/${book.BookID}`)
      .then((response) => {
        // Handle success (e.g., display a success message)
        alert('Book deleted successfully:', response.data);
        window.location.reload();
        // Update the state or re-fetch the book list
      })
      .catch((error) => {
        // Handle errors (e.g., display an error message)
        alert('Error deleting book:', error);
      });
  };

  const renderActions = (book) => {
    if (role === 'user' && tableContext === 'all-books') {
      return (
        <div>
          <button className="action-button green-button" onClick={() => handleBorrow(book)}>
            Borrow
          </button>
          {/* <button className="action-button red-button">Reserve</button> */}
        </div>
      );
    } else if (role === 'admin' && tableContext === 'all-books') {
      return (
        <div>
          {/* <button className="action-button green-button">Edit</button>
          <button className="action-button red-button" onClick={() => deleteBook(book)} >Delete</button> */}
        </div>
      );
    } else if (role === 'user' && tableContext === 'reserved-books') {
      return (
        <div>
          <button className="action-button green-button" onClick={() => handleBorrow(book)}>
            Borrow
          </button>
          <button className="action-button red-button">Remove</button>
        </div>
      );
    } else if (role === 'user' && tableContext === 'borrowed-books') {
      return (
        <div>
          <button className="action-button green-button" onClick={() => handleReturn(book)}>
            Return
          </button>
        </div>
      );
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = books.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusIconWithColor = (status) => {
    if (status === 'Available') {
      return <span className="green-icon">✅</span>;
    } else if (status === 'Checked Out') {
      return <span className="red-icon">❌</span>;
    } else {
      return status;
    }
  };

  const handleBorrow = (book) => {
    const today = new Date();
    const borrowDate = today.toJSON();
    today.setDate(today.getDate() + 15);
    const dueDate = today.toJSON();
    const fineAmount = 0; // You may calculate the fine amount as needed.
    const bookId = book.BookID;

    // Prepare the data to send to the server
    const requestData = {
      bookId,
      userID, // Make sure 'userID' is defined in your component.
      borrowDate,
      dueDate,
      fineAmount,
    };

    // Send a POST request to the /borrow endpoint
    fetch('http://localhost:3001/borrow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Book borrowed successfully') {
          // Handle success, e.g., update UI or show a success message
        } else {
          // Handle error, e.g., show an error message
        }
      })
      .catch((error) => {
        console.error('Error borrowing book:', error);
        // Handle error, e.g., show an error message
      });
  };

  const handleReturn = (book) => {
    // Implement handling book return here
    // You can send a request to the server to return the book.
    // After a successful return, you can update the UI or show a success message.
  };

  return (
    <div className="BooksList">
      <h1>
        {tableContext === 'borrowed-books'
          ? 'Borrowed Books'
          : tableContext === 'overdue'
          ? 'Overdue Books'
          : tableContext === 'available'
          ? 'Available Books'
          : 'Library Books'}
      </h1>
      {/* ... (Existing code for search input and rendering table) */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} onClick={() => handleSortChange(col.key)}>
                  {col.label} {renderSortIndicator(col.key)}
                </th>
              ))}
              { role === 'user' && (tableContext === 'all-books' || tableContext === 'borrowed-books')? <th>Actions</th>:''}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((book) => (
              <tr key={book.BookID}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.key === 'Status' ? getStatusIconWithColor(book.Status) : book[col.key]}
                  </td>
                ))}
                {role === 'user' && (tableContext === 'all-books' || tableContext === 'borrowed-books') ? <td>{renderActions(book)}</td>: ''}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {books.length > itemsPerPage && (
        <ul>
          {Array.from({ length: Math.ceil(books.length / itemsPerPage) }, (_, index) => (
            <li
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BooksList;
