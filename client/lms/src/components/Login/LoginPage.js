import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState(''); // Changed to 'username'
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/login', {
        username: username, // Use 'username' field
        password: password,
      });

      if (response.status === 200) {
        // Successful login
        alert(response.data.message);if (response.data.userType === 'Admin') {
        // Redirect to the admin dashboard
        navigate('/admin-dashboard');
      } else {
        // Redirect to the user dashboard
        navigate('/user-dashboard', { state: response.data });
      }
    } else {
        // Handle login failure
        alert('Login failed');
        setUsername("");
        setPassword("");
      }
    } catch (error) {
      alert('Login failed');
      setUsername("");
      setPassword("");
    }
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        <button type="submit">Login</button>
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
