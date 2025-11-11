import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import type { ResearchDetail } from "@/types/conference.type";

interface ResearchDetailFormProps {
  formData: ResearchDetail;
  onChange: (data: ResearchDetail) => void;
  rankingOptions: Array<{ value: string; label: string }>;
  isRankingLoading: boolean;
  validationErrors?: Record<string, string>;
}

const PAPER_FORMAT_OPTIONS = [
  { value: "acm", label: "ACM" },
  { value: "apa", label: "APA" },
  { value: "chicago", label: "Chicago" },
  { value: "elsevier", label: "Elsevier" },
  { value: "ieee", label: "IEEE" },
  { value: "lncs", label: "LNCS" },
  { value: "mla", label: "MLA" },
  { value: "springer", label: "Springer" },
];

export function ResearchDetailForm({
  formData,
  onChange,
  rankingOptions,
  isRankingLoading,
  validationErrors = {},
}: ResearchDetailFormProps) {
  const handleChange = <K extends keyof ResearchDetail>(
    field: K,
    value: ResearchDetail[K]
  ) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Tên nghiên cứu"
        name="name"
        value={formData.name}
        onChange={(val) => handleChange("name", val)}
        error={validationErrors.name}
        required
        placeholder="VD: International Conference on AI Research"
      />

      <div className="grid grid-cols-3 gap-4">
        <FormSelect
          label="Định dạng bài báo"
          name="paperFormat"
          value={formData.paperFormat}
          onChange={(val) => handleChange("paperFormat", val)}
          options={PAPER_FORMAT_OPTIONS}
          error={validationErrors.paperFormat}
          required
        />
        
        <FormInput
          label="Số bài báo chấp nhận"
          name="numberPaperAccept"
          type="number"
          value={formData.numberPaperAccept}
          onChange={(val) => handleChange("numberPaperAccept", Number(val))}
          error={validationErrors.numberPaperAccept}
          placeholder="VD: 50"
        />
        
        <FormInput
          label="Số lần chỉnh sửa cho phép"
          name="revisionAttemptAllowed"
          type="number"
          value={formData.revisionAttemptAllowed}
          onChange={(val) => handleChange("revisionAttemptAllowed", Number(val))}
          error={validationErrors.revisionAttemptAllowed}
          placeholder="VD: 2"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormSelect
          label="Loại xếp hạng"
          name="rankingCategoryId"
          value={formData.rankingCategoryId}
          onChange={(val) => {
            handleChange("rankingCategoryId", val);
            handleChange("rankValue", ""); 
          }}
          options={rankingOptions}
          error={validationErrors.rankingCategoryId}
          required
          disabled={isRankingLoading}
        />

        {formData.rankingCategoryId && (
          <FormInput
            label="Giá trị xếp hạng"
            name="rankValue"
            type="text"
            value={formData.rankValue}
            onChange={(val) => handleChange("rankValue", val)}
            error={validationErrors.rankValue}
            placeholder="VD: Q1, A*, 1.25"
            required
          />
        )}
        
        <FormInput
          label="Năm xếp hạng"
          name="rankYear"
          type="number"
          value={formData.rankYear}
          onChange={(val) => handleChange("rankYear", Number(val))}
          error={validationErrors.rankYear}
          placeholder="VD: 2024"
        />
      </div>

      <FormTextArea
        label="Mô tả xếp hạng"
        name="rankingDescription"
        value={formData.rankingDescription}
        onChange={(val) => handleChange("rankingDescription", val)}
        error={validationErrors.rankingDescription}
        rows={3}
        placeholder="Mô tả chi tiết về xếp hạng của hội thảo..."
      />

      {formData.rankingCategoryId && (
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
          <strong>Lưu ý:</strong> Giá trị xếp hạng có thể là Q1-Q4 cho Core/Scopus, 
          A*-C cho các loại khác, hoặc số thập phân cho CiteScore (VD: 1.25)
        </div>
      )}

      <FormInput
        label="Phí đánh giá bài báo (VND)"
        name="reviewFee"
        type="number"
        value={formData.reviewFee}
        onChange={(val) => handleChange("reviewFee", Number(val))}
        error={validationErrors.reviewFee}
        placeholder="VD: 500000"
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="allowListener"
          checked={formData.allowListener}
          onChange={(e) => handleChange("allowListener", e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="allowListener" className="text-sm font-medium">
          Cho phép người nghe tham dự (không nộp bài)
        </label>
      </div>
    </div>
  );
}