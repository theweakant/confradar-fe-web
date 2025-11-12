import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { toast } from "sonner";
import type {
  ResearchMaterial,
  ResearchRankingFile,
  ResearchRankingReference,
} from "@/types/conference.type";

interface MaterialsFormProps {
  materials: ResearchMaterial[];
  rankingFiles: ResearchRankingFile[];
  rankingReferences: ResearchRankingReference[];
  onMaterialsChange: (materials: ResearchMaterial[]) => void;
  onRankingFilesChange: (files: ResearchRankingFile[]) => void;
  onRankingReferencesChange: (refs: ResearchRankingReference[]) => void;
}

export function MaterialsForm({
  materials,
  rankingFiles,
  rankingReferences,
  onMaterialsChange,
  onRankingFilesChange,
  onRankingReferencesChange,
}: MaterialsFormProps) {
  const [newMaterial, setNewMaterial] = useState<ResearchMaterial>({
    fileName: "",
    fileDescription: "",
    file: null,
  });

  const [newRankingFile, setNewRankingFile] = useState<ResearchRankingFile>({
    fileUrl: "",
    file: null,
  });

  const [newRankingReference, setNewRankingReference] =
    useState<ResearchRankingReference>({
      referenceUrl: "",
    });

  // Materials Handlers
  const handleAddMaterial = () => {
    if (!newMaterial.fileName.trim()) {
      toast.error("Vui lòng nhập tên file!");
      return;
    }
    if (!newMaterial.file) {
      toast.error("Vui lòng chọn file!");
      return;
    }

    onMaterialsChange([...materials, newMaterial]);
    setNewMaterial({ fileName: "", fileDescription: "", file: null });
    toast.success("Đã thêm tài liệu!");
  };

  const handleRemoveMaterial = (index: number) => {
    onMaterialsChange(materials.filter((_, i) => i !== index));
    toast.success("Đã xóa tài liệu!");
  };

  // Ranking Files Handlers
  const handleAddRankingFile = () => {
    if (!newRankingFile.fileUrl && !newRankingFile.file) {
      toast.error("Vui lòng nhập URL hoặc chọn file!");
      return;
    }

    onRankingFilesChange([...rankingFiles, newRankingFile]);
    setNewRankingFile({ fileUrl: "", file: null });
    toast.success("Đã thêm file xếp hạng!");
  };

  const handleRemoveRankingFile = (index: number) => {
    onRankingFilesChange(rankingFiles.filter((_, i) => i !== index));
    toast.success("Đã xóa file xếp hạng!");
  };

  // Ranking References Handlers
  const handleAddRankingReference = () => {
    if (!newRankingReference.referenceUrl.trim()) {
      toast.error("Vui lòng nhập URL tham khảo!");
      return;
    }

    // Basic URL validation
    try {
      new URL(newRankingReference.referenceUrl);
    } catch {
      toast.error("URL không hợp lệ!");
      return;
    }

    onRankingReferencesChange([...rankingReferences, newRankingReference]);
    setNewRankingReference({ referenceUrl: "" });
    toast.success("Đã thêm URL tham khảo!");
  };

  const handleRemoveRankingReference = (index: number) => {
    onRankingReferencesChange(rankingReferences.filter((_, i) => i !== index));
    toast.success("Đã xóa URL tham khảo!");
  };

  return (
    <div className="space-y-6">
      {/* Research Materials Section */}
      <div className="border p-4 rounded">
        <h4 className="font-medium mb-3">
          Tài liệu nghiên cứu ({materials.length})
        </h4>

        {materials.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {materials.map((m, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-50 rounded border border-gray-200 hover:shadow-sm transition"
              >
                <div className="font-medium text-sm truncate" title={m.fileName}>
                  {m.fileName}
                </div>
                {m.fileDescription && (
                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {m.fileDescription}
                  </div>
                )}
                {m.file && (
                  <div className="text-xs text-blue-600 mt-1">
                    {m.file instanceof File ? m.file.name : "File attached"}
                  </div>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveMaterial(idx)}
                  className="w-full mt-2"
                >
                  Xóa
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add Material Form */}
        <div className="space-y-3 border-t pt-3">
          <h5 className="font-medium text-sm">Thêm tài liệu</h5>
          <FormInput
            label="Tên file"
            value={newMaterial.fileName}
            onChange={(val) => setNewMaterial({ ...newMaterial, fileName: val })}
            required
            placeholder="Template bài báo, Hướng dẫn..."
          />
          <FormTextArea
            label="Mô tả"
            value={newMaterial.fileDescription || ""}
            onChange={(val) => setNewMaterial({ ...newMaterial, fileDescription: val })}
            rows={2}
            placeholder="Mô tả ngắn gọn về file..."
          />
          <div>
            <label className="block text-sm font-medium mb-2">File *</label>
            <input
              type="file"
              onChange={(e) =>
                setNewMaterial({
                  ...newMaterial,
                  file: e.target.files?.[0] || null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <Button onClick={handleAddMaterial} className="w-full">
            + Thêm tài liệu
          </Button>
        </div>
      </div>

      {/* Ranking Files Section */}
      <div className="border p-4 rounded">
        <h4 className="font-medium mb-3">
          File xếp hạng ({rankingFiles.length})
        </h4>

        {rankingFiles.length > 0 && (
          <div className="space-y-2 mb-4">
            {rankingFiles.map((rf, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-50 rounded flex justify-between items-center hover:bg-gray-100 transition"
              >
                <div className="text-sm break-all flex-1">
                  {rf.fileUrl ||
                    (rf.file instanceof File ? rf.file.name : "File uploaded")}
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveRankingFile(idx)}
                  className="ml-2"
                >
                  Xóa
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add Ranking File Form */}
        <div className="space-y-3 border-t pt-3">
          <h5 className="font-medium text-sm">Thêm file xếp hạng</h5>
          <FormInput
            label="URL file (tùy chọn)"
            value={newRankingFile.fileUrl || ""}
            onChange={(val) => setNewRankingFile({ ...newRankingFile, fileUrl: val })}
          />
          <div>
            <label className="block text-sm font-medium mb-2">
              Hoặc upload file
            </label>
            <input
              type="file"
              onChange={(e) =>
                setNewRankingFile({
                  ...newRankingFile,
                  file: e.target.files?.[0] || null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <Button onClick={handleAddRankingFile} className="w-full">
            + Thêm file
          </Button>
        </div>
      </div>

      {/* Ranking References Section */}
      <div className="border p-4 rounded">
        <h4 className="font-medium mb-3">
          Tham khảo xếp hạng ({rankingReferences.length})
        </h4>

        {rankingReferences.length > 0 && (
          <div className="space-y-2 mb-4">
            {rankingReferences.map((rr, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-50 rounded flex justify-between items-center hover:bg-gray-100 transition"
              >
                <a
                  href={rr.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all flex-1"
                >
                  {rr.referenceUrl}
                </a>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveRankingReference(idx)}
                  className="ml-2"
                >
                  Xóa
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add Ranking Reference Form */}
        <div className="space-y-3 border-t pt-3">
          <h5 className="font-medium text-sm">Thêm URL tham khảo</h5>
          <FormInput
            label="URL"
            value={newRankingReference.referenceUrl}
            onChange={(val) => setNewRankingReference({ referenceUrl: val })}
            placeholder="https://ranking-website.com/..."
            required
          />
          <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
            <strong>Tip:</strong> Thêm link đến trang xếp hạng chính thức (CORE, Scopus, Web of Science, etc.)
          </div>
          <Button onClick={handleAddRankingReference} className="w-full">
            + Thêm URL
          </Button>
        </div>
      </div>
    </div>
  );
}