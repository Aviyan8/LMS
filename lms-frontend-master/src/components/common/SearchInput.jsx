import React from "react";

const SearchInput = ({ value, onChange, placeholder, className = "" }) => {
  return (
    <input
      value={value}
      type="text"
      placeholder={placeholder || "Search..."}
      className={`border w-full p-2 rounded-lg ${className}`}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
};

export default SearchInput;
