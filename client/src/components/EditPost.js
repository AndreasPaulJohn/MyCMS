import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPostById,
  updatePost,
  getCategories,
  uploadImage,
} from "../services/api";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor, editorConfiguration } from "../ckeditor";
import "./CreatePost.css";

const EditPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingImage, setExistingImage] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [editorInstance, setEditorInstance] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [postResponse, categoriesResponse] = await Promise.all([
          getPostById(id),
          getCategories(),
        ]);

        if (postResponse && postResponse.data) {
          setTitle(postResponse.data.title || "");
          setContent(postResponse.data.content || "");
          setSelectedCategories(
            postResponse.data.Categories.map((cat) => cat.id)
          );
          if (postResponse.data.Media && postResponse.data.Media.file_path) {
            setExistingImage(`/${postResponse.data.Media.file_path}`);
          }
        } else {
          setError("Post data not found");
        }

        setCategories(categoriesResponse || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleRemoveImage = () => {
    setExistingImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      selectedCategories.forEach((catId) =>
        formData.append("categoryIds", catId)
      );

      formData.append("removeImage", existingImage === null ? "true" : "false");

      console.log("Submitting form data:", Object.fromEntries(formData));
      const updatedPost = await updatePost(id, formData);
      console.log("Updated post:", updatedPost);
      navigate(`/posts/${id}`);
    } catch (error) {
      console.error(
        "Post update failed:",
        error.response?.data || error.message
      );
      setError("Failed to update post. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
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

  if (isLoading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-5 create-post-container">
      <Row className="justify-content-center">
        <Col md={8}>
          <h2 className="text-center mb-4">Edit Post</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formPostTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            {existingImage && (
              <Form.Group className="mb-3">
                <Form.Label>Existing Image</Form.Label>
                <div>
                  <img
                  alt=""
                    src={existingImage}
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                  <Button
                    variant="danger"
                    onClick={handleRemoveImage}
                    className="mt-2"
                  >
                    Remove Image
                  </Button>
                </div>
              </Form.Group>
            )}

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

            <Form.Group className="mb-3" controlId="formPostCategories">
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

            <Button variant="success" type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="visually-hidden">Saving...</span>
                </>
              ) : (
                "Update Post"
              )}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default EditPost;
