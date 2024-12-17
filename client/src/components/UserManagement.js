import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/users`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Hier könnten Sie eine Benutzerbenachrichtigung hinzufügen
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`${API_URL}/${userId}`, { role: newRole });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      // Hier könnten Sie eine Benutzerbenachrichtigung hinzufügen
    }
  };

  const toggleImageUpload = async (userId, canUpload) => {
    try {
      await axios.put(`${API_URL}/${userId}`, { can_upload_images: canUpload });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling image upload permission:', error);
      // Hier könnten Sie eine Benutzerbenachrichtigung hinzufügen
    }
  };

  return (
    <div>
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Can Upload Images</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => updateUserRole(user.id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="author">Author</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={user.can_upload_images}
                  onChange={(e) => toggleImageUpload(user.id, e.target.checked)}
                />
              </td>
              <td>
                {/* Weitere Aktionen... */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;