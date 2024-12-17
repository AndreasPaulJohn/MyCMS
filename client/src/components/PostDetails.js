import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Image,
  Button,
  Alert,
} from "react-bootstrap";
import { getPostById, deletePost } from "../services/api";
import Comments from "./Comments";
import { isAdmin } from "../services/auth";
import DOMPurify from "dompurify";
import "bootstrap";
import "./components.css";
import config from "../config";

const PostDetails = () => {
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const response = await getPostById(id);
        console.log("Fetched post details:", response);
        setPost(response.data);
      } catch (error) {
        console.error("Error fetching post:", error);
        setError("Failed to fetch post details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(id);
        console.log("Post deleted successfully");
        navigate("/");
      } catch (error) {
        console.error("Error deleting post:", error);
        setError("Failed to delete post.");
      }
    }
  };

  const createMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!post) return <div className="text-center mt-5">Post not found</div>;

  console.log("Rendering post:", post);

  return (
    <Container className="mt-4 post-details">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="border-success border-light card custom-card">
            <Card.Body>
              <Card.Title className="title-card" as="h1">
                {post.title}
              </Card.Title>
              {post.Media && post.Media.file_path && (
                <Image
                  src={`${config.API_BASE_URL}/${post.Media.file_path}`}
                  alt={post.title}
                  fluid
                  className="mb-3 d-block mx-auto"
                />
              )}
              <div
                className="post-content"
                dangerouslySetInnerHTML={createMarkup(post.content)}
              />
              <Card.Text>
                <small className="text-muted">
                  Author: {post.User?.username || "Unknown"}
                </small>
              </Card.Text>
              <Card.Text>
                <small className="text-muted">
                  Categories:{" "}
                  {post.Categories?.map((cat) => cat.name).join(", ") || "None"}
                </small>
              </Card.Text>
              {isAdmin() && (
                <div className="mt-3">
                  <Button
                    variant="success"
                    onClick={() => navigate(`/edit-post/${id}`)}
                    className="me-2"
                  >
                    Edit Post
                  </Button>
                  <Button variant="danger" onClick={handleDelete}>
                    Delete Post
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          <Comments postId={id} />
        </Col>
      </Row>
    </Container>
  );
};

export default PostDetails;
