import React, { useEffect, useState } from 'react';
import './UserDashboard.css';
import axios from 'axios';
import BooksList from '../BooksList/BooksList';
import { useLocation } from 'react-router-dom';

const UserDashboard = () => {
   // Use the useLocation hook to access the location object
   const location = useLocation();
   // Extract the props from the state
   const propsFromNavigation = location.state;
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [reservedBooks, setReservedBooks] = useState([]);

  useEffect(() => {
    // Fetch user's borrowing history from the server
    axios.get('http://localhost:3001/user/borrowing-history')
      .then((response) => setBorrowingHistory(response.data))
      .catch((error) => console.error(error));

    // Fetch user's reserved books from the server
    axios.get('http://localhost:3001/user/reserved-books')
      .then((response) => setReservedBooks(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="user-dashboard">
      <header>
        <h1>Welcome to Your User Dashboard</h1>
        <p>Explore your user-specific features below:</p>
      </header>
      <main>
        <section>
          <h2>Your Borrowing History</h2>
          <BooksList role="user" tableContext="borrowed-books" userID= {propsFromNavigation.userId} />
        </section>
        <section>
          {/* <h2>Your Reserved Books</h2>
          <ul>
            {reservedBooks.map((book) => (
              <li key={book.id}>{book.title}</li>
            ))}
          </ul>
          <BooksList role="user" tableContext="reserved-books" userID='1' /> */}
        </section>
        <section>
          <h2>All Books</h2>
          <BooksList role="user" tableContext="all-books" userID={propsFromNavigation.userId}   />
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;
