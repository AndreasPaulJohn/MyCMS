import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup, Button, Alert, Form, Badge } from 'react-bootstrap';
import { getComments, moderateComment, createComment, generateCaptcha, verifyCaptcha } from '../services/api';
import { isAdmin, getCurrentUser } from '../services/auth';

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newComment, setNewComment] = useState('');
  const [captcha, setCaptcha] = useState({ id: "", question: "" });
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const fetchedComments = await getComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      setError('Failed to fetch comments');
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const captchaData = await generateCaptcha();
      setCaptcha(captchaData);
    } catch (error) {
      console.error("Error fetching captcha:", error);
      setError("Fehler beim Laden des Captchas.");
    }
  };

  const handleModerate = async (commentId, status) => {
    try {
      await moderateComment(commentId, status);
      setSuccess(`Comment ${status} successfully`);
      fetchComments();
    } catch (error) {
      setError(`Failed to ${status} comment: ${error.message}`);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    try {
      const captchaValid = await verifyCaptcha(captcha.id, captchaAnswer);
      if (!captchaValid) {
        setError('Captcha nicht korrekt. Bitte versuchen Sie es erneut.');
        fetchCaptcha();
        return;
      }
      await createComment(postId, newComment);
      setNewComment('');
      setCaptchaAnswer('');
      setSuccess('Comment submitted successfully');
      fetchComments();
      fetchCaptcha();
    } catch (error) {
      setError('Failed to submit comment');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="mt-4">
      <h3>Comments</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <ListGroup className="mb-4">
        {comments.map((comment) => (
          <ListGroup.Item 
            key={comment.id} 
            className={`mb-3 border-bottom pb-3 ${comment.status === 'pending' ? 'bg-light' : ''}`}
          >
            <p className="mb-2">{comment.content}</p>
            <div className="d-flex justify-content-between align-items-center">
              <small>
                By <strong>{comment.User.username}</strong> - {new Date(comment.createdAt).toLocaleString()}
              </small>
              {getStatusBadge(comment.status)}
            </div>
            {isAdmin() && (
              <div className="mt-2">
                {comment.status !== 'approved' && (
                  <Button 
                    variant="outline-success" 
                    size="sm" 
                    className="me-2"
                    onClick={() => handleModerate(comment.id, 'approved')}
                  >
                    Approve
                  </Button>
                )}
                {comment.status !== 'rejected' && (
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => handleModerate(comment.id, 'rejected')}
                  >
                    Reject
                  </Button>
                )}
              </div>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
      {getCurrentUser() && (
        <Form onSubmit={handleSubmitComment}>
          <Form.Group className="mb-3">
            <Form.Label>Add a comment</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Captcha: {captcha.question}</Form.Label>
            <Form.Control
              type="text"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit" variant="success">Submit Comment</Button>
        </Form>
      )}
    </div>
  );
};

export default Comments;


// import React, { useState, useEffect, useCallback } from 'react';
// import { ListGroup, Button, Alert, Form, Badge } from 'react-bootstrap';
// import { getComments, moderateComment, createComment } from '../services/api';
// import { isAdmin, getCurrentUser } from '../services/auth';

// const Comments = ({ postId }) => {
//   const [comments, setComments] = useState([]);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [newComment, setNewComment] = useState('');

//   const fetchComments = useCallback(async () => {
//     try {
//       const fetchedComments = await getComments(postId);
//       setComments(fetchedComments);
//     } catch (error) {
//       setError('Failed to fetch comments');
//     }
//   }, [postId]);

//   useEffect(() => {
//     fetchComments();
//   }, [fetchComments]);

//   useEffect(() => {
//     const user = getCurrentUser();
//     console.log('Current user in Comments:', user);
//     console.log('Is admin in Comments:', isAdmin());
//   }, []);

//   const handleModerate = async (commentId, status) => {
//     try {
//       await moderateComment(commentId, status);
//       setSuccess(`Comment ${status} successfully`);
//       fetchComments(); // Kommentare neu laden nach der Moderation
//     } catch (error) {
//       setError(`Failed to ${status} comment: ${error.message}`);
//     }
//   };

//   const handleSubmitComment = async (e) => {
//     e.preventDefault();
//     try {
//       await createComment(postId, newComment);
//       setNewComment('');
//       setSuccess('Comment submitted successfully');
//       fetchComments();
//     } catch (error) {
//       setError('Failed to submit comment');
//     }
//   };

//   const getStatusBadge = (status) => {
//     switch(status) {
//       case 'pending':
//         return <Badge bg="warning">Pending</Badge>;
//       case 'approved':
//         return <Badge bg="success">Approved</Badge>;
//       case 'rejected':
//         return <Badge bg="danger">Rejected</Badge>;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="mt-4">
//       <h3>Comments</h3>
//       {error && <Alert variant="danger">{error}</Alert>}
//       {success && <Alert variant="success">{success}</Alert>}
//       <ListGroup className="mb-4">
//         {comments.map((comment) => (
//           <ListGroup.Item 
//             key={comment.id} 
//             className={`mb-3 border-bottom pb-3 ${comment.status === 'pending' ? 'bg-light' : ''}`}
//           >
//             <p className="mb-2">{comment.content}</p>
//             <div className="d-flex justify-content-between align-items-center">
//               <small>
//                 By <strong>{comment.User.username}</strong> - {new Date(comment.createdAt).toLocaleString()}
//               </small>
//               {getStatusBadge(comment.status)}
//             </div>
//             {isAdmin() && (
//               <div className="mt-2">
//                 {comment.status !== 'approved' && (
//                   <Button 
//                     variant="outline-success" 
//                     size="sm" 
//                     className="me-2"
//                     onClick={() => handleModerate(comment.id, 'approved')}
//                   >
//                     Approve
//                   </Button>
//                 )}
//                 {comment.status !== 'rejected' && (
//                   <Button 
//                     variant="outline-danger" 
//                     size="sm" 
//                     onClick={() => handleModerate(comment.id, 'rejected')}
//                   >
//                     Reject
//                   </Button>
//                 )}
//               </div>
//             )}
//           </ListGroup.Item>
//         ))}
//       </ListGroup>
//       {getCurrentUser() && (
//         <Form onSubmit={handleSubmitComment}>
//           <Form.Group className="mb-3">
//             <Form.Label>Add a comment</Form.Label>
//             <Form.Control 
//               as="textarea" 
//               rows={3} 
//               value={newComment}
//               onChange={(e) => setNewComment(e.target.value)}
//               required
//             />
//           </Form.Group>
//           <Button type="submit" variant="success">Submit Comment</Button>
//         </Form>
//       )}
//     </div>
//   );
// };

// export default Comments;