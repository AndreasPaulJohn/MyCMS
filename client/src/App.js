import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import AboutUs from "./pages/AboutUs";
import Login from "./components/Login";
import Register from "./components/Register";
import PostDetails from "./components/PostDetails";
import CreatePost from "./components/CreatePost";
import EditPost from "./components/EditPost";
import CategoryManagement from "./components/CategoryManagement";
import PrivateRoute from "./components/PrivateRoute";
import SearchResults from "./components/SearchResults";
import Privacy from "./pages/Privacy";
import Imprint from "./pages/Imprint";
import AdminUsers from "./pages/AdminUsers";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider } from "./context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/posts/:id" element={<PostDetails />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/datenschutz" element={<Privacy />} />
              <Route path="/impressum" element={<Imprint />} />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </AdminRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <AdminRoute allowedRoles={['admin']}>
                    <CategoryManagement />
                  </AdminRoute>
                }
              />
              <Route path="/search" element={<SearchResults />} />
              <Route
                path="/posts/new"
                element={
                  <PrivateRoute>
                    <CreatePost />
                  </PrivateRoute>
                }
              />
              <Route
                 path="/edit-post/:id"
                element={
                  <PrivateRoute>
                    <EditPost />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
