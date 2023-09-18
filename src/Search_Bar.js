import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [term, setTerm] = useState('');

  const onChange = (event) => {
    setTerm(event.target.value);
    onSearch(event.target.value);
  };

  return (
    <input
      type="text"
      placeholder="Search by name..."
      value={term}
      onChange={onChange}
    />
  );
};

export default SearchBar;
