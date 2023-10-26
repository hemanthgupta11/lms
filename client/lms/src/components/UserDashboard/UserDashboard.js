import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserDashboard.css';

const UserDashboard = () => {
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [reservedBooks, setReservedBooks] = useState([]);

  useEffect(() => {
    // Fetch user's borrowing history from the server
    axios.get('http://localhost:3001/user/borrowing-history')
      .then((response) => {
        setBorrowingHistory(response.data);
      })
      .catch((error) => {
        console.error(error);
      });

    // Fetch user's reserved books from the server
    axios.get('http://localhost:3001/user/reserved-books')
      .then((response) => {
        setReservedBooks(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="user-dashboard">
      <header>
        <h1>Welcome to Your User Dashboard</h1>
        <p>Explore your user-specific features below:</p>
      </header>

      <nav>
        <ul>
          <li>
            <a href="/search-books">Search for Books</a>
          </li>
          <li>
            <a href="/borrowing-history">View Borrowing History</a>
          </li>
          <li>
            <a href="/reserve-books">Reserve Books</a>
          </li>
          <li>
            <a href="/pay-fines">Pay Fines</a>
          </li>
        </ul>
      </nav>

      <main>
        <section>
            <h2>Your Borrowing History</h2>
            <table>
                <thead>
                <tr>
                    <th>Book Title</th>
                    <th>Author</th>
                    <th>Borrowed On</th>
                    <th>Due Date</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {borrowingHistory.map((record) => (
                    <tr key={record.id}>
                    <td>{record.bookTitle}</td>
                    <td>{record.author}</td>
                    <td>{record.borrowedOn}</td>
                    <td>{record.dueDate}</td>
                    <td>{record.status}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </section>
        <section>
            <h2>Your Reserved Books</h2>
            <ul>
                {reservedBooks.map((book) => (
                <li key={book.id}>{book.title}</li>
                ))}
            </ul>
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;