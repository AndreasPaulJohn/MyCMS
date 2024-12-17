import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { getCategories, createCategory, deleteCategory } from '../services/api';
import './CreatePost.css'; // Verwenden Sie die gleiche CSS-Datei wie für CreatePost

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { isAuthenticated, isAdminUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated && isAdminUser) {
      fetchCategories();
    }
  }, [isAuthenticated, isAdminUser]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError(error.response?.data?.message || 'An unexpected error occurred');
    }
  };

  const handleInputChange = (e) => {
    setNewCategory({ ...newCategory, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCategory(newCategory);
      setSuccess('Category created successfully');
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
      setError(error.response?.data?.message || 'An unexpected error occurred');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      setSuccess('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      setError(error.response?.data?.message || 'An unexpected error occurred');
    }
  };

  if (!isAuthenticated || !isAdminUser) {
    return <Navigate to="/login" />;
  }

  return (
    <Container className="mt-5 create-post-container">
      <h2>Category Management</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={newCategory.name}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={newCategory.description}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Button variant="success" type="submit">Add Category</Button>
      </Form>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Slug</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>{category.description}</td>
              <td>{category.slug}</td>
              <td>
                <Button variant="danger" onClick={() => handleDelete(category.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default CategoryManagement;