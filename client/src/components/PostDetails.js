import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Card, Button, Spinner, Alert, Image, Modal } from "react-bootstrap";
import { isAdmin } from "../services/auth";
import { getPostById, deletePost } from "../services/api";
import Comments from "./Comments";
import DOMPurify from "dompurify";
import Prism from 'prismjs';
import "bootstrap";
import "./components.css";
import config from "../config";

// Basis-Theme
import 'prismjs/themes/prism-okaidia.css';
// Prism Komponenten
import 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
// Zusätzliche wichtige Sprachen
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; // HTML
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-sql';
// Plugins für bessere Darstellung
import 'prismjs/plugins/normalize-whitespace/prism-normalize-whitespace';

// Prism Konfiguration
Prism.manual = true;
if (typeof window !== 'undefined') {
  window.Prism = window.Prism || {};
  window.Prism.manual = true;
}

const PostDetails = () => {
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDelete = useCallback(async () => {
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
  }, [id, navigate]);

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

  useEffect(() => {
    if (post) {
      setTimeout(() => {
        document.querySelectorAll('pre code').forEach((block) => {
          try {
            // HTML von CKEditor decodieren
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = block.innerHTML;
            let code = tempDiv.textContent || tempDiv.innerText;
            
            // Entferne HTML-Entities und formatiere
            code = code
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/<br\s*\/?>/g, '\n')
              .trim();

            // Setze den bereinigten Code zurück
            block.textContent = code;

            // Stelle sicher, dass die Sprache korrekt gesetzt ist
            const parent = block.parentElement;
            if (parent && parent.tagName.toLowerCase() === 'pre') {
              if (!block.className.includes('language-')) {
                block.className = 'language-javascript';
              }
              // Füge Prism-Klasse zum pre-Element hinzu
              parent.className = block.className;
            }

            // Wende Prism-Highlighting direkt an
            Prism.highlightElement(block);
          } catch (err) {
            console.error('Error highlighting code:', err);
          }
        });
      }, 500);
    }
  }, [post]);

  const processContent = (html) => {
    if (!html) return '';

    // Entferne img Tags aus dem Content, da wir sie separat anzeigen
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const imgTags = tempDiv.getElementsByTagName('img');
    while(imgTags.length > 0) {
      imgTags[0].parentNode.removeChild(imgTags[0]);
    }
    html = tempDiv.innerHTML;

    // Verarbeite Code-Blöcke - entferne umschließende p-Tags
    let processedHtml = html
      .replace(/<p>\s*&lt;pre&gt;/g, '<pre>')
      .replace(/&lt;\/pre&gt;\s*<\/p>/g, '</pre>')
      .replace(/&lt;code\s+class=\\?"language-([^"]+)\\?"&gt;/g, '<code class="language-$1">')
      .replace(/&lt;\/code&gt;/g, '</code>')
      .replace(/<p>\s*<pre>/g, '<pre>')
      .replace(/<\/pre>\s*<\/p>/g, '</pre>');

    // Säubere HTML mit DOMPurify
    const clean = DOMPurify.sanitize(processedHtml, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'em', 'u', 'strike',
        'ul', 'ol', 'li', 'blockquote', 'a',
        'pre', 'code', 'figure', 'figcaption'
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'class', 'style'
      ],
      ADD_TAGS: ['pre', 'code'],
      FORBID_TAGS: ['script', 'img'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick']
    });

    return clean;
  };

  const createMarkup = (html) => {
    if (!html) return { __html: '' };
    const processedHtml = processContent(html);
    return { __html: processedHtml };
  };

  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!post) return <div className="text-center mt-5">Post not found</div>;

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="border-success border-light">
            <Card.Body>
              <Card.Title className="title-card" as="h1">
                {post.title}
              </Card.Title>
              {post.Media && post.Media.length > 0 && post.Media[0].file_path && (
                <>
                  <Image
                    src={`${config.API_BASE_URL}/media/${post.Media[0].file_path.replace('uploads/', '')}`}
                    alt={post.title}
                    fluid
                    className="mb-3 d-block mx-auto"
                    onClick={() => setShowImageModal(true)}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  <Modal
                    show={showImageModal}
                    onHide={() => setShowImageModal(false)}
                    size="lg"
                    centered
                    className="image-modal"
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>{post.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modal-content-transparent">
                      <Image
                        src={`${config.API_BASE_URL}/media/${post.Media[0].file_path.replace('uploads/', '')}`}
                        alt={post.title}
                        fluid
                      />
                    </Modal.Body>
                  </Modal>
                </>
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