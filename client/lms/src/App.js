
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/Login/LoginPage';
import SignUp from './components/Signup/SignupPage';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import UserDashboard from './components/UserDashboard/UserDashboard';
import ManageBooks from './components/ManageBooks/ManageBooks';
import ManageUsers from './components/ManageUsers/ManageUsers'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/manage-books" element={<ManageBooks/>}/>
        <Route path="/manage-users" element={<ManageUsers/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
