import type {
  ResearchMaterial,
  ResearchRankingFile,
  ResearchRankingReference,
} from "@/types/conference.type";
import type { ValidationResult } from "../basic";

export const validateMaterialFileName = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: "Tên file không được để trống" };
  }
  if (value.trim().length < 3) {
    return { isValid: false, error: "Tên file phải có ít nhất 3 ký tự" };
  }
  if (value.trim().length > 100) {
    return { isValid: false, error: "Tên file không được vượt quá 100 ký tự" };
  }
  return { isValid: true };
};

export const validateMaterialFile = (file: File | string | null | undefined): ValidationResult => {
  if (typeof file === 'string') {
    return { isValid: true };
  }

  if (!file) {
    return { isValid: false, error: "Vui lòng chọn file" };
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: "File không được vượt quá 10MB" };
  }

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "File phải là PDF, DOC, DOCX, PPT, PPTX hoặc TXT",
    };
  }

  return { isValid: true };
};

export const validateMaterial = (material: ResearchMaterial): ValidationResult => {
  const fileNameResult = validateMaterialFileName(material.fileName);
  if (!fileNameResult.isValid) return fileNameResult;

  const fileResult = validateMaterialFile(material.file);
  if (!fileResult.isValid) return fileResult;

  return { isValid: true };
};

export const validateRankingFileUrl = (url: string): ValidationResult => {
  if (!url.trim()) {
    return { isValid: true };
  }

  try {
    new URL(url);
  } catch {
    return { isValid: false, error: "URL không hợp lệ" };
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return { isValid: false, error: "URL phải bắt đầu bằng http:// hoặc https://" };
  }

  return { isValid: true };
};

export const validateRankingFile = (rankingFile: ResearchRankingFile): ValidationResult => {
  if (!rankingFile.fileUrl && !rankingFile.file) {
    return { isValid: false, error: "Vui lòng nhập URL hoặc chọn file" };
  }

  if (rankingFile.fileUrl) {
    const urlResult = validateRankingFileUrl(rankingFile.fileUrl);
    if (!urlResult.isValid) return urlResult;
  }

  if (rankingFile.file && rankingFile.file instanceof File) {
    const maxSize = 10 * 1024 * 1024;
    if (rankingFile.file.size > maxSize) {
      return { isValid: false, error: "File không được vượt quá 10MB" };
    }
  }

  return { isValid: true };
};

export const validateRankingReferenceUrl = (url: string): ValidationResult => {
  if (!url.trim()) {
    return { isValid: false, error: "Vui lòng nhập URL tham khảo" };
  }

  try {
    new URL(url);
  } catch {
    return { isValid: false, error: "URL không hợp lệ" };
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return { isValid: false, error: "URL phải bắt đầu bằng http:// hoặc https://" };
  }

  const commonDomains = [
    "core.edu.au",
    "scopus.com",
    "webofscience.com",
    "scholar.google",
    "researchgate.net",
    "scimagojr.com",
  ];

  const urlLower = url.toLowerCase();
  const hasCommonDomain = commonDomains.some((domain) => urlLower.includes(domain));

  if (!hasCommonDomain) {
    return {
      isValid: true,
      warning: "URL này có vẻ không phải từ trang xếp hạng chính thức",
    };
  }

  return { isValid: true };
};

export const validateRankingReference = (
  reference: ResearchRankingReference
): ValidationResult => {
  return validateRankingReferenceUrl(reference.referenceUrl);
};

export const validateMaterialsList = (materials: ResearchMaterial[]): ValidationResult => {
  if (materials.length > 20) {
    return {
      isValid: false,
      error: "Không được thêm quá 20 tài liệu nghiên cứu",
    };
  }

  return { isValid: true };
};

export const validateRankingFilesList = (
  rankingFiles: ResearchRankingFile[]
): ValidationResult => {
  if (rankingFiles.length > 10) {
    return {
      isValid: false,
      error: "Không được thêm quá 10 file xếp hạng",
    };
  }

  return { isValid: true };
};

export const validateRankingReferencesList = (
  references: ResearchRankingReference[]
): ValidationResult => {
  if (references.length > 10) {
    return {
      isValid: false,
      error: "Không được thêm quá 10 URL tham khảo",
    };
  }

  const urls = references.map((r) => r.referenceUrl.toLowerCase());
  const uniqueUrls = new Set(urls);

  if (urls.length !== uniqueUrls.size) {
    return {
      isValid: false,
      error: "Có URL tham khảo bị trùng lặp",
    };
  }

  return { isValid: true };
};  