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

  onRemoveMaterial?: (materialId: string) => void;
  onRemoveRankingFile?: (rankingFileId: string) => void;
  onRemoveRankingReference?: (rankingReferenceId: string) => void;
}

export function MaterialsForm({
  materials,
  rankingFiles,
  rankingReferences,
  onMaterialsChange,
  onRankingFilesChange,
  onRankingReferencesChange,
  onRemoveMaterial,
  onRemoveRankingFile,
  onRemoveRankingReference
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
    const material = materials[index];
    const updatedList = materials.filter((_, i) => i !== index);
    onMaterialsChange(updatedList);

    if (onRemoveMaterial && material.materialId) {
      onRemoveMaterial(material.materialId);
    }

    toast.success("Đã xóa tài liệu!");
  };

  // ✅ Update file cho material đã tồn tại
  const handleUpdateMaterialFile = (index: number, file: File) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], file };
    onMaterialsChange(updated);
    toast.success(`Đã chọn file mới: ${file.name}`);
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
    const file = rankingFiles[index];
    const updatedList = rankingFiles.filter((_, i) => i !== index);
    onRankingFilesChange(updatedList);

    if (onRemoveRankingFile && file.rankingFileId) {
      onRemoveRankingFile(file.rankingFileId);
    }

    toast.success("Đã xóa file xếp hạng!");
  };

  // ✅ Update file cho ranking file đã tồn tại
  const handleUpdateRankingFile = (index: number, file: File) => {
    const updated = [...rankingFiles];
    updated[index] = { ...updated[index], file };
    onRankingFilesChange(updated);
    toast.success(`Đã chọn file mới: ${file.name}`);
  };

  // Ranking References Handlers
  const handleAddRankingReference = () => {
    if (!newRankingReference.referenceUrl.trim()) {
      toast.error("Vui lòng nhập URL tham khảo!");
      return;
    }

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
    const ref = rankingReferences[index];
    const updatedList = rankingReferences.filter((_, i) => i !== index);
    onRankingReferencesChange(updatedList);

    if (onRemoveRankingReference && ref.rankingReferenceId) {
      onRemoveRankingReference(ref.rankingReferenceId);
    }

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
                
                {/* ✅ Hiển thị file hiện tại */}
                <div className="mt-2 text-xs">
                  {m.file instanceof File ? (
                    <div className="text-blue-600">📎 {m.file.name}</div>
                  ) : m.fileUrl ? (
                    <a 
                      href={m.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-block"
                    >
                      📎 Xem file hiện tại
                    </a>
                  ) : null}
                </div>
                
                {/* ✅ Cho phép thay đổi file nếu đã tồn tại */}
                {m.materialId && (
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      Thay đổi file:
                    </label>
                    <input
                      type="file"
                      accept=".doc,.docx,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpdateMaterialFile(idx, file);
                      }}
                      className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                    />
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
              accept=".doc,.docx,.pdf"
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
                className="p-3 bg-gray-50 rounded border border-gray-200"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    {rf.file instanceof File ? (
                      <div className="text-sm text-blue-600">📎 {rf.file.name}</div>
                    ) : rf.fileUrl ? (
                      <a
                        href={rf.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        📎 {rf.fileUrl}
                      </a>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveRankingFile(idx)}
                  >
                    Xóa
                  </Button>
                </div>

                {/* ✅ Cho phép thay đổi file */}
                {rf.rankingFileId && (
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      Thay đổi file:
                    </label>
                    <input
                      type="file"
                      accept=".doc,.docx,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpdateRankingFile(idx, file);
                      }}
                      className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Ranking File Form */}
        <div className="space-y-3 border-t pt-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload file
            </label>
            <input
              type="file"
              accept=".doc,.docx,.pdf"
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