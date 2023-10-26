import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';
import axios from 'axios';

const SignUp = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('User');
  const [registrationDate, setRegistrationDate] = useState(''); // Initialize as an empty string

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Generate the current date
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    try {
      const response = await axios.post('http://localhost:3001/signup', {
        name: name,
        address: address,
        contactInfo: contactInfo,
        username: username,
        password: password,
        userType: userType,
        registrationDate: formattedDate, // Use the current date
      });

      if (response.status === 201) {
        alert('Sign-up successful, Please Login!');
        navigate('/login');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="signup-page">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <label>Address:</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address"
        />
        <label>Contact Info:</label>
        <input
          type="text"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder="Enter your contact information"
        />
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
        <label>User Type:</label>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
        >
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
