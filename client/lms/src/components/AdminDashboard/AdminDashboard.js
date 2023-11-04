import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css'; // Import the CSS file for styling
import BooksList from '../BooksList/BooksList';
import Analytics from '../Analytics/Analytics';

const AdminDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);

  useEffect(() => {
    // Fetch pending requests from the server
    axios.get('http://localhost:3001/admin/pending-requests')
      .then((response) => {
        setPendingRequests(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="admin-dashboard">
      <header>
        <h1>Welcome to Your Admin Dashboard</h1>
        <p>Manage library operations and view analytics:</p>
      </header>
      <nav>
        <ul>
          <li>
            <a href="/manage-books">Manage Books</a>
          </li>
          <li>
            <a href="/manage-users">Manage Users</a>
          </li>
        </ul>
      </nav>

      <main>
      <section>
          <h2>Analytics Data</h2>
          <div className="analytics-chart">
            {/* Display analytics chart or data */}
            <Analytics></Analytics>
            </div>
        </section>
        <section>
          <h2>Overdue Books</h2>
          <div className="analytics-chart">
            {/* Display analytics chart or data */}
            <BooksList role="user" tableContext="overdue" />
            </div>
        </section>
        <section>
          <h2>Available Books</h2>
          <div className="analytics-chart">
            {/* Display analytics chart or data */}
            <BooksList role="user" tableContext="available" />
            </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
