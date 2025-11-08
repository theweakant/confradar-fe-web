import { useState } from "react";
import {
  useCreateDestinationMutation,
  useUpdateDestinationMutation,
} from "@/redux/services/destination.service";
import type {
  DestinationFormData,
  Destination,
} from "@/types/destination.type";
import { toast } from "sonner";

export const useDestinationForm = (destination?: Destination | null) => {
  const [createDestination] = useCreateDestinationMutation();
  const [updateDestination] = useUpdateDestinationMutation();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (data: DestinationFormData) => {
    try {
      setLoading(true);
      setError(null);

      if (destination) {
        await updateDestination({
          id: destination.destinationId,
          data,
        }).unwrap();
      } else {
        await createDestination(data).unwrap();
      }

      setSuccess(true);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra, vui lòng thử lại!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return { handleSave, loading, success, error };
};
