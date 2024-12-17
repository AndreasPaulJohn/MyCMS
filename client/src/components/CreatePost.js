import React, { useState, useEffect } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor, editorConfiguration } from "../ckeditor";
import { createPost, getCategories, uploadImage } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { generateCaptcha } from "../services/api";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [editorInstance, setEditorInstance] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [captcha, setCaptcha] = useState({ id: "", question: "" });
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  useEffect(() => {
    fetchCaptcha();
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated]);

  const fetchCaptcha = async () => {
    try {
      const captchaData = await generateCaptcha();
      setCaptcha(captchaData);
    } catch (error) {
      console.error("Error fetching captcha:", error);
      setError("Fehler beim Laden des Captchas.");
    }
  };

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setError("Failed to fetch categories: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Sie müssen eingeloggt sein, um einen Beitrag zu erstellen");
      return;
    }

    try {
      const newPost = await createPost({
        title,
        content,
        categoryIds: selectedCategories,
      });
      console.log("Post created:", newPost);
      navigate("/");
    } catch (error) {
      console.error("Fehler beim Erstellen des Beitrags:", error);
      setError(
        "Fehler beim Erstellen des Beitrags. Bitte versuchen Sie es später erneut."
      );
    }
  };

  const uploadAdapter = (loader) => {
    return {
      upload: () => {
        return new Promise((resolve, reject) => {
          loader.file.then(async (file) => {
            try {
              const imageUrl = await uploadImage(file);
              resolve({ default: imageUrl });
            } catch (error) {
              console.error("Error uploading image:", error);
              reject(error);
            }
          });
        });
      },
    };
  };

  function uploadPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = function(loader) {
      return uploadAdapter(loader);
    };
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prevSelected) => {
      if (prevSelected.includes(categoryId)) {
        return prevSelected.filter((id) => id !== categoryId);
      } else {
        return [...prevSelected, categoryId];
      }
    });
  };

  if (!isAuthenticated) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">You must be logged in to create a post.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 create-post-container">
      <h2>Neuen Beitrag erstellen</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Content</Form.Label>
          <CKEditor
            editor={ClassicEditor}
            config={{
              ...editorConfiguration,
              extraPlugins: [uploadPlugin],
            }}
            data={content}
            onReady={(editor) => {
              setEditorInstance(editor);
              console.log("Editor is ready to use!", editor);
            }}
            onChange={(event, editor) => {
              const data = editor.getData();
              setContent(data);
            }}
            onError={(error, { willEditorRestart }) => {
              console.error("CKEditor5 error:", error);
              if (willEditorRestart) {
                console.log("CKEditor5 will restart");
              }
              setError(`Editor error: ${error.message}`);
            }}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Categories</Form.Label>
          <div className="category-checkboxes">
            {categories.map((category) => (
              <Form.Check
                key={category.id}
                type="checkbox"
                id={`category-${category.id}`}
                label={category.name}
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
                className="category-checkbox"
              />
            ))}
          </div>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Captcha: {captcha.question}</Form.Label>
          <Form.Control
            type="text"
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
            required
            className="custom-input"
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Create Post
        </Button>
      </Form>
    </Container>
  );
};

export default CreatePost;
