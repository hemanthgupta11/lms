import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState({ column: 'UserID', sortOrder: 'asc' });



    const columns = [
        { key: 'UserID', label: 'User ID' },
        { key: 'Name', label: 'Name' },
        { key: 'Address', label: 'Address' },
        { key: 'Phone', label: 'Phone' },
        { key: 'Username', label: 'Username' },
        { key: 'UserType', label: 'User Type' },
        { key: 'RegistrationDate', label: 'Registration Date' },
        // Add an action column with a delete button
        { key: 'Actions', label: 'Actions' },
    ];

    useEffect(() => {
        fetchUsers();
    }, [sortBy]);

    const fetchUsers = () => {
        const { column, sortOrder } = sortBy;
        const apiUrl = `http://localhost:3001/all-users?sortby=${column}&ascending=${sortOrder}`;

        axios
            .get(apiUrl)
            .then((response) => {
                setUsers(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
                setUsers([]);
                setLoading(false);
            });
    };


    const handleDeleteUser = (user) => {
        console.log(user);
        // Make a DELETE request to delete the user
        axios
            .delete(`http://localhost:3001/delete-user/${user.UserID}`)
            .then((response) => {
                alert('User deleted successfully');
                fetchUsers();
            })
            .catch((error) => {
                alert('Error deleting user:', error);
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

    const renderSortIndicator = (column) => {
        if (column === sortBy.column) {
            return sortBy.sortOrder === 'asc' ? '↑' : '↓';
        } else {
            return '';
        }
    };

    return (
        <div>
            <h1>Users List</h1>
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
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.UserID}>
                                {columns.map((col) => (
                                    <td key={col.key}>
                                        {col.key === 'Actions' ? (
                                            <button
                                                className="delete-button" // Apply the CSS class here
                                                onClick={() => handleDeleteUser(user)}
                                            >
                                                Delete
                                            </button>
                                        ) : col.key === 'UserType' ? (
                                            // Handle User Type rendering differently, e.g., render a badge
                                            user.UserType === 'Admin' ? (
                                                <span className="badge badge-danger">Admin</span>
                                            ) : (
                                                <span className="badge badge-primary">User</span>
                                            )
                                        ) : (
                                            user[col.key]
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UsersList;
