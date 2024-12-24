import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Pagination,
  Spinner,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import "./pages.css";
import config from "../config";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const postsPerPage = 12;

  const createMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  const fetchPosts = useCallback(async (page) => {
    if (!page) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${config.API_BASE_URL}/posts?page=${page}&limit=${postsPerPage}`
      );

      // Überprüfen der Antwort
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format');
      }

      setPosts(response.data.posts || []);
      setTotalPages(response.data.totalPages || 1);
      
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to fetch posts. Please try again later.");
      setPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [isInitialLoad]);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, fetchPosts]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber === currentPage) return;
    setCurrentPage(pageNumber);
  };

  const renderPaginationItems = () => {
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
          className={number === currentPage ? "bg-success text-white" : ""}
        >
          {number}
        </Pagination.Item>
      );
    }
    return items;
  };

  if (loading && isInitialLoad) {
    return (
      <Container className="loading-container">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4 text-center text-danger">{error}</Container>
    );
  }

  return (
    <Container className="mt-4 home-page">
      <h1 className="page-title">Welcome to My Page</h1>
      {posts.length === 0 ? (
        <p className="text-center">No posts available.</p>
      ) : (
        <>
          <Row>
            {posts.map((post) => (
              <Col key={post.id} md={4} className="mb-4">
                <Card
                  className="post-card border border-success"
                  style={{ height: "300px" }}
                >
                  <Card.Body
                    className="d-flex flex-column"
                    style={{ height: "100%" }}
                  >
                    <Card.Title className="post-title">
                      {truncateText(post.title, 50)}
                    </Card.Title>
                    <div
                      className="post-content mb-2 flex-grow-1 overflow-hidden"
                      style={{ maxHeight: "100px" }}
                      dangerouslySetInnerHTML={createMarkup(
                        truncateText(post.content, 100)
                      )}
                    />
                    {post.Categories && post.Categories.length > 0 && (
                      <div className="mb-2">
                        {post.Categories.map((category) => (
                          <Badge
                            key={category.id}
                            bg="secondary"
                            className="me-1"
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {post.createdAt && (
                      <small className="text-muted d-block mb-2">
                        Posted on{" "}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </small>
                    )}
                    <Button
                      as={Link}
                      to={`/posts/${post.id}`}
                      variant="success"
                      className="mt-auto"
                    >
                      Read More
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <Row className="mt-4">
              <Col className="d-flex justify-content-center">
                <Pagination className="justify-content-center">
                  <Pagination.First
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1 || loading}
                  />
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  />
                  {renderPaginationItems()}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                  />
                  <Pagination.Last
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages || loading}
                  />
                </Pagination>
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default Home;