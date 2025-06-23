// src/hooks/useErrorHandler.js
import { useState } from "react";

export function useErrorHandler() {
  const [errors, setErrors] = useState([]);

  const addError = (errorObj) => {
    setErrors((prev) => {
      const exists = prev.some((e) => e.id === errorObj.id);
      return exists ? prev : [...prev, errorObj];
    });
  };

  const removeError = (errorId) => {
    setErrors((prev) => prev.filter((e) => e.id !== errorId));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return {
    errors,
    addError,
    removeError,
    clearErrors,
  };
}
