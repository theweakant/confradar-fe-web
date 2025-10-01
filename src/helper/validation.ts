// // utils/validation.ts
// export const createValidationRule = (
//   validate: (value: string | number) => boolean,
//   message: string
// ): ValidationRule => ({ validate, message });

// // Validation rules library
// export const ValidationRules = {
//   required: (fieldName: string) => createValidationRule(
//     (value) => String(value).trim().length > 0,
//     `${fieldName} là bắt buộc`
//   ),
  
//   minLength: (length: number, fieldName: string) => createValidationRule(
//     (value) => String(value).trim().length >= length,
//     `${fieldName} phải có ít nhất ${length} ký tự`
//   ),
  
//   email: () => createValidationRule(
//     (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)),
//     "Email không hợp lệ"
//   ),
  
//   min: (min: number, fieldName: string) => createValidationRule(
//     (value) => Number(value) >= min,
//     `${fieldName} phải lớn hơn hoặc bằng ${min}`
//   ),
  
//   dateAfter: (compareDate: string, message: string) => createValidationRule(
//     (value) => new Date(String(value)) > new Date(compareDate),
//     message
//   ),
  
//   dateBefore: (compareDate: string, message: string) => createValidationRule(
//     (value) => new Date(String(value)) < new Date(compareDate),
//     message
//   ),
// };

// // Hook để validate form
// export const useFormValidation = <T extends Record<string, any>>(
//   validationRules: Partial<Record<keyof T, ValidationRule[]>>
// ) => {
//   const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
//   const [touched, setTouched] = useState<Set<keyof T>>(new Set());

//   const validateField = (field: keyof T, value: any): boolean => {
//     const rules = validationRules[field];
//     if (!rules) return true;

//     for (const rule of rules) {
//       if (!rule.validate(value)) {
//         setErrors(prev => ({ ...prev, [field]: rule.message }));
//         return false;
//       }
//     }

//     setErrors(prev => ({ ...prev, [field]: "" }));
//     return true;
//   };

//   const validateAll = (formData: T): boolean => {
//     let isValid = true;
//     const newTouched = new Set<keyof T>();

//     Object.keys(validationRules).forEach((field) => {
//       const key = field as keyof T;
//       newTouched.add(key);
//       if (!validateField(key, formData[key])) {
//         isValid = false;
//       }
//     });

//     setTouched(newTouched);
//     return isValid;
//   };

//   const setFieldTouched = (field: keyof T) => {
//     setTouched(prev => new Set(prev).add(field));
//   };

//   const resetValidation = () => {
//     setErrors({});
//     setTouched(new Set());
//   };

//   return {
//     errors,
//     touched,
//     validateField,
//     validateAll,
//     setFieldTouched,
//     resetValidation,
//   };
// };