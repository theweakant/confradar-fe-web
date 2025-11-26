// Target audience options
export const TARGET_OPTIONS = [
  { value: "Học sinh", label: "Học sinh" },
  { value: "Sinh viên", label: "Sinh viên" },
  { value: "Chuyên gia", label: "Chuyên gia" },
  { value: "Nhà đầu tư", label: "Nhà đầu tư" },
  { value: "Khác", label: "Khác" },
] as const;

export const TECH_MAX_STEP = 6;

export const TECH_STEP_LABELS: string[] = [
  "Thông tin",
  "Giá vé",
  "Phiên họp",
  "Chính sách",
  "Media",
  "Tài trợ"
] as const;

// Validation limits
export const VALIDATION_LIMITS = {
  CONFERENCE_NAME_MIN: 10,
  CONFERENCE_NAME_MAX: 200,
  DATE_RANGE_MIN: 1,
  DATE_RANGE_MAX: 365,
  TOTAL_SLOT_MIN: 1,
  TOTAL_SLOT_MAX: 100000,
  TICKET_SALE_DURATION_MIN: 1,
  TICKET_SALE_RECOMMENDED_DAYS: 7,
  TICKET_NAME_MIN: 3,
  TICKET_PRICE_MIN: 0,
  TICKET_PRICE_MAX: 100000000,
  TICKET_PRICE_RECOMMENDED_MIN: 10000,
  SESSION_TITLE_MIN: 5,
  SESSION_TIME_MIN_HOURS: 0.5,
  SESSION_TIME_MAX_HOURS: 12,
  SESSION_TIME_MIN_MINUTES: 30,
  POLICY_NAME_MIN: 3,
  REFUND_PERCENT_MIN: 1,
  REFUND_PERCENT_MAX: 100,
  SPONSOR_NAME_MIN: 2,
  SPONSOR_NAME_MAX: 100,
  SPEAKER_NAME_MIN: 2,
  MAX_FILE_SIZE_MB: 4,
  MAX_MEDIA_COUNT: 10,
  MAX_SPONSORS_COUNT: 20,
} as const;

// File upload settings
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 4,
  MAX_SIZE_BYTES: 4 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/jpg"],
  ALLOWED_VIDEO_TYPES: ["video/mp4"],
  ALLOWED_MEDIA_TYPES: ["image/jpeg", "image/png", "image/jpg", "video/mp4"],
} as const;

// API routes (if needed)
export const API_ROUTES = {
  CREATE_BASIC: "/conference/basic",
  CREATE_PRICE: "/conference/price",
  CREATE_SESSIONS: "/conference/sessions",
  CREATE_POLICIES: "/conference/policies",
  CREATE_REFUND_POLICIES: "/conference/refund-policies",
  CREATE_MEDIA: "/conference/media",
  CREATE_SPONSORS: "/conference/sponsors",
} as const;

// Status messages
export const STATUS_MESSAGES = {
  SUCCESS: {
    BASIC: "Tạo thông tin cơ bản thành công!",
    PRICE: "Lưu thông tin giá vé thành công!",
    SESSIONS: "Lưu phiên họp thành công!",
    POLICIES: "Lưu chính sách thành công!",
    MEDIA: "Lưu media thành công!",
    SPONSORS: "Lưu nhà tài trợ thành công!",
    COMPLETE: "Tạo hội thảo thành công!",
    SKIP: {
      SESSIONS: "Đã bỏ qua phần phiên họp",
      POLICIES: "Đã bỏ qua phần chính sách",
      MEDIA: "Đã bỏ qua phần media",
    },
  },
  ERROR: {
    BASIC: "Tạo thông tin cơ bản thất bại!",
    PRICE: "Lưu giá vé thất bại!",
    SESSIONS: "Lưu phiên họp thất bại!",
    POLICIES: "Lưu chính sách thất bại!",
    MEDIA: "Lưu media thất bại!",
    SPONSORS: "Lưu nhà tài trợ thất bại!",
    NO_CONFERENCE_ID: "Không tìm thấy conference ID!",
  },
} as const;



//RESEARCH
// Step labels for Research Conference
export const RESEARCH_STEP_LABELS: string[] = [
  "Thông tin",
  "Chi tiết", 
  "Timeline",
  "Chi phí",
  "Session",
  "Chính sách",
  "Tài liệu",
  "Media",
  "Tài trợ"
];

export const RESEARCH_MAX_STEP = 9;

// Paper format options
export const PAPER_FORMAT_OPTIONS = [
  { value: "acm", label: "ACM" },
  { value: "apa", label: "APA" },
  { value: "chicago", label: "Chicago" },
  { value: "elsevier", label: "Elsevier" },
  { value: "ieee", label: "IEEE" },
  { value: "lncs", label: "LNCS" },
  { value: "mla", label: "MLA" },
  { value: "springer", label: "Springer" },
] as const;

// Status messages
export const RESEARCH_STATUS_MESSAGES = {
  SUCCESS: {
    BASIC: "Tạo thông tin cơ bản thành công!",
    DETAIL: "Lưu chi tiết nghiên cứu thành công!",
    TIMELINE: "Lưu timeline thành công!",
    PRICE: "Lưu thông tin giá vé thành công!",
    SESSIONS: "Lưu phiên họp thành công!",
    POLICIES: "Lưu chính sách thành công!",
    MATERIALS: "Lưu tài liệu thành công!",
    MEDIA: "Lưu media thành công!",
    SPONSORS: "Lưu nhà tài trợ thành công!",
    COMPLETE: "Tạo hội thảo nghiên cứu thành công!",
    SKIP: {
      SESSIONS: "Đã bỏ qua phần phiên họp",
      POLICIES: "Đã bỏ qua phần chính sách",
      MATERIALS: "Đã bỏ qua phần tài liệu",
      MEDIA: "Đã bỏ qua phần media",
    },
  },
  ERROR: {
    BASIC: "Tạo thông tin cơ bản thất bại!",
    DETAIL: "Lưu chi tiết nghiên cứu thất bại!",
    TIMELINE: "Lưu timeline thất bại!",
    PRICE: "Lưu giá vé thất bại!",
    SESSIONS: "Lưu phiên họp thất bại!",
    POLICIES: "Lưu chính sách thất bại!",
    MATERIALS: "Lưu tài liệu thất bại!",
    MEDIA: "Lưu media thất bại!",
    SPONSORS: "Lưu nhà tài trợ thất bại!",
    NO_CONFERENCE_ID: "Không tìm thấy conference ID!",
    NO_AUTHOR_TICKET: "Hội nghị nghiên cứu cần có ít nhất một loại vé dành cho tác giả!",
    TIMELINE_VALIDATION: "Timeline research phải kết thúc trước ngày bán vé!",
  },
} as const;