import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { ImageUpload } from "@/components/atoms/ImageUpload";
import { toast } from "sonner";
import type { Sponsor } from "@/types/conference.type";

interface SponsorFormProps {
  sponsors: Sponsor[];
  onSponsorsChange: (sponsors: Sponsor[]) => void;
}

export function SponsorForm({ sponsors, onSponsorsChange }: SponsorFormProps) {
  const [newSponsor, setNewSponsor] = useState<Sponsor>({
    name: "",
    imageFile: null,
  });
  const [resetSponsorUpload, setResetSponsorUpload] = useState(false);

  const handleAddSponsor = () => {
    if (!newSponsor.name || !newSponsor.imageFile) {
      toast.error("Vui lòng nhập tên và chọn logo!");
      return;
    }
    onSponsorsChange([...sponsors, newSponsor]);
    setNewSponsor({ name: "", imageFile: null });
    toast.success("Đã thêm nhà tài trợ!");
  };

  const handleRemoveSponsor = (index: number) => {
    onSponsorsChange(sponsors.filter((_, i) => i !== index));
    toast.success("Đã xóa nhà tài trợ!");
  };

  const handleEditSponsor = (sponsor: Sponsor, index: number) => {
    setNewSponsor(sponsor);
    onSponsorsChange(sponsors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Sponsor List */}
      {sponsors.length === 0 ? (
        <div className="p-3 bg-gray-50 text-gray-600 rounded text-sm">
          Chưa có nhà tài trợ nào. Bạn có thể bỏ qua hoặc thêm mới bên dưới.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {sponsors.map((s, idx) => (
            <div
              key={idx}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
            >
              {s.imageFile instanceof File ? (
                <img
                  src={URL.createObjectURL(s.imageFile)}
                  alt="Sponsor Preview"
                  className="h-20 w-20 object-cover rounded-full border border-gray-300 mb-2"
                />
              ) : typeof s.imageFile === "string" && s.imageFile ? (
                <img
                  src={s.imageFile}
                  alt={s.name}
                  className="h-20 w-20 object-cover rounded-full border border-gray-300 mb-2"
                />
              ) : (
                <div className="h-20 w-20 flex items-center justify-center bg-gray-100 rounded-full text-gray-400">
                  No Image
                </div>
              )}

              <div className="font-medium text-gray-800">{s.name}</div>
              <div className="text-xs text-gray-500 mb-2">
                {s.imageFile instanceof File
                  ? s.imageFile.name
                  : typeof s.imageFile === "string"
                    ? "Logo hiện tại"
                    : ""}
              </div>

              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => handleEditSponsor(s, idx)}>
                  Sửa
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleRemoveSponsor(idx)}>
                  Xóa
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Sponsor Form */}
      <div className="border p-4 rounded space-y-4">
        <h4 className="font-medium">Thêm nhà tài trợ</h4>
        <FormInput
          label="Tên nhà tài trợ"
          value={newSponsor.name}
          onChange={(val) => setNewSponsor({ ...newSponsor, name: val })}
        />
        <ImageUpload
          isList={false}
          height="h-32"
          onChange={(file) => setNewSponsor({ ...newSponsor, imageFile: file as File | null })}
          resetTrigger={resetSponsorUpload}
        />

        <Button
          onClick={() => {
            handleAddSponsor();
            setResetSponsorUpload(true);
            setTimeout(() => setResetSponsorUpload(false), 200);
          }}
          className="w-full"
        >
          Thêm nhà tài trợ
        </Button>
      </div>
    </div>
  );
}