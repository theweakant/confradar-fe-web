export const validatePrice = (data: any, isAuthor: boolean) => {
  const errors: Record<string, string> = {};
  if (isAuthor) {
    // Validation logic for author tickets
  } else {
    // Validation logic for non-author tickets
  }
  return errors;
};