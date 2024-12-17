import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import CategorySelect from './CategorySelect';
import { searchPosts, getCategories } from "../services/api";
import "./components.css";

const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
};

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categories, setCategories] = useState([]);
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get("q");

  const fetchCategories = useCallback(async () => {
    try {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  const fetchSearchResults = useCallback(async () => {
    console.log("Fetching search results with:", {
      searchQuery,
      category,
      dateFrom,
      dateTo,
    });
    try {
      setLoading(true);
      setError(null);
      const data = await searchPosts(searchQuery, category, dateFrom, dateTo);
      console.log("Search results:", data);
      setResults(data);
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError("Failed to fetch search results. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, category, dateFrom, dateTo]);

  useEffect(() => {
    fetchCategories();
    if (searchQuery) {
      fetchSearchResults();
    }
  }, [fetchCategories, fetchSearchResults, searchQuery]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchSearchResults();
  };

  if (loading)
    return (
      <Container>
        <p>Loading...</p>
      </Container>
    );
  if (error)
    return (
      <Container>
        <p>{error}</p>
      </Container>
    );

  return (
    <Container>
      <h2>Suchergebnisse für "{searchQuery}"</h2>
      <Form onSubmit={handleFilterSubmit}>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <CategorySelect
                category={category}
                setCategory={setCategory}
                categories={categories}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Von Datum</Form.Label>
              <Form.Control
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Bis Datum</Form.Label>
              <Form.Control
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Button className="btn" type="submit">
          Filter anwenden
        </Button>
      </Form>
      {results.length === 0 ? (
        <p>Keine Ergebnisse für Ihre Suchanfrage gefunden.</p>
      ) : (
        <Row className="mt-3">
          {results.map((post) => (
            <Col key={post.id} md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>
                    <Link
                      className="link-success link-underline-opacity-25-hover"
                      to={`/posts/${post.id}`}
                    >
                      {post.title}
                    </Link>
                  </Card.Title>
                  <Card.Text>
                    {truncateText(stripHtml(post.content), 100)}
                  </Card.Text>
                  {post.Categories && post.Categories.length > 0 && (
                    <Card.Text>
                      Kategorien:{" "}
                      {post.Categories.map((cat) => cat.name).join(", ")}
                    </Card.Text>
                  )}
                  <Link
                    className="link-success link-underline-opacity-25-hover"
                    to={`/posts/${post.id}`}
                  >
                    Weiterlesen
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default SearchResults;
