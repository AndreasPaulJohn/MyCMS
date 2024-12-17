import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  Form,
  FormControl,
  Button,
  NavDropdown,
} from "react-bootstrap";
import { logout } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import "./components.css";

const Header = () => {
  const navigate = useNavigate();
  const { user, setUser, isAuthenticated, isAdminUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  return (
    <Navbar expand="lg" className="mb-3 lightGreen ">
      <Container>
        <Navbar.Brand
          className="bootstrap-success-green-header"
          as={Link}
          to="/"
          aria-label="Home page"
        >
          &#127808;CodeClover
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav " />
        <Navbar.Collapse id="basic-navbar ">
          <Nav className="me-auto ">
            <Nav.Link as={Link} to="/" aria-label="Home page">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/contact" aria-label="Kontaktseite">
              Kontakt
            </Nav.Link>
            <Nav.Link as={Link} to="/about" aria-label="Ueber uns">
              About
            </Nav.Link>
            {isAdminUser && (
              <Nav.Link as={Link} to="/admin/users">
              User
              </Nav.Link>
            )}
            {isAdminUser && (
              <Nav.Link as={Link} to="/categories">
              Categories
              </Nav.Link>
            )}
          </Nav>

          <Form className="d-flex me-2 search-form" onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="Suche Posts..."
              className="me-2"
              aria-label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm.trim() && (
              <Button
                className="search-button "
                type="submit"
                aria-label="Suche"
              >
                Suche
              </Button>
            )}
          </Form>
          <Nav>
            {isAuthenticated ? (
              <NavDropdown
                title={`Hallo, ${user.username}`}
                id="basic-nav-dropdown"
              >
                <NavDropdown.Item
                  as={Link}
                  to="/posts/new"
                  aria-label="Neuer Post"
                >
                  Neuer Post
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/profile" aria-label="Profil">
                  Profil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Item>
                  <Nav.Link as={Link} to="/login" aria-label="Login">
                    Login
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/register" aria-label="Register">
                    Register
                  </Nav.Link>
                </Nav.Item>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
