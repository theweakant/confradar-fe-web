import { useState, useCallback } from "react";
import type { ValidationResult } from "../validations";

interface ValidationErrors {
  [key: string]: string;
}

interface ValidationWarnings {
  [key: string]: string;
}

export function useValidation() {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [validationWarnings, setValidationWarnings] = useState<ValidationWarnings>({});

  const clearError = useCallback((field: string) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setError = useCallback((field: string, message: string) => {
    setValidationErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearWarning = useCallback((field: string) => {
    setValidationWarnings((prev) => {
      const newWarnings = { ...prev };
      delete newWarnings[field];
      return newWarnings;
    });
  }, []);

  const setWarning = useCallback((field: string, message: string) => {
    setValidationWarnings((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  const clearAllWarnings = useCallback(() => {
    setValidationWarnings({});
  }, []);

  const clearAll = useCallback(() => {
    setValidationErrors({});
    setValidationWarnings({});
  }, []);

  const validate = useCallback(
    (field: string, validationFn: () => ValidationResult) => {
      const result = validationFn();

      if (!result.isValid && result.error) {
        setError(field, result.error);
        clearWarning(field);
        return false;
      }

      clearError(field);

      if (result.warning) {
        setWarning(field, result.warning);
      } else {
        clearWarning(field);
      }

      return true;
    },
    [setError, clearError, setWarning, clearWarning]
  );

  const validateMultiple = useCallback(
    (validations: Array<{ field: string; validationFn: () => ValidationResult }>) => {
      let allValid = true;

      validations.forEach(({ field, validationFn }) => {
        const isValid = validate(field, validationFn);
        if (!isValid) {
          allValid = false;
        }
      });

      return allValid;
    },
    [validate]
  );

  const hasErrors = useCallback(() => {
    return Object.keys(validationErrors).length > 0;
  }, [validationErrors]);

  const hasWarnings = useCallback(() => {
    return Object.keys(validationWarnings).length > 0;
  }, [validationWarnings]);

  const getError = useCallback(
    (field: string) => {
      return validationErrors[field];
    },
    [validationErrors]
  );

  const getWarning = useCallback(
    (field: string) => {
      return validationWarnings[field];
    },
    [validationWarnings]
  );

  return {
    validationErrors,
    validationWarnings,
    clearError,
    setError,
    clearWarning,
    setWarning,
    clearAllErrors,
    clearAllWarnings,
    clearAll,
    validate,
    validateMultiple,
    hasErrors,
    hasWarnings,
    getError,
    getWarning,
  };
}