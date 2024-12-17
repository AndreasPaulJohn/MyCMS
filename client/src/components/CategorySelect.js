import React from 'react';
import { Form } from 'react-bootstrap';
import styled from 'styled-components';

const StyledSelect = styled(Form.Select)`
  &:focus {
    border-color: #28a745;
    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
  }

  option {
    background-color: white;
    color: black;
  }

  option:checked,
  option:hover {
    background-color: #28a745 !important;
    color: white !important;
  }

  /* Für Webkit-Browser (Chrome, Safari) */
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #28a745;
  }

  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }

  /* Für Firefox */
  scrollbar-color: #28a745 #f1f1f1;
`;

const CategorySelect = ({ category, setCategory, categories }) => {
  return (
    <StyledSelect
      value={category}
      onChange={(e) => setCategory(e.target.value)}
    >
      <option value="">Alle Kategorien</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </StyledSelect>
  );
};

export default CategorySelect;