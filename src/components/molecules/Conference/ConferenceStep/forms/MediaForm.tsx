import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/atoms/ImageUpload";
import { toast } from "sonner";
import type { Media } from "@/types/conference.type";
import { useStepNavigation } from "../hooks/useStepNavigation";

interface MediaFormProps {
  mediaList: Media[];
  onMediaListChange: (mediaList: Media[]) => void;
  onRemoveMedia?: (mediaId: string) => void;
}

export function MediaForm({ mediaList, onMediaListChange, onRemoveMedia }: MediaFormProps) {
  const { currentStep, isStepCompleted, handleUnmarkCompleted } = useStepNavigation();

  const [newMedia, setNewMedia] = useState<Media>({ mediaFile: null });

  useEffect(() => {
    if (isStepCompleted(currentStep)) {
      handleUnmarkCompleted(currentStep);
    }
  }, [mediaList]);

  const handleAddMedia = () => {
    if (!newMedia.mediaFile) {
      toast.error("Vui lòng chọn file media!");
      return;
    }
    onMediaListChange([...mediaList, newMedia]);
    setNewMedia({ mediaFile: null });
    toast.success("Đã thêm media!");
  };

  // const handleRemoveMedia = (index: number) => {
  //   const media = mediaList[index];

  //   if (onRemoveMedia && media.mediaId) {
  //     onRemoveMedia(media.mediaId);
  //   } else {
  //     onMediaListChange(mediaList.filter((_, i) => i !== index));
  //     toast.success("Đã xóa media!");
  //   }
  // };

  const handleRemoveMedia = (index: number) => {
  const media = mediaList[index];

  const updatedList = mediaList.filter((_, i) => i !== index);
  onMediaListChange(updatedList);

  if (onRemoveMedia && media.mediaId) {
    onRemoveMedia(media.mediaId);
  }

  toast.success("Đã xóa media!");
};

  return (
    <div className="space-y-4">
      {mediaList.length === 0 ? (
        <div className="p-4 bg-gray-50 text-gray-600 rounded-lg text-sm border border-gray-200 text-center mb-8">
          Chưa có media nào. Bạn có thể bỏ qua hoặc thêm mới bên dưới.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {mediaList.map((m, idx) => (
            <div
              key={idx}
              className="relative bg-white border border-gray-300 rounded-lg p-3 shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
            >
              {m.mediaFile && (
                <>
                  {m.mediaFile instanceof File ? (
                    <img
                      src={URL.createObjectURL(m.mediaFile)}
                      alt="Media Preview"
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                  ) : typeof m.mediaFile === "string" && (m.mediaFile as string).length > 0 ? (
                    <img
                      src={m.mediaFile}
                      alt="Media"
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                  ) : null}
                </>
              )}

              <div className="text-sm text-gray-700 truncate w-full">
                {m.mediaFile instanceof File
                  ? m.mediaFile.name
                  : typeof m.mediaFile === "string"
                    ? "Ảnh/Video hiện tại"
                    : "No file"}
              </div>

              <button
                onClick={() => handleRemoveMedia(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border border-gray-200 p-4 rounded-xl space-y-4">
        <h4 className="font-medium text-gray-800">Thêm media</h4>
        <ImageUpload
          label="Upload media (ảnh hoặc video)"
          subtext="(4MB max)"
          isList={false}
          onChange={(file) => setNewMedia({ ...newMedia, mediaFile: file as File | null })}
        />
        <Button onClick={handleAddMedia} className="w-full">
          Thêm media
        </Button>
      </div>
    </div>
  );
}