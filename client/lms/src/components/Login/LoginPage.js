import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    // Here, you can implement your login logic, such as sending a request to an authentication server.
    // For simplicity, we'll just log the entered email and password.
    try {
      const response = await axios.post('http://localhost:3001/login', {
        username: email,
        password: password,
      });

      if (response.status === 200) {
        // Successful login
        alert(response.data.message); // Display the success message
      } else {
      }
    } catch (error) {
      console.error(error);
    }
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>Email:</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        <button type="submit">Login</button>
        {/* Add a signup link that navigates to the SignUp page */}
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;