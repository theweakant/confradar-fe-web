import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { ImageUpload } from "@/components/atoms/ImageUpload";
import { toast } from "sonner";
import type { Speaker } from "@/types/conference.type";

interface SpeakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (speaker: Speaker) => void;
}

export function SpeakerModal({ isOpen, onClose, onAdd }: SpeakerModalProps) {
  const [newSpeaker, setNewSpeaker] = useState<
    Omit<Speaker, "image"> & { image: File | null }
  >({
    name: "",
    description: "",
    image: null,
  });

  const handleAdd = () => {
    if (!newSpeaker.name.trim()) {
      toast.error("Vui lòng nhập tên diễn giả!");
      return;
    }

    if (!newSpeaker.image) {
      toast.error("Vui lòng chọn ảnh diễn giả!");
      return;
    }

    onAdd(newSpeaker as Speaker);

    // Reset form
    setNewSpeaker({ name: "", description: "", image: null });
    toast.success("Đã thêm diễn giả!");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Thêm diễn giả</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <FormInput
            label="Tên diễn giả"
            value={newSpeaker.name}
            onChange={(val) => setNewSpeaker({ ...newSpeaker, name: val })}
            placeholder="VD: Nguyễn Văn A"
            required
          />

          <FormTextArea
            label="Mô tả"
            value={newSpeaker.description}
            onChange={(val) =>
              setNewSpeaker({ ...newSpeaker, description: val })
            }
            rows={2}
            placeholder="Chức vụ, kinh nghiệm..."
          />

          <ImageUpload
            label="Ảnh diễn giả"
            subtext="Dưới 4MB, định dạng PNG hoặc JPG"
            maxSizeMB={4}
            height="h-32"
            onChange={(file) =>
              setNewSpeaker({ ...newSpeaker, image: file as File | null })
            }
          />

          <div className="flex gap-3 mt-6">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Hủy
            </Button>
            <Button onClick={handleAdd} className="flex-1">
              Thêm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}