import React, { useState, useEffect } from 'react';
import './BooksList.css';

function BooksList({ role, tableContext, userID }) {
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState({ column: 'BookID', sortOrder: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks();
  }, [sortBy, searchQuery, userID, tableContext]);

  const fetchBooks = () => {
    const { column, sortOrder } = sortBy;
    let apiUrl = `http://localhost:3001/books-list?sortby=${column}&ascending=${sortOrder}&search=${searchQuery}`;

    if (userID && tableContext === 'reserved-books') {
      apiUrl = `http://localhost:3001/reserved-books?sortby=${column}&ascending=${sortOrder}&userID=${userID}&search=${searchQuery}`;
    }

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBooks(data);
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

  const handleSortChange = (column) => {
    if (column === sortBy.column) {
      const newSortOrder = sortBy.sortOrder === 'asc' ? 'desc' : 'asc';
      setSortBy({ column, sortOrder: newSortOrder });
    } else {
      setSortBy({ column, sortOrder: 'asc' });
    }
  };

  function getStatusIconWithColor(status) {
    if (status === 'Available') {
      return <span className="green-icon">✅</span>;
    } else if (status === 'Checked Out') {
      return <span className="red-icon">❌</span>;
    } else {
      return status;
    }
  }

  const renderSortIndicator = (column) => {
    if (column === sortBy.column) {
      return sortBy.sortOrder === 'asc' ? '↑' : '↓';
    } else {
      return '';
    }
  };

  const renderActions = (book) => {
    if (role === 'user') {
      if (tableContext === 'all-books') {
        return (
          <div>
            <button className="action-button green-button">Borrow</button>
            <button className="action-button red-button">Reserve</button>
          </div>
        );
      } else if (tableContext === 'reserved-books') {
        return (
          <div>
            <button className="action-button green-button">Borrow</button>
            <button className="action-button red-button">Remove</button>
          </div>
        );
      }
    } else if (role === 'admin' && tableContext === 'all-books') {
      return (
        <div>
          <button className="action-button green-button">Edit</button>
          <button className="action-button red-button">Delete</button>
        </div>
      );
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = books.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="BooksList">
      <h1>Library Book Search</h1>
      <input
        type="text"
        placeholder="Search books..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSortChange('BookID')}>
                Book ID {renderSortIndicator('BookID')}
              </th>
              <th onClick={() => handleSortChange('Title')}>
                Title {renderSortIndicator('Title')}
              </th>
              <th onClick={() => handleSortChange('AuthorName')}>
                Author Name {renderSortIndicator('AuthorName')}
              </th>
              <th onClick={() => handleSortChange('Year')}>
                Year {renderSortIndicator('Year')}
              </th>
              <th onClick={() => handleSortChange('Publisher')}>
                Publisher {renderSortIndicator('Publisher')}
              </th>
              <th onClick={() => handleSortChange('GenreID')}>
                Genre ID {renderSortIndicator('GenreID')}
              </th>
              <th onClick={() => handleSortChange('ISBN')}>
                ISBN {renderSortIndicator('ISBN')}
              </th>
              <th onClick={() => handleSortChange('Status')}>
                Status {renderSortIndicator('Status')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((book) => (
              <tr key={book.BookID}>
                <td>{book.BookID}</td>
                <td>{book.Title}</td>
                <td>{book.AuthorName}</td>
                <td>{book.Year}</td>
                <td>{book.Publisher}</td>
                <td>{book.GenreID}</td>
                <td>{book.ISBN}</td>
                <td>{getStatusIconWithColor(book.Status)}</td>
                <td>{renderActions(book)}</td>
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
