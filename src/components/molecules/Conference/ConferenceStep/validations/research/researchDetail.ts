import type { ResearchDetail } from "@/types/conference.type";
import type { ValidationResult } from "../basic";

export const validateResearchName = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: "Tên nghiên cứu không được để trống" };
  }
  if (value.trim().length < 10) {
    return { isValid: false, error: "Tên nghiên cứu phải có ít nhất 10 ký tự" };
  }
  if (value.trim().length > 200) {
    return { isValid: false, error: "Tên nghiên cứu không được vượt quá 200 ký tự" };
  }
  return { isValid: true };
};

export const validatePaperFormat = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: "Vui lòng chọn định dạng bài báo" };
  }
  
  const validFormats = ["acm", "apa", "chicago", "elsevier", "ieee", "lncs", "mla", "springer"];
  if (!validFormats.includes(value.toLowerCase())) {
    return { isValid: false, error: "Định dạng bài báo không hợp lệ" };
  }
  
  return { isValid: true };
};

export const validateNumberPaperAccept = (value: number): ValidationResult => {
  if (value < 0) {
    return { isValid: false, error: "Số bài báo chấp nhận không được âm" };
  }
  if (value > 10000) {
    return { isValid: false, error: "Số bài báo chấp nhận không hợp lý (tối đa 10,000)" };
  }
  return { isValid: true };
};

export const validateRevisionAttempt = (value: number): ValidationResult => {
  if (value < 0) {
    return { isValid: false, error: "Số lần chỉnh sửa không được âm" };
  }
  if (value > 10) {
    return { isValid: false, error: "Số lần chỉnh sửa không hợp lý (tối đa 10)" };
  }
  return { isValid: true };
};

export const validateRankingCategoryId = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: "Vui lòng chọn loại xếp hạng" };
  }
  return { isValid: true };
};

export const validateRankValue = (
  value: string,
  categoryName?: string
): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: "Vui lòng nhập giá trị xếp hạng" };
  }

  const upperValue = value.toUpperCase().trim();
  const lowerCategory = (categoryName || "").toLowerCase();

  // Core, Scopus, Scimago, ISI/Web of Science: Q1-Q4
  if (
    lowerCategory.includes("core") ||
    lowerCategory.includes("scopus") ||
    lowerCategory.includes("scimago") ||
    lowerCategory.includes("isi") ||
    lowerCategory.includes("web of science")
  ) {
    const validQuartiles = ["Q1", "Q2", "Q3", "Q4"];
    if (!validQuartiles.includes(upperValue)) {
      return {
        isValid: false,
        error: "Giá trị xếp hạng phải là Q1, Q2, Q3, hoặc Q4",
      };
    }
  }
  // CiteScore: decimal number
  else if (lowerCategory.includes("citescore")) {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      return {
        isValid: false,
        error: "CiteScore phải là số từ 0 đến 100",
      };
    }
  }
  // Other rankings: A*, A, B, C
  else {
    const validGrades = ["A*", "A", "B", "C"];
    if (!validGrades.includes(upperValue)) {
      return {
        isValid: false,
        error: "Giá trị xếp hạng phải là A*, A, B, hoặc C",
      };
    }
  }

  return { isValid: true };
};

export const validateRankYear = (value: number): ValidationResult => {
  if (value <= 0) {
    return { isValid: false, error: "Năm xếp hạng không hợp lệ" };
  }
  
  const currentYear = new Date().getFullYear();
  if (value < 1990 || value > currentYear + 1) {
    return {
      isValid: false,
      error: `Năm xếp hạng phải từ 1990 đến ${currentYear + 1}`,
    };
  }
  
  return { isValid: true };
};

export const validateReviewFee = (value: number): ValidationResult => {
  if (value < 0) {
    return { isValid: false, error: "Phí đánh giá không được âm" };
  }
  if (value > 100000000) {
    return { isValid: false, error: "Phí đánh giá không hợp lý (tối đa 100 triệu)" };
  }
  
  if (value > 0 && value < 10000) {
    return {
      isValid: true,
      warning: "Phí đánh giá thấp hơn mức khuyến nghị (10,000 VND)",
    };
  }
  
  return { isValid: true };
};

export const validateResearchDetail = (detail: ResearchDetail): ValidationResult => {
  // Check required fields
  if (!detail.name.trim()) {
    return { isValid: false, error: "Tên nghiên cứu không được để trống" };
  }
  
  if (!detail.paperFormat) {
    return { isValid: false, error: "Vui lòng chọn định dạng bài báo" };
  }
  
  if (!detail.rankingCategoryId) {
    return { isValid: false, error: "Vui lòng chọn loại xếp hạng" };
  }
  
  if (!detail.rankValue.trim()) {
    return { isValid: false, error: "Vui lòng nhập giá trị xếp hạng" };
  }
  
  // Validate individual fields
  const nameResult = validateResearchName(detail.name);
  if (!nameResult.isValid) return nameResult;
  
  const paperFormatResult = validatePaperFormat(detail.paperFormat);
  if (!paperFormatResult.isValid) return paperFormatResult;
  
  const rankValueResult = validateRankValue(detail.rankValue);
  if (!rankValueResult.isValid) return rankValueResult;
  
  return { isValid: true };
};