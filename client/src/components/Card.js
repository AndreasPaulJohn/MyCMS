import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './components.css';

const Card = ({ post }) => {


  
  
  
  
  return (
 
    <BootstrapCard className="h-100">
      <BootstrapCard.Body>
        <BootstrapCard.Title>{post.title}</BootstrapCard.Title>
        <BootstrapCard.Text>{post.excerpt}</BootstrapCard.Text>
        <Link to={`/post/${post.id}`} className="btn btn-primary">Read More</Link>
      </BootstrapCard.Body>
      <BootstrapCard.Footer>
        <small className="text-muted">Posted on {new Date(post.createdAt).toLocaleDateString()}</small>
      </BootstrapCard.Footer>
    </BootstrapCard>
  );
};

export default Card;
