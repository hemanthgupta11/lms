import React from 'react';
import UsersList from '../UsersList/UsersList';
import './ManageUsers.css'; // Import your CSS file

const ManageUsers = () => {
  return (
    <div className="manage-users">
      <h1>Manage Users</h1>
      <div className="users-list-container">
        <UsersList />
      </div>
    </div>
  );
};

export default ManageUsers;
